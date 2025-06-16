// src/PainelAdmin.js

import React, { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import * as XLSX from 'xlsx';

export default function PainelAdmin() {
  const [empresas, setEmpresas] = useState([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState('');
  const [mensagem, setMensagem] = useState('');

  useEffect(() => {
    async function carregarEmpresas() {
      const { data, error } = await supabase.from('empresas').select('id, nome_empresa');
      if (!error) setEmpresas(data);
      else console.error('Erro ao carregar empresas:', error);
    }
    carregarEmpresas();
  }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !empresaSelecionada) {
      alert('Selecione um arquivo e uma empresa.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      const abaDRE = workbook.SheetNames.find(name => name.toUpperCase().includes('DRE'));
      const abaINDICADORES = workbook.SheetNames.find(name => name.toUpperCase().includes('INDICADOR'));

      const dreSheet = workbook.Sheets[abaDRE];
      const indicadoresSheet = workbook.Sheets[abaINDICADORES];

      if (!dreSheet || !indicadoresSheet) {
        setMensagem('A planilha deve conter as abas "DRE" e "INDICADORES".');
        return;
      }

      const dreData = XLSX.utils.sheet_to_json(dreSheet, { header: 1, defval: '' });
      const indicadoresData = XLSX.utils.sheet_to_json(indicadoresSheet, { header: 1, defval: '' });

      const { error: erroDRE } = await supabase.from('dre_resultados').insert([
        {
          empresa_id: empresaSelecionada,
          dados_json: dreData,
          data_envio: new Date().toISOString(),
        },
      ]);

      const { error: erroIndicadores } = await supabase.from('indicadores_resultados').insert([
        {
          empresa_id: empresaSelecionada,
          dados_json: indicadoresData,
          data_envio: new Date().toISOString(),
        },
      ]);

      if (erroDRE || erroIndicadores) {
        setMensagem('Erro ao salvar dados.');
        console.error('Erro DRE:', erroDRE);
        console.error('Erro Indicadores:', erroIndicadores);
      } else {
        setMensagem('Dados salvos com sucesso.');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h2>Painel Administrativo</h2>

      <label>Selecione a empresa:</label>
      <select onChange={(e) => setEmpresaSelecionada(e.target.value)} value={empresaSelecionada}>
        <option value="">-- Escolha uma empresa --</option>
        {empresas.map((emp) => (
          <option key={emp.id} value={emp.id}>{emp.nome_empresa}</option>
        ))}
      </select>

      <input type="file" accept=".xlsx, .xls" onChange={handleUpload} style={{ display: 'block', marginTop: '1rem' }} />

      {mensagem && (
        <p style={{ color: mensagem.includes('Erro') ? 'red' : 'green', marginTop: '1rem' }}>
          {mensagem}
        </p>
      )}
    </div>
  );
}
