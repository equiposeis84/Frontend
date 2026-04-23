/**
 * @file Login.jsx
 * @description Página de inicio de sesión.
 *
 * CORRECCIONES APLICADAS:
 *  ✅ BUG #2 — Flujo de Login: Se añade un enlace funcional "Volver al Inicio"
 *     que navega a /usuario/inicio sin necesidad de autenticación.
 *     El router NO bloquea esa ruta porque /usuario/* es pública (sin ProtectedRoute).
 */
import { useState } from 'react';
import api from '../api';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const URL_LOGIN = "/api/usuarios/login";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth(); // Hook al Contexto Global

  // ── Manejador del submit ────────────────────────────────────────────────────
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post(URL_LOGIN, { email, password });

      // login() guarda los datos del usuario en el contexto y en localStorage.
      // El token ya vive en la httpOnly cookie → el navegador lo manda solo.
      login(response.data.user);

    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // ── UI ──────────────────────────────────────────────────────────────────────
  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', backgroundColor: 'var(--bg-dark)',
      padding: '1rem'
    }}>

      {/* ── Botón VOLVER AL INICIO ── CORRECCIÓN #2 ──────────────────────── */}
      {/*
        ¿Por qué Link y no <button onClick={navigate}>?
        → Link genera un <a> semántico. Es más accesible y funciona aunque
          JavaScript falle en cargar. Navigate() es para navegación imperativa
          (después de una acción como guardar un formulario).
        ¿Por qué /usuario/inicio y no /?
        → La ruta "/" ya hace <Navigate to="/usuario/inicio" replace />.
          Vamos directo para evitar un salto extra.
      */}
      <div style={{ width: '100%', maxWidth: '400px', marginBottom: '0.75rem' }}>
        <Link
          to="/usuario/inicio"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
            color: '#94a3b8', fontSize: '0.875rem', textDecoration: 'none',
          }}
        >
          ← Volver al Inicio
        </Link>
      </div>

      {/* ── Tarjeta de login ─────────────────────────────────────────────── */}
      <div className="modal-box" style={{
        width: '100%', maxWidth: '400px',
        transform: 'none', position: 'relative'
      }}>

        {/* Logo + Título */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginBottom: '0.75rem' }}>
            <path d="M12 2L2 22H22L12 2Z" fill="var(--primary)" />
          </svg>
          <h2 style={{
            fontSize: '1.75rem', fontWeight: '800',
            letterSpacing: '-0.02em', color: '#0f172a', margin: 0
          }}>
            Iniciar Sesión
          </h2>
          <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
            Accede a tu cuenta de RematesPaisa
          </p>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div style={{
            backgroundColor: '#fee2e2', color: '#b91c1c',
            padding: '0.75rem', borderRadius: '4px',
            marginBottom: '1.5rem', textAlign: 'center'
          }}>
            {error}
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleLogin}>
          <div className="input-field" style={{ marginBottom: '1.25rem' }}>
            <label>Correo Electrónico</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Ej: admin@remate.com"
              required
            />
          </div>

          <div className="input-field" style={{ marginBottom: '2rem' }}>
            <label>Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="***"
              required
            />
          </div>

          {/* Botón Ingresar */}
          <button
            className="btn-save"
            type="submit"
            style={{
              width: '100%', padding: '0.75rem', fontSize: '1.05rem',
              display: 'flex', justifyContent: 'center', marginBottom: '1rem'
            }}
            disabled={loading}
          >
            {loading
              ? <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: '#fff' }} />
              : 'Ingresar'
            }
          </button>

          {/* Enlace a Registro */}
          <Link
            to="/register"
            className="btn-save"
            style={{
              width: '100%', padding: '0.75rem', fontSize: '1.05rem',
              display: 'flex', justifyContent: 'center',
              backgroundColor: '#e2e8f0', color: '#1e293b',
              textDecoration: 'none'
            }}
          >
            Registrarse
          </Link>
        </form>
      </div>
    </div>
  );
};

export default Login;
