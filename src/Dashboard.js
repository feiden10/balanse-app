// src/Dashboard.js

import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useNavigate, Link } from 'react-router-dom';

export default function Dashboard() {
  const [dadosDRE, setDadosDRE] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [usuarioEmail, setUsuarioEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarDados() {
      const { data: { user }, error: erroUsuarioAuth } = await supabase.auth.getUser();
      if (erroUsuarioAuth || !user) {
        console.error('Erro ao obter usuário autenticado:', erroUsuarioAuth);
        navigate('/login');
        return;
      }

      setUsuarioEmail(user.email);

      const { data: usuarios, error: erroUsuario } = await supabase
        .from('usuarios')
        .select('*, empresa:empresa_id(*)')
        .eq('email', user.email);

      if (erroUsuario || !usuarios || usuarios.length === 0) {
        console.error('Usuário não encontrado ou sem empresa vinculada.', erroUsuario);
        return;
      }

      const empresaAtual = usuarios[0].empresa;
      setEmpresa(empresaAtual);

      const { data: resultados, error: erroDRE } = await supabase
        .from('dre_resultados')
        .select('*')
        .eq('empresa_id', empresaAtual.id)
        .order('data_envio', { ascending: false })
        .limit(1);

      if (erroDRE) {
        console.error('Erro ao buscar dados da DRE:', erroDRE);
        return;
      }

      if (resultados.length > 0) {
        setDadosDRE(resultados[0].dados_json);
      }
    }

    carregarDados();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const formatarNumero = (valor, coluna) => {
    if (typeof valor !== 'number') return valor;
    if (coluna.trim() === '%' || coluna.toUpperCase().includes('%')) {
      return (valor * 100).toFixed(2).replace('.', ',') + '%';
    }
    if (coluna.toUpperCase() === 'CONTA') return valor;
    return valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    });
  };

  const getEstiloCelula = (valor, coluna) => {
    if (typeof valor === 'number' && valor < 0 && coluna.toUpperCase() !== 'CONTA') {
      return { color: 'red' };
    }
    return {};
  };

  const obterEstiloLinha = (descricao) => {
    if (!descricao) return {};
    const desc = descricao.toUpperCase();
    if (desc === 'DESPESAS - FILIAL - PESSOAL') return {};
    if (desc.includes('RESULTADO LÍQUIDO')) {
      return { backgroundColor: '#fff176', fontWeight: 'bold', borderTop: '2px solid #000' };
    }
    if (desc.includes('RESULTADO BRUTO') || desc.includes('RESULTADO COM MERCADORIAS')) {
      return { backgroundColor: '#ffff00', fontWeight: 'bold' };
    }
    if (
      desc === 'DESPESAS OPERACIONAIS' ||
      desc.startsWith('DESPESAS -') ||
      desc.startsWith('RECEITAS') ||
      desc.startsWith('CUSTOS VARIÁVEIS')
    ) {
      return { backgroundColor: '#c8e6c9', fontWeight: 'bold' };
    }
    return {};
  };

  const gerarNomeArquivo = (extensao = 'pdf') => {
    const nome = empresa?.nome_empresa?.toUpperCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const agora = new Date();
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const nomeMes = meses[agora.getMonth()];
    const ano = agora.getFullYear();
    return `DRE-${nome}-${nomeMes}-${ano}.${extensao}`;
  };

  const exportarPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const titulo = `DRE - ${empresa?.nome_empresa || ''}`;
    const headers = dadosDRE[0];
    const corpo = dadosDRE.slice(1);

    autoTable(doc, {
      head: [headers],
      body: corpo.map(linha => linha.map((v, i) => formatarNumero(v, headers[i]))),
      startY: 20,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [240, 240, 240] },
      didParseCell: (data) => {
        const rowIndex = data.row.index;
        const colIndex = data.column.index;
        const valorOriginal = corpo[rowIndex][colIndex];
        const descricao = corpo[rowIndex][headers.indexOf('DEMONSTRAÇÃO DO RESULTADO')];
        const estiloLinha = obterEstiloLinha(descricao);

        if (estiloLinha?.backgroundColor) {
          data.cell.styles.fillColor = estiloLinha.backgroundColor.replace('#', '').match(/.{1,2}/g).map(hex => parseInt(hex, 16));
        }

        if (estiloLinha?.fontWeight === 'bold') {
          data.cell.styles.fontStyle = 'bold';
        }

        if (typeof valorOriginal === 'number' && valorOriginal < 0) {
          data.cell.styles.textColor = [255, 0, 0];
        }
      }
    });

    doc.text(titulo, 14, 10);
    doc.save(gerarNomeArquivo('pdf'));
  };

  const exportarExcel = () => {
    const headers = dadosDRE[0];
    const corpo = dadosDRE.slice(1).map((linha) =>
      linha.map((valor, i) => formatarNumero(valor, headers[i]))
    );
    const planilha = [headers, ...corpo];
    const ws = XLSX.utils.aoa_to_sheet(planilha);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'DRE');

    const arquivoExcel = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([arquivoExcel], { type: 'application/octet-stream' }), gerarNomeArquivo('xlsx'));
  };

  return (
    <div className="container" style={{ padding: '1rem', maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Painel da Empresa</h2>
        <div>
          <span style={{ fontSize: '0.9rem', marginRight: '1rem' }}>👤 {usuarioEmail}</span>
          <Link to="/dashboard" style={{ marginRight: '1rem', fontWeight: 'bold', textDecoration: 'none' }}>
            DRE
          </Link>
          <Link to="/indicadores" style={{ marginRight: '1rem', fontWeight: 'bold', textDecoration: 'none' }}>
            Indicadores
          </Link>
          <button
            onClick={logout}
            style={{ background: '#e53935', color: '#fff', border: 'none', padding: '5px 10px', borderRadius: '4px' }}
          >
            Sair
          </button>
        </div>
      </div>

      {empresa && <p><strong>Empresa:</strong> {empresa.nome_empresa}</p>}
      <h3 style={{ marginTop: '-0.5rem', marginBottom: '1rem', fontWeight: 'normal', color: '#555' }}>DRE</h3>

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={exportarPDF} style={{ marginRight: '10px' }}>📄 Exportar PDF</button>
        <button onClick={exportarExcel}>📊 Exportar Excel</button>
      </div>

      {Array.isArray(dadosDRE) && dadosDRE.length > 1 ? (
        <div style={{ overflowX: 'auto', maxHeight: '80vh' }}>
          <table style={{
            fontSize: '12px',
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '1000px'
          }} border="1" cellPadding="5">
            <thead>
              <tr>
                {dadosDRE[0].map((coluna, index) => (
                  <th
                    key={index}
                    style={{
                      backgroundColor: '#f0f0f0',
                      position: 'sticky',
                      top: 0,
                      zIndex: 1
                    }}
                  >
                    {coluna}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dadosDRE.slice(1).map((linha, i) => {
                const descricao = linha[dadosDRE[0].indexOf('DEMONSTRAÇÃO DO RESULTADO')];
                const estiloLinha = obterEstiloLinha(descricao);

                return (
                  <tr key={i} style={estiloLinha}>
                    {linha.map((valor, j) => (
                      <td key={j} style={getEstiloCelula(valor, dadosDRE[0][j])}>
                        {formatarNumero(valor, dadosDRE[0][j])}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Nenhum dado encontrado.</p>
      )}
    </div>
  );
}
