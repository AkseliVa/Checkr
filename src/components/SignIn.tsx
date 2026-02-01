import React, { useState } from 'react';
import { signIn } from '../api';

type Props = {
  onSuccess?: (user: any) => void;
};

export const SignIn: React.FC<Props> = ({ onSuccess }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const user = await signIn(email.trim(), password);
      setLoading(false);
      if (onSuccess) onSuccess(user);
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || 'Sign-in failed');
    }
  };

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', padding: 20, borderRadius: 8, boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}>
      <h2 style={{ marginTop: 0 }}>Kirjaudu sisään</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Sähköposti</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ width: '90%', padding: '8px 10px', borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label style={{ display: 'block', marginBottom: 6 }}>Salasana</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ width: '90%', padding: '8px 10px', borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>

        {error && <div style={{ color: '#b00020', marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" disabled={loading} style={{ padding: '8px 14px', background: '#007AFF', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}>
            {loading ? 'Kirjaudutaan…' : 'Kirjaudu'}
          </button>
          <button type="button" onClick={() => { setEmail(''); setPassword(''); setError(null); }} style={{ padding: '8px 14px', background: 'transparent', border: '1px solid #ccc', borderRadius: 4 }}>
            Tyhjennä
          </button>
        </div>
      </form>
    </div>
  );
};

export default SignIn;
