import { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const URL_LOGIN = "http://localhost:3000/api/usuarios/login";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth(); // Hook al Contexto Global

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, ingresa tu correo y contraseña.');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(URL_LOGIN, { email, password });

      // Cargar sesión al contexto global. El token ya está en la httpOnly cookie
      // que el servidor emitió; aquí solo pasamos los datos del usuario para la UI.
      login(response.data.user);

    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: 'var(--bg-dark)' }}>
      <div className="modal-box" style={{ width: '100%', maxWidth: '400px', transform: 'none', position: 'relative' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/usuario/inicio" style={{ display: 'inline-block', marginBottom: '1rem', textDecoration: 'none' }}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '0.5rem' }}>
              <path d="M12 2L2 22H22L12 2Z" fill="var(--primary)"/>
            </svg>
          </Link>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', letterSpacing: '-0.02em', color: '#0f172a' }}>Iniciar Sesión</h2>
          <p style={{ color: '#64748b' }}>Accede a tu cuenta de Nexbit</p>
        </div>

        {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '0.75rem', borderRadius: '4px', marginBottom: '1.5rem', textAlign: 'center' }}>{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="input-field" style={{ marginBottom: '1.25rem' }}>
            <label>Correo Electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Ej: admin@remate.com" required />
          </div>

          <div className="input-field" style={{ marginBottom: '2rem' }}>
            <label>Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="***" required />
          </div>

          <button className="btn-save" type="submit" style={{ width: '100%', padding: '0.75rem', fontSize: '1.05rem', display: 'flex', justifyContent: 'center', marginBottom: '1rem' }} disabled={loading}>
            {loading ? <div className="spinner" style={{ width: '20px', height: '20px', borderTopColor: '#fff' }}></div> : 'Ingresar'}
          </button>
          
          <Link 
            to="/register" 
            className="btn-save" 
            style={{ 
              width: '100%', 
              padding: '0.75rem', 
              fontSize: '1.05rem', 
              display: 'flex', 
              justifyContent: 'center',
              backgroundColor: '#e2e8f0',
              color: '#1e293b',
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
