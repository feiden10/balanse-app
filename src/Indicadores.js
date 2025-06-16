// src/Indicadores.js

import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { useNavigate, Link } from 'react-router-dom';

export default function Indicadores() {
  const [dados, setDados] = useState([]);
  const [empresa, setEmpresa] = useState(null);
  const [usuarioEmail, setUsuarioEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function carregarDados() {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error || !user) {
        navigate('/login');
        return;
      }

      setUsuarioEmail(user.email);

      const { data: usuarios } = await supabase
        .from('usuarios')
        .select('*, empresa:empresa_id(*)')
        .eq('email', user.email);

      if (!usuarios || usuarios.length === 0) return;

      const empresaAtual = usuarios[0].empresa;
      setEmpresa(empresaAtual);

      const { data: resultados } = await supabase
        .from('indicadores_resultados')
        .select('*')
        .eq('empresa_id', empresaAtual.id)
        .order('data_envio', { ascending: false })
        .limit(1);

      if (resultados && resultados.length > 0) {
        setDados(resultados[0].dados_json);
      }
    }

    carregarDados();
  }, [navigate]);

  const logout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  const formatarValor = (valor, linhaIndex) => {
    if (typeof valor === 'number') {
      const linha = linhaIndex + 1;
      if ([7, 8, 9].includes(linha)) {
        return (valor * 100).toFixed(2).replace('.', ',') + '%';
      }
      if ([33, 34, 35].includes(linha)) {
        return valor.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
      }
      return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
    return valor;
  };

  const linhasNegrito = [6, 8, 11, 13, 16, 18, 20, 22, 28, 30];

  const getEstiloCelula = (valor, coluna, linhaIndex, colIndex) => {
    const isNegativo = typeof valor === 'number' && valor < 0 && coluna.toUpperCase() !== 'CONTA';
    const aplicarNegrito = linhasNegrito.includes(linhaIndex + 1);
    return {
      color: isNegativo ? 'red' : undefined,
      fontWeight: aplicarNegrito ? 'bold' : 'normal'
    };
  };

  const obterEstiloLinha = (linha, i) => {
    const index = i + 1;
    if (index >= 1 && index <= 6) return { backgroundColor: '#e5fbe5' };
    if (index >= 7 && index <= 9) return { backgroundColor: '#d6eaf8' };
    if (index >= 10 && index <= 14) return { backgroundColor: '#f5e5dc' };
    if (index >= 15 && index <= 23) return { backgroundColor: '#eeeeee' };
    if (index >= 24 && index <= 26) return { backgroundColor: '#e5fbe5' };
    if (index >= 27 && index <= 31) return { backgroundColor: '#d6eaf8' };
    if (index >= 32 && index <= 34) return { backgroundColor: '#a5d6a7' };
    return {};
  };

  const gerarNomeArquivo = (extensao = 'pdf') => {
    const nome = empresa?.nome_empresa?.toUpperCase().replace(/\s+/g, '-').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const agora = new Date();
    const meses = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const nomeMes = meses[agora.getMonth()];
    const ano = agora.getFullYear();
    return `INDICADORES-${nome}-${nomeMes}-${ano}.${extensao}`;
  };

  const exportarPDF = () => {
    const doc = new jsPDF('l', 'mm', 'a4');
    const headers = dados[0];
    const corpo = dados.slice(1).map((linha, i) =>
      linha.map((valor) => formatarValor(valor, i))
    );

    autoTable(doc, {
      head: [headers],
      body: corpo,
      startY: 20,
      styles: { fontSize: 7 },
      headStyles: { fillColor: [240, 240, 240] },
      didParseCell: (data) => {
        const rowIndex = data.row.index;
        const colIndex = data.column.index;
        const linha = rowIndex + 1;

        const corLinha = obterEstiloLinha([], rowIndex).backgroundColor;
        const aplicarNegrito = linhasNegrito.includes(linha);

        if (corLinha) {
          data.cell.styles.fillColor = corLinha.replace('#', '').match(/.{1,2}/g).map(hex => parseInt(hex, 16));
        }

        if (aplicarNegrito) {
          data.cell.styles.fontStyle = 'bold';
        }

        const valorOriginal = dados[linha]?.[colIndex];
        if (typeof valorOriginal === 'number' && valorOriginal < 0) {
          data.cell.styles.textColor = [255, 0, 0];
        }
      }
    });

    doc.text(`Indicadores - ${empresa?.nome_empresa || ''}`, 14, 10);
    doc.save(gerarNomeArquivo('pdf'));
  };

  const exportarExcel = () => {
    const headers = dados[0];
    const corpo = dados.slice(1).map((linha, i) =>
      linha.map((valor) => formatarValor(valor, i))
    );
    const planilha = [headers, ...corpo];
    const ws = XLSX.utils.aoa_to_sheet(planilha);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Indicadores');

    const arquivoExcel = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([arquivoExcel], { type: 'application/octet-stream' }), gerarNomeArquivo('xlsx'));
  };

  return (
    <div className="container" style={{ padding: '1rem', maxWidth: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Indicadores</h2>
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

      <div style={{ marginBottom: '1rem' }}>
        <button onClick={exportarPDF} style={{ marginRight: '10px' }}>📄 Exportar PDF</button>
        <button onClick={exportarExcel}>📊 Exportar Excel</button>
      </div>

      {Array.isArray(dados) && dados.length > 1 ? (
        <div style={{ overflowX: 'auto', maxHeight: '80vh' }}>
          <table style={{
            fontSize: '12px',
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '1000px'
          }} border="1" cellPadding="5">
            <thead>
              <tr>
                {dados[0].map((coluna, index) => (
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
              {dados.slice(1).map((linha, i) => (
                <tr key={i} style={obterEstiloLinha(linha, i)}>
                  {linha.map((valor, j) => (
                    <td key={j} style={getEstiloCelula(valor, dados[0][j], i, j)}>
                      {formatarValor(valor, i)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Nenhum dado encontrado.</p>
      )}
    </div>
  );
}
