import { useState, useEffect } from 'react';
import axios from 'axios';
import { UserCircle, Save, Bell, Moon, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const URL_API = "http://localhost:3000/api/usuarios";

const Perfil = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  
  // User Data
  const [rolId, setRolId] = useState(1);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tipoDoc, setTipoDoc] = useState("");
  const [numDoc, setNumDoc] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  
  // Demo settings states
  const [notificaciones, setNotificaciones] = useState(true);
  const [modoOscuro, setModoOscuro] = useState(false);
  const [autenticacionDosPasos, setAutenticacionDosPasos] = useState(false);

  useEffect(() => {
    if (user?.id_usuario) {
      cargarPerfil();
    } else {
      setLoading(false);
    }
  }, [user]);

  const cargarPerfil = () => {
    setLoading(true);
    axios.get(`${URL_API}/${user.id_usuario}`)
      .then(res => {
        const u = res.data;
        if(u) {
          setRolId(u.rol_id);
          setNombre(u.nombre);
          setEmail(u.email);
          setTipoDoc(u.tipo_documento || "");
          setNumDoc(u.numero_documento || "");
          setTelefono(u.telefono || "");
          setDireccion(u.direccion || "");
        }
      })
      .catch(err => console.error("Error al cargar perfil:", err))
      .finally(() => setLoading(false));
  };

  const guardarPerfil = () => {
    if (!user?.id_usuario) return;
    
    const datos = {
      rol_id: rolId,
      nombre,
      email,
      password: password || undefined,
      tipo_documento: tipoDoc,
      numero_documento: numDoc,
      telefono,
      direccion,
      activo: 1
    };

    if (!nombre || !email) {
      alert("El nombre y el email son obligatorios.");
      return;
    }

    axios.put(`${URL_API}/${user.id_usuario}`, datos)
      .then(() => {
        alert("¡Perfil actualizado con éxito!");
        setPassword(""); 
      })
      .catch(err => {
        console.error("Error al actualizar:", err);
        alert("Hubo un error al actualizar los datos.");
      });
  };

  const toggleNotificaciones = () => setNotificaciones(!notificaciones);
  const toggleModoOscuro = () => setModoOscuro(!modoOscuro);
  const toggleDobleAuth = () => setAutenticacionDosPasos(!autenticacionDosPasos);

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        <div className="spinner"></div><p>Cargando información del perfil...</p>
      </div>
    );
  }

  return (
    <>
      <header className="main-header">
        <h1>Mi Perfil</h1>
      </header>

      <div style={{ padding: '1.5rem', display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        
        {/* Profile Editing Form */}
        <div className="modal-box" style={{ flex: '1', minWidth: '300px', margin: 0, position: 'relative', transform: 'none' }}>
          <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <UserCircle size={24} color="var(--primary)" /> 
            Datos Personales
          </h2>
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
              <input type="password" placeholder="***" value={password} onChange={(e) => setPassword(e.target.value)} />
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
            <button className="btn-save" onClick={guardarPerfil} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
              <Save size={18} /> Guardar Cambios
            </button>
          </div>
        </div>

        {/* Configurations Area */}
        <div className="modal-box" style={{ flex: '0.5', minWidth: '300px', margin: 0, position: 'relative', transform: 'none', height: 'fit-content' }}>
          <h2>Opciones de Configuración (Demo)</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            Ajustes visuales y de preferencias de tu cuenta.
          </p>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {/* Dark Mode Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Moon size={20} color="#475569" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Modo Oscuro</h4>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cambia a un tema oscuro (Ejemplo)</span>
                </div>
              </div>
              <button 
                onClick={toggleModoOscuro}
                style={{
                  width: '45px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  backgroundColor: modoOscuro ? 'var(--primary)' : '#cbd5e1',
                  position: 'relative', transition: 'background-color 0.3s'
                }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white',
                  position: 'absolute', top: '2px', left: modoOscuro ? '23px' : '2px', transition: 'left 0.3s'
                }} />
              </button>
            </div>

            {/* Notifications Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e2e8f0', paddingBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Bell size={20} color="#475569" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Notificaciones</h4>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Recibe alertas por email</span>
                </div>
              </div>
              <button 
                onClick={toggleNotificaciones}
                style={{
                  width: '45px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  backgroundColor: notificaciones ? 'var(--primary)' : '#cbd5e1',
                  position: 'relative', transition: 'background-color 0.3s'
                }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white',
                  position: 'absolute', top: '2px', left: notificaciones ? '23px' : '2px', transition: 'left 0.3s'
                }} />
              </button>
            </div>

            {/* 2FA Toggle */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Shield size={20} color="#475569" />
                <div>
                  <h4 style={{ margin: 0, fontSize: '1rem' }}>Autenticación 2 Pasos</h4>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Mayor seguridad en tu ingreso</span>
                </div>
              </div>
              <button 
                onClick={toggleDobleAuth}
                style={{
                  width: '45px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                  backgroundColor: autenticacionDosPasos ? 'var(--primary)' : '#cbd5e1',
                  position: 'relative', transition: 'background-color 0.3s'
                }}>
                <div style={{
                  width: '20px', height: '20px', borderRadius: '50%', backgroundColor: 'white',
                  position: 'absolute', top: '2px', left: autenticacionDosPasos ? '23px' : '2px', transition: 'left 0.3s'
                }} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default Perfil;
