import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setMessage('');
    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.success) {
        // Store credentials in localStorage for the subsequent punch page.
        // In a real application you would implement a proper session or JWT.
        localStorage.setItem('email', email);
        localStorage.setItem('password', password);
        router.push('/dashboard');
      } else {
        setMessage(data.error || 'Erro desconhecido');
      }
    } catch (err) {
      console.error(err);
      setMessage('Erro ao conectar ao servidor');
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h1>Login</h1>
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu email"
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>
        <label>
          Senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Sua senha"
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>
        <button type="submit" style={{ padding: '0.5rem', cursor: 'pointer' }}>Entrar</button>
      </form>
      {message && <p style={{ color: 'red', marginTop: '1rem' }}>{message}</p>}
      <div style={{ marginTop: '1rem' }}>
        <a href="/reset">Esqueci minha senha</a>
      </div>
    </div>
  );
}
