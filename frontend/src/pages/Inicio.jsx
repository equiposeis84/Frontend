import { useNavigate } from 'react-router-dom';
import { Users, Tags, Package, ShoppingCart, Receipt, Truck, Shield, Store, Rocket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import '../Storefront.css';

const Inicio = () => {
  const { user, role, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const isAdmin = role === 'Administrador';
  const prefix = isAuthenticated ? '/cliente' : '/usuario';

  const features = [
    { title: 'Usuarios', desc: 'Gestiona los clientes y administradores.', icon: Users, path: '/admin/usuarios', color: '#3b82f6' },
    { title: 'Roles', desc: 'Niveles de acceso del sistema.', icon: Shield, path: '/admin/roles', color: '#8b5cf6' },
    { title: 'Categorías', desc: 'Organiza los productos por tipo.', icon: Tags, path: '/admin/categorias', color: '#10b981' },
    { title: 'Productos', desc: 'Catálogo e inventario comercial.', icon: Package, path: '/admin/productos', color: '#f59e0b' },
    { title: 'Proveedores', desc: 'Empresas que surten los productos.', icon: Truck, path: '/admin/proveedores', color: '#64748b' },
    { title: 'Pedidos', desc: 'Órdenes de compra de los clientes.', icon: ShoppingCart, path: '/admin/pedidos', color: '#ef4444' },
    { title: 'Facturas', desc: 'Registro contable de las ventas.', icon: Receipt, path: '/admin/facturas', color: '#06b6d4' }
  ];

  if (isAdmin) {
    return (
      <>
        <header className="main-header">
          <div>
            <h1 style={{ marginBottom: '0.25rem' }}>Panel de Control (Admin)</h1>
            <p style={{ color: '#94a3b8', margin: 0, fontSize: '1.05rem' }}>Bienvenido nuevamente, <strong>{user?.nombre}</strong></p>
          </div>
        </header>

        <div style={{ padding: '2rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="modal-box"
                style={{ position: 'relative', transform: 'none', margin: 0, cursor: 'pointer', transition: 'transform 0.2s', borderTop: `4px solid ${feat.color}` }}
                onClick={() => navigate(feat.path)}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ backgroundColor: `${feat.color}20`, padding: '0.75rem', borderRadius: '8px' }}>
                    <Icon size={28} color={feat.color} />
                  </div>
                  <h3 style={{ margin: 0, fontSize: '1.25rem', color: 'var(--text-main)' }}>{feat.title}</h3>
                </div>
                <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>{feat.desc}</p>
              </div>
            );
          })}
        </div>
      </>
    );
  }

  // Vista para Clientes e Invitados
  return (
    <div className="storefront-container" style={{ textAlign: 'center', paddingTop: '3rem' }}>
      <div style={{ background: 'var(--card-bg)', borderRadius: '16px', padding: '4rem 2rem', border: '1px solid var(--border)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', position: 'relative', overflow: 'hidden' }}>

        {/* Adorno decorativo de fondo */}
        <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'var(--primary)', opacity: '0.1', borderRadius: '50%', filter: 'blur(50px)' }}></div>
        <div style={{ position: 'absolute', bottom: '-10%', left: '-5%', width: '300px', height: '300px', background: 'var(--danger)', opacity: '0.1', borderRadius: '50%', filter: 'blur(50px)' }}></div>

        <Rocket size={64} style={{ color: 'var(--primary)', marginBottom: '1rem' }} />
        <h1 style={{ fontSize: '3rem', margin: '0 0 1rem 0', color: 'var(--text-main)' }}>
          ¡Bienvenido a <span style={{ color: 'var(--primary)' }}>RematesPaisa</span>!
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
          {isAuthenticated
            ? `Hola ${user?.nombre}, explora nuestras ofertas exclusivas del día y lleva los mejores productos para el hogar al mejor precio con seguridad garantizada.`
            : 'Explora nuestro inmenso catálogo de productos para el hogar a un precio imbatible.'}
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button
            className="btn-add-red"
            style={{ padding: '1rem 2.5rem', fontSize: '1.2rem' }}
            onClick={() => navigate(`${prefix}/productos`)}
          >
            <Store size={22} style={{ marginRight: '8px' }} /> Explorar Tienda
          </button>
        </div>
      </div>
    </div>
  );
};

export default Inicio;
