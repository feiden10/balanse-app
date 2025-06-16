// src/Login.js

import React, { useState } from 'react';
import { supabase } from './supabaseClient';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErro('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    });

    if (error) {
      console.error('Erro ao fazer login:', error);
      setErro('Usuário ou senha inválidos.');
    } else {
      const { data: usuarios, error: erroUsuarios } = await supabase
        .from('usuarios')
        .select('admin')
        .eq('email', email);

      const admin = usuarios && usuarios.length > 0 && usuarios[0].admin === true;

      // Corrigido: salvar com os nomes usados no App.js
      localStorage.setItem('usuario', email);
      localStorage.setItem('admin', admin ? 'true' : 'false');

      // Redirecionamento garantido, inclusive em PWA
      window.location.href = admin ? '/#/admin' : '/#/dashboard';
    }
  };

  return (
    <div className="container">
      <h2>Login do Cliente</h2>
      <form onSubmit={handleLogin}>
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
        <button type="submit">Entrar</button>
      </form>
      {erro && <p style={{ color: 'red' }}>{erro}</p>}
    </div>
  );
}
