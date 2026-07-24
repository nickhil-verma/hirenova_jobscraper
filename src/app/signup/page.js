'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle } from 'lucide-react';

export default function SignupPage() {
  const router = useRouter();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Check user session
  const checkSession = async () => {
    try {
      const res = await fetch('/api/auth/session');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          router.push('/dashboard');
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCheckingSession(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (err) {
      setError('Network communication failed');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100%', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', flexDirection: 'column', gap: '1rem' }}>
        <div className="loading-spinner"></div>
        <p style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Checking session...</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '80vh', justifyContent: 'center', alignItems: 'center' }}>
      
      {/* FLOATING GLASS NAVBAR */}
      <header className="floating-navbar">
        <Link href="/" style={{ textDecoration: 'none', fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-title)', letterSpacing: '-0.5px' }}>
          Hirenova
        </Link>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Link href="/" className="shad-btn shad-btn-ghost">
            Home
          </Link>
          <Link href="/login" className="shad-btn shad-btn-outline" style={{ borderRadius: '25px', height: '2.2rem' }}>
            Log In
          </Link>
        </div>
      </header>

      {/* SIGNUP CARD */}
      <div className="shad-card" style={{ width: '90%', maxWidth: '420px', padding: '2.5rem 2rem', background: 'rgba(255,255,255,0.75)' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-title)', letterSpacing: '-0.5px' }}>
            Create Account
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginTop: '0.25rem' }}>
            Register to parse resumes and auto-apply to active listings
          </p>
        </div>

        {error && (
          <div className="shad-card" style={{ padding: '0.75rem 1rem', borderColor: 'hsl(var(--destructive))', color: 'hsl(var(--destructive))', background: 'rgba(239, 68, 68, 0.03)', flexDirection: 'row', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
            <AlertCircle size={16} />
            <span style={{ fontSize: '0.88rem', fontWeight: 500 }}>{error}</span>
          </div>
        )}

        <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>FULL NAME</label>
            <input 
              type="text" 
              required
              className="shad-input"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>EMAIL ADDRESS</label>
            <input 
              type="email" 
              required
              className="shad-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>PASSWORD</label>
            <input 
              type="password" 
              required
              className="shad-input"
              placeholder="Min. 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="shad-btn shad-btn-primary"
            style={{ width: '100%', height: '2.5rem', marginTop: '0.5rem' }}
          >
            {loading ? 'Please wait...' : 'Sign Up'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link href="/login" style={{ color: 'var(--text-primary)', fontWeight: 600, textDecoration: 'none' }}>
            Log In
          </Link>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ marginTop: '4rem', color: 'var(--text-tertiary)', fontSize: '0.82rem', textAlign: 'center' }}>
        All rights are reserved with Hirenova built by github-Nickhil-verma
      </footer>
    </div>
  );
}
