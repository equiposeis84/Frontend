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

      // Cargar sesión al contexto global (esto redirigirá automáticamente vía App.jsx)
      login(response.data.token, response.data.user);

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
          <Layers size={48} color="var(--primary)" style={{ marginBottom: '1rem' }} />
          <h2>Bienvenido al AdminPanel</h2>
          <p style={{ color: '#64748b' }}>Inicia sesión para continuar</p>
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
