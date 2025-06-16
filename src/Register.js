// src/Register.js

import React, { useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [mensagem, setMensagem] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setMensagem('');

    const { error } = await supabase.auth.signUp({
      email,
      password: senha,
    });

    if (error) {
      setMensagem('Erro ao registrar: ' + error.message);
    } else {
      setMensagem('Usuário registrado! Verifique seu e-mail.');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    }
  };

  return (
    <div className="container">
      <h2>Cadastro</h2>
      <form onSubmit={handleRegister}>
        <input
          type="email"
          placeholder="Seu e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Sua senha"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          required
        />
        <button type="submit">Cadastrar</button>
      </form>
      {mensagem && <p>{mensagem}</p>}
    </div>
  );
}
