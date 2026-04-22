/**
 * @file AdminSidebar.jsx
 * @description Sidebar de navegación para el panel de administración.
 * Colapsable, agrupado por sección y con animación suave.
 */
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Boxes, Receipt, Tags, BarChart2,
  UsersRound, Building2, Bike, Shield,
  UserCog, LogOut, PanelLeftClose, PanelLeftOpen
} from 'lucide-react';

const NAV_GROUPS = [
  {
    label: 'Tienda',
    items: [
      { to: '/admin/inicio',     Icon: LayoutDashboard, label: 'Dashboard'  },
      { to: '/admin/pedidos',    Icon: ShoppingBag,     label: 'Pedidos'    },
      { to: '/admin/productos',  Icon: Boxes,           label: 'Productos'  },
      { to: '/admin/facturas',   Icon: Receipt,         label: 'Facturas'   },
      { to: '/admin/categorias', Icon: Tags,            label: 'Categorías' },
      { to: '/admin/reportes',   Icon: BarChart2,       label: 'Reportes'   },
    ],
  },
  {
    label: 'Personas',
    items: [
      { to: '/admin/usuarios',     Icon: UsersRound, label: 'Usuarios'     },
      { to: '/admin/proveedores',  Icon: Building2,  label: 'Proveedores'  },
      { to: '/admin/repartidores', Icon: Bike,       label: 'Repartidores' },
    ],
  },
  {
    label: 'Sistema',
    items: [
      { to: '/admin/roles',  Icon: Shield,  label: 'Roles'     },
      { to: '/admin/perfil', Icon: UserCog, label: 'Mi Perfil' },
    ],
  },
];

const AdminSidebar = ({ collapsed, onToggle, onLogout }) => {
  return (
    <aside className={`adm-sidebar${collapsed ? ' adm-sidebar--collapsed' : ''}`}>

      {/* ── Logo ─────────────────────────────────────────── */}
      <div className="adm-sb-logo">
        <div className="adm-sb-logo-icon">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 22H22L12 2Z" fill="white" />
          </svg>
        </div>
        {!collapsed && <span className="adm-sb-logo-text">Nexbit</span>}
      </div>

      {/* ── Navigation ───────────────────────────────────── */}
      <nav className="adm-sb-nav">
        {NAV_GROUPS.map(({ label, items }) => (
          <div key={label} className="adm-sb-group">
            {!collapsed && (
              <span className="adm-sb-group-label">{label}</span>
            )}
            {items.map(({ to, Icon, label: itemLabel }) => (
              <NavLink
                key={to}
                to={to}
                title={collapsed ? itemLabel : undefined}
                className={({ isActive }) =>
                  `adm-sb-link${isActive ? ' adm-sb-link--active' : ''}`
                }
              >
                <Icon size={18} className="adm-sb-icon" />
                {!collapsed && <span>{itemLabel}</span>}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* ── Footer ───────────────────────────────────────── */}
      <div className="adm-sb-footer">
        <button
          className="adm-sb-link adm-sb-logout"
          onClick={onLogout}
          title={collapsed ? 'Cerrar sesión' : undefined}
        >
          <LogOut size={18} className="adm-sb-icon" />
          {!collapsed && <span>Cerrar sesión</span>}
        </button>

        <button className="adm-sb-collapse" onClick={onToggle} title="Expandir / Colapsar">
          {collapsed
            ? <PanelLeftOpen  size={16} />
            : <PanelLeftClose size={16} />
          }
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
