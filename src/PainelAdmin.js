// src/PainelAdmin.js
import React, { useEffect, useState } from "react";
import * as XLSX from "xlsx";
import { supabase } from "./supabaseClient";

export default function PainelAdmin() {
  const [empresas, setEmpresas] = useState([]);
  const [empresaId, setEmpresaId] = useState("");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    const run = async () => {
      const { data } = await supabase
        .from("empresas")
        .select("id, nome_empresa")
        .order("nome_empresa", { ascending: true });
      setEmpresas(data || []);
    };
    run();
  }, []);

  const parseSheet = (wb, name) => {
    const ws = wb.Sheets[name];
    if (!ws) return null;
    // mesmo padrão usado hoje: 2D array
    return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true });
  };

  const handleUpload = async () => {
    if (!empresaId) {
      setMsg("Selecione uma empresa.");
      return;
    }
    if (!file) {
      setMsg("Selecione um arquivo Excel (RESULTADOS.xlsx).");
      return;
    }

    try {
      setBusy(true);
      setMsg("");

      const arrayBuffer = await file.arrayBuffer();
      const wb = XLSX.read(arrayBuffer, { type: "array" });

      // 1) DRE (planilha 'DRE') -> dre_resultados
      const dreArr = parseSheet(wb, "DRE");
      if (dreArr) {
        await supabase.from("dre_resultados").insert([{
          empresa_id: empresaId,
          dados_json: dreArr
        }]);
      }

      // 2) Ponto de Equilíbrio (planilha 'INDICADORES') -> indicadores_resultados
      const peArr = parseSheet(wb, "INDICADORES");
      if (peArr) {
        await supabase.from("indicadores_resultados").insert([{
          empresa_id: empresaId,
          dados_json: peArr
        }]);
      }

      // 3) NOVO: Indicadores Extras (planilha 'INDICADORES_EXTRAS') -> indicadores_extras
      const extrasArr = parseSheet(wb, "INDICADORES_EXTRAS");
      if (extrasArr && extrasArr.length) {
        await supabase.from("indicadores_extras").insert([{
          empresa_id: empresaId,
          dados_json: extrasArr
        }]);
      }

      setMsg("Arquivo processado com sucesso!");
    } catch (e) {
      console.error(e);
      setMsg("Erro ao processar planilha. Verifique o arquivo e tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="container">
      <h1>Painel Administrativo</h1>

      <div className="form-row">
        <label>Selecione a empresa:</label>
        <select
          value={empresaId}
          onChange={(e) => setEmpresaId(e.target.value)}
        >
          <option value="">-- Escolha uma empresa --</option>
          {empresas.map((e) => (
            <option key={e.id} value={e.id}>
              {e.nome_empresa}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(ev) => setFile(ev.target.files?.[0] ?? null)}
        />
        <button disabled={busy} onClick={handleUpload}>
          {busy ? "Enviando..." : "Enviar"}
        </button>
      </div>

      {msg && <p>{msg}</p>}

      <p style={{ marginTop: 16, opacity: 0.75 }}>
        • A planilha deve conter as abas: <b>DRE</b>, <b>INDICADORES</b> (Ponto de
        Equilíbrio) e <b>INDICADORES_EXTRAS</b> (Indicadores).  
        • O conteúdo é salvo como matriz (linhas/colunas).
      </p>
    </div>
  );
}
