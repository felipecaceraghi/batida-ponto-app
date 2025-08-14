import { useState } from 'react';

export default function ResetPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSending(true);
    setMessage('');
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      setMessage(data.message || 'Se o email existir, você receberá um link de redefinição.');
    } catch (err) {
      console.error(err);
      setMessage('Falha ao solicitar redefinição de senha');
    } finally {
      setSending(false);
    }
  }

  return (
    <div style={{ maxWidth: '400px', margin: '2rem auto', padding: '1rem' }}>
      <h1>Redefinir senha</h1>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <label>
          Informe seu email
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Seu email"
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </label>
        <button type="submit" style={{ padding: '0.5rem', cursor: 'pointer' }} disabled={sending}>
          {sending ? 'Enviando...' : 'Enviar link'}
        </button>
      </form>
      {message && <p style={{ marginTop: '1rem' }}>{message}</p>}
    </div>
  );
}
