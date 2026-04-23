/**
 * @file Perfil.jsx
 * @description Página de perfil del usuario.
 *
 * CORRECCIÓN #3 — Bug de Perfil: el sistema no persistía cambios en la BD.
 * ────────────────────────────────────────────────────────────────────────────
 * PROBLEMA raíz:
 *   axios.put() no enviaba la httpOnly cookie de autenticación porque
 *   axios.defaults.withCredentials no estaba configurado globalmente,
 *   y la llamada puntual tampoco incluía { withCredentials: true }.
 *
 *   Sin la cookie, el middleware verificarToken devuelve 401.
 *   El backend RECHAZABA la actualización en silencio desde el frontend
 *   porque el catch solo hacía console.error pero alert("error").
 *   El usuario veía el alert pero no sabía que era un error de autenticación.
 *
 * SOLUCIÓN:
 *   1. Agregar withCredentials: true a TODAS las llamadas axios (get y put).
 *   2. Mejorar el manejo de errores: mostrar el mensaje real del servidor.
 *
 * CONCEPTO — ¿Por qué withCredentials?
 *   Por defecto, el navegador NO envía cookies a orígenes cruzados.
 *   http://localhost:3000 (backend) y http://localhost:5173 (frontend React)
 *   son orígenes distintos. Para que la cookie viaje en cada request se necesita:
 *     - Frontend: { withCredentials: true }
 *     - Backend:  cors({ credentials: true })  ← ya está configurado en app.js
 */
import { useState, useEffect } from 'react';
import api from '../api';
import { UserCircle, Save, Bell, Moon, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const URL_API = "/api/usuarios";



const Perfil = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);    // Estado de carga para el botón guardar
  const [mensaje, setMensaje] = useState(null);     // { tipo: 'ok'|'error', texto: string }

  // ── Estado del formulario ─────────────────────────────────────────────────
  const [rolId, setRolId] = useState(1);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tipoDoc, setTipoDoc] = useState('');
  const [numDoc, setNumDoc] = useState('');
  const [telefono, setTelefono] = useState('');
  const [direccion, setDireccion] = useState('');

  // ── Demo settings ─────────────────────────────────────────────────────────
  const [notificaciones, setNotificaciones] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [autenticacionDosPasos, setAutenticacionDosPasos] = useState(false);

  // ── Cargar perfil ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (user?.id_usuario) {
      cargarPerfil();
    } else {
      setLoading(false);
    }
  }, [user]);

  const cargarPerfil = () => {
    setLoading(true);
    api.get(`/api/usuarios/${user.id_usuario}`)
      .then(res => {
        const u = res.data;
        if (u) {
          setRolId(u.rol_id);
          setNombre(u.nombre);
          setEmail(u.email);
          setTipoDoc(u.tipo_documento || '');
          setNumDoc(u.numero_documento || '');
          setTelefono(u.telefono || '');
          setDireccion(u.direccion || '');
        }
      })
      .catch(err => {
        console.error('Error al cargar perfil:', err);
        setMensaje({ tipo: 'error', texto: 'No se pudo cargar el perfil. Verifica tu sesión.' });
      })
      .finally(() => setLoading(false));
  };

  // ── Guardar perfil ────────────────────────────────────────────────────────
  const guardarPerfil = async () => {
    if (!user?.id_usuario) return;

    if (!nombre || !email) {
      setMensaje({ tipo: 'error', texto: 'El nombre y el email son obligatorios.' });
      return;
    }

    const datos = {
      rol_id: rolId,
      nombre,
      email,
      // Solo enviar password si el usuario escribió una nueva
      ...(password ? { password } : {}),
      tipo_documento: tipoDoc,
      numero_documento: numDoc,
      telefono,
      direccion,
      activo: 1
    };

    setSaving(true);
    setMensaje(null);

    try {
      await api.put(`/api/usuarios/${user.id_usuario}`, datos);
      setPassword('');
      setMensaje({ tipo: 'ok', texto: '¡Perfil actualizado con éxito!' });
    } catch (err) {
      console.error('Error al actualizar:', err);
      const textoError = err.response?.data?.message
        || err.response?.data?.error
        || 'Error al actualizar los datos. ¿Estás autenticado?';
      setMensaje({ tipo: 'error', texto: textoError });
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        <div className="spinner" />
        <p>Cargando información del perfil...</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      <header className="main-header">
        <h1>Mi Perfil</h1>
      </header>

      <div style={{ padding: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>

        {/* ── Formulario de edición ─────────────────────────────────────── */}
        <div className="modal-box" style={{
          flex: '1', minWidth: '300px', margin: 0,
          position: 'relative', transform: 'none'
        }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCircle size={24} color="var(--primary)" />
            Datos Personales
          </h2>

          {/* ── Mensaje de éxito / error ───────────────────────────────── */}
          {mensaje && (
            <div style={{
              padding: '0.75rem', borderRadius: '4px', marginTop: '1rem',
              backgroundColor: mensaje.tipo === 'ok' ? '#dcfce7' : '#fee2e2',
              color: mensaje.tipo === 'ok' ? '#15803d' : '#b91c1c',
              fontSize: '0.9rem'
            }}>
              {mensaje.texto}
            </div>
          )}

          <div className="form-grid" style={{ marginTop: '1rem' }}>
            <div className="input-field" style={{ gridColumn: 'span 2' }}>
              <label>Nombre Completo</label>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div className="input-field">
              <label>Correo Electrónico</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="input-field">
              <label>Nueva Contraseña <small>(Opcional)</small></label>
              <input
                type="password" placeholder="***"
                value={password} onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="input-field">
              <label>Tipo de Documento</label>
              <select value={tipoDoc} onChange={(e) => setTipoDoc(e.target.value)}>
                <option value="">Seleccionar...</option>
                <option value="CC">CC - Cédula</option>
                <option value="CE">CE - Cédula Extranjería</option>
                <option value="NIT">NIT</option>
              </select>
            </div>
            <div className="input-field">
              <label>Número de Documento</label>
              <input value={numDoc} onChange={(e) => setNumDoc(e.target.value)} />
            </div>
            <div className="input-field">
              <label>Teléfono</label>
              <input value={telefono} onChange={(e) => setTelefono(e.target.value)} />
            </div>
            <div className="input-field">
              <label>Dirección</label>
              <input value={direccion} onChange={(e) => setDireccion(e.target.value)} />
            </div>
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
            <button
              className="btn-save"
              onClick={guardarPerfil}
              disabled={saving}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              {saving
                ? <><div className="spinner" style={{ width: '16px', height: '16px', borderTopColor: '#fff' }} /> Guardando...</>
                : <><Save size={18} /> Guardar Cambios</>
              }
            </button>
          </div>
        </div>

        {/* ── Configuraciones (demo) ─────────────────────────────────────── */}
        <div className="modal-box" style={{
          flex: '0.5', minWidth: '300px', margin: 0,
          position: 'relative', transform: 'none', height: 'fit-content'
        }}>
          <h2>Opciones de Configuración (Demo)</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Ajustes visuales y de preferencias de tu cuenta.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Modo Oscuro */}
            <ToggleRow
              Icon={Moon} label="Modo Oscuro" sub="Cambia a un tema oscuro (Ejemplo)"
              value={modoOscuro} onChange={() => setModoOscuro(v => !v)}
            />
            {/* Notificaciones */}
            <ToggleRow
              Icon={Bell} label="Notificaciones" sub="Recibe alertas por email"
              value={notificaciones} onChange={() => setNotificaciones(v => !v)}
            />
            {/* 2FA */}
            <ToggleRow
              Icon={Shield} label="Autenticación 2 Pasos" sub="Mayor seguridad en tu ingreso"
              value={autenticacionDosPasos} onChange={() => setAutenticacionDosPasos(v => !v)}
              noBorder
            />
          </div>
        </div>

      </div>
    </>
  );
};

// ── Componente auxiliar Toggle ───────────────────────────────────────────────
//
// CONCEPTO — Extracción de componente:
//   El mismo patrón (ícono + texto + toggle) se repetía 3 veces.
//   Extraerlo a un sub-componente reduce el JSX de ~60 a ~5 líneas por item.
//
const ToggleRow = ({ Icon, label, sub, value, onChange, noBorder = false }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    ...(noBorder ? {} : { borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' })
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
      <Icon size={20} color="#475569" />
      <div>
        <h4 style={{ margin: 0, fontSize: '1rem' }}>{label}</h4>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{sub}</span>
      </div>
    </div>
    <button
      onClick={onChange}
      style={{
        width: '45px', height: '24px', borderRadius: '12px', border: 'none',
        cursor: 'pointer', position: 'relative', transition: 'background-color 0.3s',
        backgroundColor: value ? 'var(--primary)' : '#cbd5e1'
      }}
    >
      <div style={{
        width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white',
        position: 'absolute', top: '2px',
        left: value ? '23px' : '2px', transition: 'left 0.3s'
      }} />
    </button>
  </div>
);

export default Perfil;
