// src/PontoDeEquilibrio.js
import React, { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

function render2DGrid(arr) {
  if (!Array.isArray(arr)) return null;

  return (
    <div className="tabela-wrapper">
      <table className="tabela">
        <tbody>
          {arr.map((row, rIdx) => (
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

export default function PontoDeEquilibrio() {
  const [loading, setLoading] = useState(true);
  const [dados, setDados] = useState(null);
  const [empresa, setEmpresa] = useState(null);

  useEffect(() => {
    const run = async () => {
      setLoading(true);

      // pega empresa logada (a mesma lógica que você já usa em Dashboard/Indicadores)
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
        .from("indicadores_resultados") // << TABELA JÁ EXISTENTE
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
      <h1>Ponto de Equilíbrio {empresa ? `– ${empresa}` : ""}</h1>
      {loading ? <p>Carregando…</p> : render2DGrid(dados)}
    </div>
  );
}
