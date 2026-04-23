/**
 * @file Tickets.jsx
 * @description Vista de Tickets del sistema — reemplaza a Facturas.jsx.
 *
 * CORRECCIÓN #5 — Migración Factura → Ticket:
 * ────────────────────────────────────────────────────────────────────────────
 * Se elimina toda referencia a "Facturas". El sistema ahora opera
 * exclusivamente con "Tickets".
 *
 * Un Ticket en este sistema es el comprobante de pedido que se genera
 * automáticamente cuando un pedido es confirmado. A diferencia de una
 * factura legal, no tiene implicaciones tributarias pero sirve como
 * constancia de la transacción para el cliente y el administrador.
 *
 * Conecta con: GET /api/pedidos  (los pedidos son la base del ticket)
 * Para una implementación real crea un endpoint GET /api/tickets en el backend.
 *
 * FORMATO DE PRECIOS: ✅ Usa Intl.NumberFormat('es-CO') — CORRECCIÓN #1
 */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Ticket, Search, Eye, CheckCircle, Clock, XCircle } from 'lucide-react';

// ── Instancia axios con credenciales (cookie httpOnly) ───────────────────────
const api = axios.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

// ── Utilidad de formato COP ──────────────────────────────────────────────────
const formatCOP = (valor) =>
  new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(valor ?? 0);

// ── Helpers de estado ────────────────────────────────────────────────────────
const ESTADO_CONFIG = {
  confirmado:  { color: '#15803d', bg: '#dcfce7', Icon: CheckCircle },
  pendiente:   { color: '#b45309', bg: '#fef3c7', Icon: Clock       },
  cancelado:   { color: '#b91c1c', bg: '#fee2e2', Icon: XCircle     },
};

const EstadoBadge = ({ estado }) => {
  const cfg = ESTADO_CONFIG[estado?.toLowerCase()] || ESTADO_CONFIG.pendiente;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
      backgroundColor: cfg.bg, color: cfg.color,
      padding: '0.25rem 0.6rem', borderRadius: '999px', fontSize: '0.8rem',
      fontWeight: '600'
    }}>
      <cfg.Icon size={13} />
      {estado || 'Pendiente'}
    </span>
  );
};

// ── Componente principal ─────────────────────────────────────────────────────
const Tickets = () => {
  const [tickets, setTickets]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selected, setSelected]     = useState(null); // ticket en modal de detalle

  // ── Cargar tickets desde el backend ─────────────────────────────────────
  //
  // Por ahora consumimos /api/pedidos. Cuando crees el endpoint /api/tickets
  // en el backend solo debes cambiar la URL aquí.
  //
  const fetchTickets = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/pedidos');
      // Transformamos pedidos a formato de ticket para la vista
      const lista = Array.isArray(data) ? data : (data.pedidos || []);
      setTickets(lista);
    } catch (err) {
      console.error('Error al cargar tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTickets(); }, []);

  // ── Filtro de búsqueda ───────────────────────────────────────────────────
  const filtrados = tickets.filter(t => {
    const q = searchTerm.toLowerCase();
    return (
      String(t.id_pedido).includes(q) ||
      (t.nombre_cliente || t.cliente || '').toLowerCase().includes(q) ||
      (t.estado || '').toLowerCase().includes(q)
    );
  });

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <>
      <header className="main-header">
        <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Ticket size={28} /> Tickets
        </h1>
        <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
          Comprobantes de pedidos confirmados en el sistema
        </p>
      </header>

      <div style={{ padding: '1.5rem' }}>

        {/* ── Barra de búsqueda ─────────────────────────────────────────── */}
        <div className="filter-bar" style={{ marginBottom: '1.5rem' }}>
          <div className="search-box" style={{ position: 'relative', maxWidth: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            <input
              type="text"
              placeholder="Buscar por ID, cliente o estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ paddingLeft: '2.25rem', width: '100%' }}
            />
          </div>
        </div>

        {/* ── Tabla ─────────────────────────────────────────────────────── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
            <div className="spinner" />
            <p style={{ marginTop: '1rem' }}>Cargando tickets...</p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={thStyle}># Ticket</th>
                  <th style={thStyle}>Cliente</th>
                  <th style={thStyle}>Fecha</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Estado</th>
                  <th style={thStyle}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No se encontraron tickets.
                    </td>
                  </tr>
                ) : (
                  filtrados.map((t) => (
                    <tr key={t.id_pedido} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={tdStyle}>
                        <span style={{ fontWeight: '700', color: 'var(--primary)' }}>
                          #TKT-{String(t.id_pedido).padStart(5, '0')}
                        </span>
                      </td>
                      <td style={tdStyle}>{t.nombre_cliente || t.cliente || '—'}</td>
                      <td style={tdStyle}>
                        {t.fecha_pedido
                          ? new Date(t.fecha_pedido).toLocaleDateString('es-CO')
                          : '—'
                        }
                      </td>
                      <td style={tdStyle}>
                        <strong>{formatCOP(t.total || t.total_pedido)}</strong>
                      </td>
                      <td style={tdStyle}>
                        <EstadoBadge estado={t.estado} />
                      </td>
                      <td style={tdStyle}>
                        <button
                          className="btn-icon"
                          title="Ver detalle del ticket"
                          onClick={() => setSelected(t)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Modal de detalle ──────────────────────────────────────────────── */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}
            style={{ maxWidth: '480px', width: '100%' }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Ticket size={20} color="var(--primary)" />
              Ticket #{String(selected.id_pedido).padStart(5, '0')}
            </h2>

            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <Row label="Cliente"  value={selected.nombre_cliente || selected.cliente || '—'} />
              <Row label="Fecha"    value={selected.fecha_pedido ? new Date(selected.fecha_pedido).toLocaleDateString('es-CO') : '—'} />
              <Row label="Estado"   value={<EstadoBadge estado={selected.estado} />} />
              <Row label="Total"    value={<strong>{formatCOP(selected.total || selected.total_pedido)}</strong>} />
              {selected.direccion && <Row label="Dirección" value={selected.direccion} />}
            </div>

            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button className="btn-save" onClick={() => setSelected(null)}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// ── Helpers de estilo ────────────────────────────────────────────────────────
const thStyle = {
  textAlign: 'left', padding: '0.75rem 1rem',
  backgroundColor: '#f8fafc', color: '#475569',
  fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase',
  letterSpacing: '0.05em', borderBottom: '2px solid #e2e8f0'
};
const tdStyle = { padding: '0.75rem 1rem', color: '#334155', fontSize: '0.9rem' };

const Row = ({ label, value }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: '1px solid #f1f5f9', paddingBottom: '0.5rem' }}>
    <span style={{ color: '#64748b', fontSize: '0.875rem' }}>{label}</span>
    <span>{value}</span>
  </div>
);

export default Tickets;
