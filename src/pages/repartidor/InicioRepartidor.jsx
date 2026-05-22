/**
 * @file InicioRepartidor.jsx
 * @description Dashboard de inicio para el rol Repartidor.
 * Muestra los pedidos asignados al repartidor logueado y sus estados.
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../api';
import { Package, CheckCircle, Clock, Bike } from 'lucide-react';

const InicioRepartidor = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [datos, setDatos] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id_usuario) {
      api.get(`/api/repartidores/${user.id_usuario}`)
        .then(res => setDatos(res.data))
        .catch(err => console.error('Error al cargar datos del repartidor:', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [user]);

  if (loading) {
    return (
      <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
        <div className="spinner" />
        <p>Cargando...</p>
      </div>
    );
  }

  const pedidos = datos?.pedidos_repartidor || [];
  const asignados = pedidos.filter(p => p.estado === 'ASIGNADO').length;
  const enCamino = pedidos.filter(p => p.estado === 'EN_CAMINO').length;
  const entregados = pedidos.filter(p => p.estado === 'ENTREGADO').length;

  const stats = [
    { Icon: Package, label: 'Total asignados', value: pedidos.length, color: '#6366f1' },
    { Icon: Clock, label: 'Asignados', value: asignados, color: '#f59e0b' },
    { Icon: Bike, label: 'En camino', value: enCamino, color: '#3b82f6' },
    { Icon: CheckCircle, label: 'Entregados', value: entregados, color: '#10b981' },
  ];

  return (
    <>
      <header className="main-header">
        <h1>Bienvenido, {user?.nombre || 'Repartidor'}</h1>
      </header>

      <div style={{ padding: '1.5rem' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {stats.map(({ Icon, label, value, color }) => (
            <div key={label} className="modal-box" style={{
              margin: 0, position: 'relative', transform: 'none',
              display: 'flex', alignItems: 'center', gap: '1rem', padding: '1.25rem'
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                backgroundColor: color + '20', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <Icon size={24} color={color} />
              </div>
              <div>
                <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#0f172a' }}>{value}</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Acceso rápido al perfil */}
        <div className="modal-box" style={{ margin: 0, position: 'relative', transform: 'none' }}>
          <h2 style={{ marginBottom: '1rem' }}>Accesos rápidos</h2>
          <button
            className="btn-save"
            onClick={() => navigate('/repartidor/perfil')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            Ver mi Perfil
          </button>
        </div>
      </div>
    </>
  );
};

export default InicioRepartidor;
