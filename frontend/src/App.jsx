import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Usuarios from './pages/Usuarios';
import Roles from './pages/Roles';
import Categorias from './pages/Categorias';
import Productos from './pages/Productos';
import Pedidos from './pages/Pedidos';
import Facturas from './pages/Facturas';
import Proveedores from './pages/Proveedores';
import Perfil from './pages/Perfil';
import Inicio from './pages/Inicio';
import Login from './pages/Login';
import Register from './pages/Register';
import Carrito from './pages/Carrito';
import Ayuda from './pages/Ayuda';
import Contacto from './pages/Contacto';
import { Menu } from 'lucide-react';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';
import './services/authService';

const AppLayout = ({ variant }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { logout } = useAuth();
  
  return (
    <div className="app-wrapper">
      <Sidebar
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        onLogout={logout}
        variant={variant}
      />
      <div className={`main-content ${isSidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="mobile-header">
          <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
            <Menu size={28} />
          </button>
          <h2 className="mobile-title">
            {variant === 'admin' ? 'AdminPanel' : 'RematesPaisa'}
          </h2>
        </div>

        <div className="admin-container">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

function AppRoutes() {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Validando sesión...</div>;

  const isAdmin = role === 'Administrador';

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/usuario/inicio" replace />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to={isAdmin ? "/admin/inicio" : "/cliente/inicio"} replace /> : <Login />} />
      <Route path="/register" element={isAuthenticated ? <Navigate to={isAdmin ? "/admin/inicio" : "/cliente/inicio"} replace /> : <Register />} />

      {/* Rutas de Invitado - Totalmente Públicas */}
      <Route path="/usuario" element={<AppLayout variant="usuario" />}>
        <Route index element={<Navigate to="inicio" replace />} />
        <Route path="inicio" element={<Inicio />} />
        <Route path="productos" element={<Productos variant="usuario" />} />
        <Route path="carrito" element={<Carrito variant="usuario" />} />
        <Route path="pedidos" element={<Pedidos variant="usuario" />} />
        <Route path="ayuda" element={<Ayuda />} />
        <Route path="contacto" element={<Contacto />} />
      </Route>

      {/* Rutas de Cliente Registrado */}
      <Route path="/cliente" element={
        <ProtectedRoute allowedRoles={['Cliente', 'Administrador']}>
          <AppLayout variant="cliente" />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="inicio" replace />} />
        <Route path="inicio" element={<Inicio />} />
        <Route path="productos" element={<Productos variant="cliente" />} />
        <Route path="carrito" element={<Carrito variant="cliente" />} />
        <Route path="pedidos" element={<Pedidos variant="cliente" />} />
        <Route path="ayuda" element={<Ayuda />} />
        <Route path="contacto" element={<Contacto />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>

      {/* Rutas de Administrador */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['Administrador']}>
          <AppLayout variant="admin" />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="inicio" replace />} />
        <Route path="inicio" element={<Inicio />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="roles" element={<Roles />} />
        <Route path="categorias" element={<Categorias />} />
        <Route path="productos" element={<Productos variant="admin" />} />
        <Route path="pedidos" element={<Pedidos variant="admin" />} />
        <Route path="facturas" element={<Facturas />} />
        <Route path="proveedores" element={<Proveedores />} />
        <Route path="perfil" element={<Perfil />} />
      </Route>
      
      <Route path="/*" element={<Navigate to="/usuario/inicio" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;