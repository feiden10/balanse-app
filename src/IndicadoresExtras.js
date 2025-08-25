// src/IndicadoresExtras.js
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function is2DArray(data) {
  return Array.isArray(data) && data.every(row => Array.isArray(row));
}

function Grid({ data }) {
  return (
    <div className="tabela-wrapper">
      <table className="tabela">
        <tbody>
          {data.map((row, rIdx) => (
            <tr key={rIdx}>
              {row.map((cell, cIdx) => (
                <td key={cIdx}>{cell === null || cell === undefined ? "" : String(cell)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function KeyValue({ data }) {
  const entries = Object.entries(data);
  return (
    <div className="cards">
      {entries.map(([k, v]) => (
        <div className="card" key={k}>
          <div className="kv-key">{k}</div>
          <div className="kv-val">{String(v ?? "")}</div>
        </div>
      ))}
    </div>
  );
}

export default function IndicadoresExtras() {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState(null);
  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: empresaData } = await supabase
        .from("usuarios")
        .select("empresa_id, empresas(nome_empresa)")
        .eq("email", user.email)
        .single();

      setEmpresa(empresaData?.empresas?.nome_empresa ?? null);
      const empresaId = empresaData?.empresa_id;
      if (!empresaId) return;

      const { data, error } = await supabase
        .from("indicadores_extras")   // << TABELA NOVA
        .select("dados_json")
        .eq("empresa_id", empresaId)
        .order("data_envio", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setDados(data.dados_json);
      }
      setLoading(false);
    };
    run();
  }, []);

  return (
    <div className="container">
      <h1>Indicadores {empresa ? `– ${empresa}` : ""}</h1>
      {loading && <p>Carregando…</p>}
      {!loading && dados && (
        <>
          {is2DArray(dados) ? <Grid data={dados} /> : <KeyValue data={dados} />}
        </>
      )}
      {!loading && !dados && <p>Nenhum dado encontrado.</p>}
    </div>
  );
}
