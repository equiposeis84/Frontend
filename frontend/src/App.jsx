/**
 * @file App.jsx
 * @description Componente raíz. Dos layouts separados:
 *  - AdminLayout: sidebar oscuro colapsable (panel admin)
 *  - StoreLayout: topbar e-commerce (cliente / usuario)
 */
import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import TopBar       from './components/TopBar';
import AdminSidebar  from './components/AdminSidebar';
import CartToast     from './components/CartToast';
import Usuarios    from './pages/Usuarios';
import Roles       from './pages/Roles';
import Categorias  from './pages/Categorias';
import Productos   from './pages/Productos';
import Pedidos     from './pages/Pedidos';
import Facturas    from './pages/Facturas';
import Proveedores from './pages/Proveedores';
import Repartidores from './pages/Repartidores';
import Perfil      from './pages/Perfil';
import Inicio      from './pages/Inicio';
import Login       from './pages/Login';
import Register    from './pages/Register';
import Carrito     from './pages/Carrito';
import Ayuda       from './pages/Ayuda';
import Contacto    from './pages/Contacto';
import Reportes    from './pages/Reportes';
import { CartProvider }     from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import { LanguageProvider } from './context/LanguageContext';
import './services/authService';

/* ─── Layout del Panel Admin ────────────────────────────────── */
const AdminLayout = () => {
  const { logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="adm-layout">
      <AdminSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed(c => !c)}
        onLogout={logout}
      />
      <main className={`adm-content${collapsed ? ' adm-content--expanded' : ''}`}>
        <div className="admin-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

/* ─── Layout de la Tienda (usuario / cliente) ───────────────── */
const StoreLayout = ({ variant }) => {
  const { logout } = useAuth();
  const basePath = variant === 'cliente' ? '/cliente' : '/usuario';

  return (
    <div className="store-layout">
      <TopBar onLogout={logout} variant={variant} />
      <CartToast basePath={basePath} />
      <div className="store-content">
        <div className="admin-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};


/* ─── Rutas ─────────────────────────────────────────────────── */
function AppRoutes() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return (
    <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
      <div className="spinner" />
      <p style={{ marginTop: '1rem' }}>Validando sesión...</p>
    </div>
  );

  const isAdmin = role === 'Administrador';

  return (
    <Routes>
      {/* Redirección inicial */}
      <Route path="/" element={<Navigate to="/usuario/inicio" replace />} />

      {/* Auth (sin layout) */}
      <Route path="/login"    element={isAuthenticated ? <Navigate to={isAdmin ? '/admin/inicio' : '/cliente/inicio'} replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={isAdmin ? '/admin/inicio' : '/cliente/inicio'} replace /> : <Register />} />

      {/* ── Usuario / Invitado ──────────────────────────────── */}
      <Route path="/usuario">
        <Route path="login" element={isAuthenticated ? <Navigate to="/usuario/inicio" replace /> : <Login />} />
        <Route element={<StoreLayout variant="usuario" />}>
          <Route index      element={<Navigate to="inicio" replace />} />
          <Route path="inicio"    element={<Inicio />} />
          <Route path="productos" element={<Productos variant="usuario" />} />
          <Route path="carrito"   element={<Carrito variant="usuario" />} />
          <Route path="pedidos"   element={<Pedidos variant="usuario" />} />
          <Route path="ayuda"     element={<Ayuda />} />
          <Route path="contacto"  element={<Contacto />} />
        </Route>
      </Route>

      {/* ── Cliente Registrado ──────────────────────────────── */}
      <Route
        path="/cliente"
        element={
          <ProtectedRoute allowedRoles={['Cliente', 'Administrador']}>
            <StoreLayout variant="cliente" />
          </ProtectedRoute>
        }
      >
        <Route index      element={<Navigate to="inicio" replace />} />
        <Route path="inicio"    element={<Inicio />} />
        <Route path="productos" element={<Productos variant="cliente" />} />
        <Route path="carrito"   element={<Carrito variant="cliente" />} />
        <Route path="pedidos"   element={<Pedidos variant="cliente" />} />
        <Route path="ayuda"     element={<Ayuda />} />
        <Route path="contacto"  element={<Contacto />} />
        <Route path="perfil"    element={<Perfil />} />
      </Route>

      {/* ── Administrador ───────────────────────────────────── */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['Administrador']}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index          element={<Navigate to="inicio" replace />} />
        <Route path="inicio"       element={<Inicio />} />
        <Route path="usuarios"     element={<Usuarios />} />
        <Route path="roles"        element={<Roles />} />
        <Route path="categorias"   element={<Categorias />} />
        <Route path="productos"    element={<Productos variant="admin" />} />
        <Route path="pedidos"      element={<Pedidos variant="admin" />} />
        <Route path="facturas"     element={<Facturas />} />
        <Route path="proveedores"  element={<Proveedores />} />
        <Route path="repartidores" element={<Repartidores />} />
        <Route path="perfil"       element={<Perfil />} />
        <Route path="reportes"     element={<Reportes />} />
      </Route>

      {/* Catch-all */}
      <Route path="/*" element={<Navigate to="/usuario/inicio" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;