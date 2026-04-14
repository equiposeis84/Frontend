import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Shield, Users, Tags, Package, ShoppingCart, 
  Receipt, Truck, X, Layers, LogOut, UserCircle,
  Home, HelpCircle, Mail, LogIn
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import './Sidebar.css';

const Sidebar = ({ isOpen, setIsOpen, onLogout, variant = "admin" }) => {
  const navigate = useNavigate();
  const { user, role: userRole } = useAuth();
  
  const userName = user ? user.nombre : "Usuario Invitado";

  const { getCartCount } = useCart();
  const cartCount = getCartCount();

  const adminItems = [
    { id: 'roles', path: '/admin/roles', label: 'Roles', icon: Shield },
    { id: 'usuarios', path: '/admin/usuarios', label: 'Usuarios', icon: Users },
    { id: 'categorias', path: '/admin/categorias', label: 'Categorías', icon: Tags },
    { id: 'productos', path: '/admin/productos', label: 'Productos', icon: Package },
    { id: 'pedidos', path: '/admin/pedidos', label: 'Pedidos', icon: ShoppingCart },
    { id: 'proveedores', path: '/admin/proveedores', label: 'Proveedores', icon: Truck }
  ];

  const storefrontItems = [
    { id: 'inicio', path: `/${variant}/inicio`, label: 'Inicio', icon: Home },
    { id: 'productos', path: `/${variant}/productos`, label: 'Productos', icon: Package },
    { id: 'carrito', path: `/${variant}/carrito`, label: 'Carrito', icon: ShoppingCart, badge: cartCount },
    { id: 'pedidos', path: `/${variant}/pedidos`, label: 'Pedidos', icon: Receipt },
  ];

  const menuItems = variant === 'admin' ? adminItems : storefrontItems;

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'open' : ''}`} onClick={() => setIsOpen(false)}></div>
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <NavLink to={variant === 'admin' ? '/admin/inicio' : `/${variant}/inicio`} className="sidebar-logo" style={{ textDecoration: 'none', color: 'inherit' }} onClickCapture={() => setIsOpen(false)}>
            <Layers size={28} className="logo-icon" />
            <span>{variant === 'admin' ? 'AdminPanel' : 'RematesPaisa'}</span>
          </NavLink>
          <button className="sidebar-close" onClick={() => setIsOpen(false)}>
            <X size={24} />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink 
                key={item.id} 
                to={item.path}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                onClick={() => {
                  if (window.innerWidth <= 768) setIsOpen(false);
                }}
              >
                <Icon size={20} strokeWidth={2.5} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className="cart-badge">{item.badge > 99 ? '+99' : item.badge}</span>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="sidebar-footer" style={{ flexDirection: 'column', gap: '15px' }}>
          {variant !== 'admin' && (
            <NavLink 
                to={`/${variant}/contacto`}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                style={{ width: '100%', display: 'flex' }}
                onClick={() => { if (window.innerWidth <= 768) setIsOpen(false); }}
            >
                <HelpCircle size={20} strokeWidth={2.5} />
                <span>Ayuda y Contacto</span>
            </NavLink>
          )}

          <div style={{ width: '100%', height: '1px', backgroundColor: 'var(--border)' }}></div>

          {variant !== 'usuario' ? (
            <div style={{ display: 'flex', width: '100%', justifyContent: 'space-between', alignItems: 'center' }}>
              <NavLink 
                to={variant === 'admin' ? '/admin/perfil' : '/cliente/perfil'} 
                className="sidebar-profile" 
                style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}
                onClick={() => {
                  if (window.innerWidth <= 768) setIsOpen(false);
                }}
              >
                <UserCircle size={32} className="profile-avatar" />
                <div className="profile-info" style={{ display: 'flex', flexDirection: 'column' }}>
                  <span className="profile-role" style={{fontWeight: 'bold', fontSize: '0.9rem'}}>{userName}</span>
                  <span className="profile-role" style={{fontSize: '0.75rem', opacity: 0.8}}>{userRole}</span>
                </div>
              </NavLink>
              <button className="btn-logout" onClick={() => {
                if (onLogout) onLogout();
              }} title="Cerrar Sesión">
                <LogOut size={20} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <button className="btn-login-guest" onClick={() => {
              navigate('/login');
              if (window.innerWidth <= 768) setIsOpen(false);
            }}>
              <LogIn size={20} strokeWidth={2.5} />
              <span>Iniciar Sesión</span>
            </button>
          )}
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
