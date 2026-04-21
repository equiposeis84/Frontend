import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, Users, Shield, Tags, Package, ShoppingCart, 
  FileText, Truck, LogOut, LogIn, ChevronDown, 
  HelpCircle, Mail, User, Activity, Zap, Cpu, Code,
  Globe
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';

const TopBar = ({ onLogout, variant }) => {
  const { totalItems } = useCart();
  const { t, language, changeLanguage } = useLanguage();
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeDropdown = () => setActiveDropdown(null);

  const renderLinks = () => {
    if (variant === 'admin') {
      return (
        <>
          <NavLink to="/admin/inicio" className="nav-pill" onClick={closeDropdown}>{t('nav.product')}</NavLink>
          
          <div className="dropdown-container" onMouseLeave={closeDropdown}>
            <button 
              className={`nav-pill ${activeDropdown === 'management' ? 'active-drop' : ''}`}
              onMouseEnter={() => setActiveDropdown('management')}
            >
              {t('nav.management')} <ChevronDown size={14} className={`chevron ${activeDropdown === 'management' ? 'rotate' : ''}`} />
            </button>
            
            {activeDropdown === 'management' && (
              <div className="mega-menu">
                <div className="mega-menu-content">
                  <div className="mega-menu-column">
                    <h3 className="mega-menu-title">Core Operations</h3>
                    <NavLink to="/admin/pedidos" className="mega-item"><ShoppingCart size={16}/> Pedidos</NavLink>
                    <NavLink to="/admin/productos" className="mega-item"><Package size={16}/> Productos</NavLink>
                    <NavLink to="/admin/facturas" className="mega-item"><FileText size={16}/> Facturas</NavLink>
                  </div>
                  <div className="mega-menu-column">
                    <h3 className="mega-menu-title">People & Roles</h3>
                    <NavLink to="/admin/usuarios" className="mega-item"><Users size={16}/> Usuarios</NavLink>
                    <NavLink to="/admin/repartidores" className="mega-item"><Truck size={16}/> Repartidores</NavLink>
                    <NavLink to="/admin/proveedores" className="mega-item"><Activity size={16}/> Proveedores</NavLink>
                  </div>
                  <div className="mega-menu-column">
                    <h3 className="mega-menu-title">System</h3>
                    <NavLink to="/admin/roles" className="mega-item"><Shield size={16}/> Roles</NavLink>
                    <NavLink to="/admin/categorias" className="mega-item"><Tags size={16}/> Categorías</NavLink>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <NavLink to="/admin/perfil" className="nav-pill" onClick={closeDropdown}>{t('nav.adminProfile')}</NavLink>
        </>
      );
    }

    const basePath = variant === 'cliente' ? '/cliente' : '/usuario';
    return (
      <>
        <NavLink to={`${basePath}/inicio`} className="nav-pill" onClick={closeDropdown}>{t('nav.product')}</NavLink>
        
        <div className="dropdown-container" onMouseLeave={closeDropdown}>
          <button 
            className={`nav-pill ${activeDropdown === 'store' ? 'active-drop' : ''}`}
            onMouseEnter={() => setActiveDropdown('store')}
          >
            {t('nav.useCases')} <ChevronDown size={14} className={`chevron ${activeDropdown === 'store' ? 'rotate' : ''}`} />
          </button>
          
          {activeDropdown === 'store' && (
            <div className="mega-menu">
              <div className="mega-menu-content compact">
                <div className="mega-menu-column">
                  <h3 className="mega-menu-title">Built for everyone</h3>
                  <NavLink to={`${basePath}/productos`} className="mega-item"><Zap size={16}/> {t('hero.btn.catalog')}</NavLink>
                  <NavLink to={`${basePath}/pedidos`} className="mega-item"><Package size={16}/> Mis Pedidos</NavLink>
                  <NavLink to={`${basePath}/carrito`} className="mega-item"><ShoppingCart size={16}/> Carrito de Compras</NavLink>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="dropdown-container" onMouseLeave={closeDropdown}>
          <button 
            className={`nav-pill ${activeDropdown === 'resources' ? 'active-drop' : ''}`}
            onMouseEnter={() => setActiveDropdown('resources')}
          >
            {t('nav.resources')} <ChevronDown size={14} className={`chevron ${activeDropdown === 'resources' ? 'rotate' : ''}`} />
          </button>
          
          {activeDropdown === 'resources' && (
            <div className="mega-menu narrow">
              <div className="mega-menu-content compact">
                <div className="mega-menu-column">
                  <NavLink to={`${basePath}/ayuda`} className="mega-item"><HelpCircle size={16}/> Centro de Ayuda</NavLink>
                  <NavLink to={`${basePath}/contacto`} className="mega-item"><Mail size={16}/> Contáctanos</NavLink>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {variant === 'cliente' && (
          <NavLink to="/cliente/perfil" className="nav-pill" onClick={closeDropdown}>{t('nav.myAccount')}</NavLink>
        )}
      </>
    );
  };

  return (
    <nav className={`topbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="topbar-inner">
        {/* LOGO */}
        <div className="topbar-logo" onClick={() => navigate('/')}>
          <div className="logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 22H22L12 2Z" fill="url(#paint0_linear)"/>
              <defs>
                <linearGradient id="paint0_linear" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#111111" />
                  <stop offset="1" stopColor="#444444" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text">{t('brand')}</span>
        </div>

        {/* CENTER LINKS */}
        <div className="topbar-links">
          {renderLinks()}
        </div>

        {/* RIGHT ACTIONS */}
        <div className="topbar-actions">
          {/* Selector de Idioma */}
          <div className="dropdown-container" onMouseLeave={closeDropdown}>
            <button 
              className="lang-btn"
              onMouseEnter={() => setActiveDropdown('lang')}
            >
              <Globe size={18} /> {language.toUpperCase()}
            </button>
            {activeDropdown === 'lang' && (
              <div className="mega-menu narrow lang-menu">
                <div className="mega-menu-content compact" style={{flexDirection: 'column', padding: '10px', gap: '5px'}}>
                  <button className={`lang-option ${language === 'en' ? 'active' : ''}`} onClick={() => changeLanguage('en')}>🇺🇸 English</button>
                  <button className={`lang-option ${language === 'es' ? 'active' : ''}`} onClick={() => changeLanguage('es')}>🇪🇸 Español</button>
                </div>
              </div>
            )}
          </div>

          {(variant === 'cliente' || variant === 'usuario') && (
            <button className="cart-btn" onClick={() => navigate(variant === 'cliente' ? '/cliente/carrito' : '/usuario/carrito')}>
              <ShoppingCart size={20} />
              {totalItems > 0 && <span className="cart-badge">{totalItems}</span>}
            </button>
          )}

          {variant === 'admin' || variant === 'cliente' ? (
            <button onClick={onLogout} className="btn-dark-pill">
              {t('nav.signOut')}
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="btn-dark-pill">
              {t('nav.login')} <LogIn size={16} />
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default TopBar;
