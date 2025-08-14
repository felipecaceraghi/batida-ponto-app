import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

interface PunchResponse {
  success?: boolean;
  error?: string;
  punch?: { id: number; timestamp: string; ip: string; userId: number };
}

export default function Dashboard() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [buttonDisabled, setButtonDisabled] = useState(false);

  useEffect(() => {
    // Retrieve credentials from localStorage; redirect to login if missing.
    const storedEmail = typeof window !== 'undefined' ? localStorage.getItem('email') : null;
    const storedPassword = typeof window !== 'undefined' ? localStorage.getItem('password') : null;
    if (!storedEmail || !storedPassword) {
      router.replace('/');
    } else {
      setEmail(storedEmail);
      setPassword(storedPassword);
    }
  }, [router]);

  async function handlePunch() {
    if (!email || !password) return;
    setMessage('');
    setButtonDisabled(true);
    try {
      const res = await fetch('/api/punch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data: PunchResponse = await res.json();
      if (data.success) {
        setMessage('Batida registrada com sucesso!');
      } else {
        setMessage(data.error || 'Erro ao registrar batida');
      }
    } catch (err) {
      console.error(err);
      setMessage('Erro ao conectar ao servidor');
    }
    // Whether success or failure, do not allow additional punches from this session.
    setButtonDisabled(true);
  }

  function handleLogout() {
    localStorage.removeItem('email');
    localStorage.removeItem('password');
    router.replace('/');
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h1>Bem-vindo</h1>
      <p>Usuário: {email}</p>
      <button onClick={handlePunch} disabled={buttonDisabled} style={{ padding: '0.5rem', cursor: buttonDisabled ? 'not-allowed' : 'pointer', marginBottom: '1rem' }}>
        Registrar batida de ponto
      </button>
      {message && <p>{message}</p>}
      <button onClick={handleLogout} style={{ marginTop: '1rem', padding: '0.5rem' }}>Sair</button>
    </div>
  );
}
