import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';

export default function ChangePassword() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMessage('');
  }, [password, confirmPassword]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!token || typeof token !== 'string') {
      setMessage('Token inválido');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('As senhas não conferem');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Senha atualizada com sucesso. Você pode fazer login com a nova senha.');
      } else {
        setMessage(data.error || 'Falha ao atualizar a senha');
      }
    } catch (err) {
      console.error(err);
      setMessage('Erro ao conectar ao servidor');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h1>Alterar senha</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label>
          Nova senha
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nova senha"
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>
        <label>
          Confirmar senha
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirme a nova senha"
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>
        <button type="submit" style={{ padding: '0.5rem', cursor: 'pointer' }} disabled={submitting}>
          {submitting ? 'Enviando...' : 'Alterar senha'}
        </button>
      </form>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
}
