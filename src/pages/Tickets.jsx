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
import { Ticket, Search, Eye, CheckCircle, Clock, XCircle, Download, X, Package } from 'lucide-react';

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
  const [detailLoading, setDetailLoading] = useState(false);

  const verDetalles = async (pedidoId) => {
    setDetailLoading(true);
    setSelected({ id_pedido: pedidoId });
    try {
      const res = await api.get(`/api/pedidos/${pedidoId}/ticket`);
      setSelected(res.data);
    } catch (err) {
      console.error('Error cargando detalles:', err);
      alert('No se pudieron cargar los detalles del ticket.');
      setSelected(null);
    } finally {
      setDetailLoading(false);
    }
  };

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

  // ── Generar Ticket Descargable ──────────────────────────────────────────
  const descargarTicket = async (pedidoId) => {
    try {
      const res = await api.get(`/api/pedidos/${pedidoId}/ticket`);
      const pedido = res.data;
      const detalles = pedido.detalles || [];

      const filasProductos = detalles.length > 0
        ? detalles.map(d => `
          <tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;">${d.producto_nombre}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:center;">${d.cantidad}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">$${Number(d.precio_unitario).toLocaleString()}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e2e8f0;text-align:right;">$${Number(d.subtotal).toLocaleString()}</td>
          </tr>
        `).join('')
        : `<tr><td colspan="4" style="padding:12px;text-align:center;color:#94a3b8;">Este pedido no tiene productos detallados</td></tr>`;

      const ticketHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8"/>
          <title>Factura Comercial - #${pedido.id_pedido}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; background: #e2e8f0; padding: 40px 20px; color: #1e293b; }
            .ticket { max-width: 800px; margin: 0 auto; background: #fff; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; }
            .ticket-header { padding: 40px; display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #f1f5f9; }
            .company-info .brand { font-size: 2rem; font-weight: 800; color: #0f172a; letter-spacing: -1px; margin-bottom: 8px; }
            .company-info .details { font-size: 0.85rem; color: #64748b; line-height: 1.6; }
            .invoice-details { text-align: right; }
            .invoice-details .title { font-size: 1.5rem; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 8px; }
            .invoice-details .order-id { font-size: 1rem; color: #64748b; font-weight: 500; }
            .ticket-body { padding: 40px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .info-box { background: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .info-box h3 { font-size: 0.85rem; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 12px; letter-spacing: 1px; }
            .info-box p { font-size: 0.95rem; color: #0f172a; font-weight: 500; margin-bottom: 4px; }
            .info-box .light { color: #64748b; font-weight: 400; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 40px; }
            thead th { background: #0f172a; color: #fff; padding: 16px; font-size: 0.85rem; text-transform: uppercase; font-weight: 600; text-align: left; letter-spacing: 1px; }
            thead th:nth-child(2), thead th:nth-child(3), thead th:nth-child(4) { text-align: center; }
            thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
            tbody td { padding: 16px; font-size: 0.95rem; color: #334155; border-bottom: 1px solid #e2e8f0; }
            tbody tr:nth-child(even) { background: #f8fafc; }
            .total-section { display: flex; justify-content: flex-end; }
            .total-box { width: 300px; background: #f8fafc; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; }
            .total-row { display: flex; justify-content: space-between; align-items: center; padding: 8px 0; }
            .total-row.final { border-top: 2px solid #cbd5e1; padding-top: 16px; margin-top: 8px; }
            .total-row .label { font-size: 0.9rem; font-weight: 600; color: #64748b; }
            .total-row.final .label { font-size: 1.2rem; font-weight: 800; color: #0f172a; }
            .total-row .amount { font-size: 1rem; font-weight: 600; color: #334155; }
            .total-row.final .amount { font-size: 1.5rem; font-weight: 800; color: #0f172a; }
            .ticket-footer { text-align: center; padding: 32px 40px; background: #0f172a; color: #fff; }
            .ticket-footer p { font-size: 0.9rem; margin-bottom: 8px; opacity: 0.9; }
            .ticket-footer .doc-info { font-size: 0.8rem; opacity: 0.6; }
            .status-badge { display: inline-block; padding: 6px 16px; border-radius: 4px; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-top: 12px; }
            .status-pendiente { background: #fef3c7; color: #b45309; }
            .status-pagado { background: #dcfce7; color: #15803d; }
            .status-entregado { background: #dbeafe; color: #1e3a8a; }
            .status-cancelado { background: #fee2e2; color: #b91c1c; }
            @media print {
              body { background: #fff; padding: 0; }
              .ticket { box-shadow: none; border: none; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div style="text-align:center;margin-bottom:24px;" class="no-print">
            <button onclick="window.print()" style="padding:14px 40px;background:#2563eb;color:#fff;border:none;border-radius:6px;font-weight:600;cursor:pointer;font-size:1.1rem;letter-spacing:0.5px;transition:background 0.2s; box-shadow: 0 4px 6px rgba(37,99,235,0.2);">
              🖨️ Imprimir Factura
            </button>
          </div>
          <div class="ticket">
            <div class="ticket-header">
              <div class="company-info">
                <div class="brand">RematesPaisa</div>
                <div class="details">
                  NIT: 900.123.456-7<br/>
                  Calle Falsa 123, Medellín, Colombia<br/>
                  Tel: +57 (4) 123 4567<br/>
                  soporte@rematespaisa.com
                </div>
              </div>
              <div class="invoice-details">
                <div class="title">Factura</div>
                <div class="order-id">Nº ${String(pedido.id_pedido).padStart(6, '0')}</div>
                <div class="status-badge status-${pedido.estado?.toLowerCase() || 'pendiente'}">
                  ${pedido.estado || 'PENDIENTE'}
                </div>
              </div>
            </div>
            <div class="ticket-body">
              <div class="info-grid">
                <div class="info-box">
                  <h3>Facturar A</h3>
                  <p>${pedido.usuario_nombre || 'N/A'}</p>
                  <p class="light">Documento: ${pedido.numero_documento || 'N/A'}</p>
                  ${pedido.direccion ? `<p class="light">Dirección: ${pedido.direccion}</p>` : ''}
                </div>
                <div class="info-box">
                  <h3>Detalles de Emisión</h3>
                  <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                    <span class="light">Fecha:</span>
                    <span>${new Date(pedido.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                  <div style="display:flex; justify-content:space-between;">
                    <span class="light">Moneda:</span>
                    <span>COP (Pesos Colombianos)</span>
                  </div>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Descripción</th>
                    <th>Cant.</th>
                    <th>Precio Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${filasProductos}
                </tbody>
              </table>
              <div class="total-section">
                <div class="total-box">
                  <div class="total-row">
                    <span class="label">Subtotal</span>
                    <span class="amount">$${Number(pedido.total).toLocaleString()}</span>
                  </div>
                  <div class="total-row">
                    <span class="label">Impuestos (IVA 0%)</span>
                    <span class="amount">$0</span>
                  </div>
                  <div class="total-row final">
                    <span class="label">Total a Pagar</span>
                    <span class="amount">$${Number(pedido.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="ticket-footer">
              <p>Gracias por tu compra en RematesPaisa. ¡Vuelve pronto!</p>
              <div class="doc-info">
                Documento generado el ${new Date().toLocaleString('es-CO')}
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      const ventanaTicket = window.open('', '_blank', 'width=600,height=800');
      if (ventanaTicket) {
        ventanaTicket.document.write(ticketHTML);
        ventanaTicket.document.close();
      } else {
        alert('Por favor permite ventanas emergentes para descargar el ticket.');
      }

    } catch (err) {
      console.error("Error al generar ticket:", err);
      alert("No se pudo generar el ticket de compra. " + (err?.response?.data?.message || err.message));
    }
  };

  const filtrados = tickets.filter(t => {
    const q = searchTerm.toLowerCase();
    return (
      String(t.id_pedido).includes(q) ||
      (t.usuario_nombre || '').toLowerCase().includes(q) ||
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
                      <td style={tdStyle}>{t.usuario_nombre || '—'}</td>
                      <td style={tdStyle}>
                        {(t.fecha || t.fecha_pedido)
                          ? new Date(t.fecha || t.fecha_pedido).toLocaleDateString('es-CO')
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
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            className="btn-icon"
                            title="Ver detalle del ticket"
                            onClick={() => verDetalles(t.id_pedido)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            className="btn-icon"
                            title="Descargar Ticket"
                            onClick={() => descargarTicket(t.id_pedido)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)' }}
                          >
                            <Download size={18} />
                          </button>
                        </div>
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
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div
            className="modal-box"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Ticket size={24} color="var(--primary)" />
                {selected.total !== undefined ? `Ticket #${String(selected.id_pedido).padStart(5, '0')}` : 'Cargando...'}
              </h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {selected.total !== undefined && (
                  <button
                    onClick={() => { descargarTicket(selected.id_pedido); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    <Download size={15} /> Descargar
                  </button>
                )}
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}>
                  <X size={22} />
                </button>
              </div>
            </div>

            {detailLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Cargando detalles...</div>
            ) : selected.total !== undefined ? (
              <>
                {/* Info general */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Cliente</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{selected.usuario_nombre || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Estado</div>
                    <EstadoBadge estado={selected.estado} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Fecha</div>
                    <div style={{ fontWeight: 500, color: '#334155' }}>{new Date(selected.fecha_pedido || selected.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Total</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>${Number(selected.total).toLocaleString()}</div>
                  </div>
                </div>

                {/* Productos del pedido con imágenes */}
                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '12px' }}>Productos</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(selected.detalles || []).length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Sin productos detallados.</p>
                  ) : (
                    (selected.detalles || []).map(d => (
                      <div key={d.id_detalle_pedido} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '12px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                        {/* Imagen del producto */}
                        <div style={{ width: '72px', height: '72px', borderRadius: '8px', overflow: 'hidden', flexShrink: 0, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <OrderProductImg src={d.imagen_url} alt={d.producto_nombre} />
                        </div>
                        {/* Info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{d.producto_nombre}</div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Cantidad: <strong>{d.cantidad}</strong></div>
                          <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Precio unitario: <strong>${Number(d.precio_unitario).toLocaleString()}</strong></div>
                        </div>
                        {/* Subtotal */}
                        <div style={{ fontWeight: 800, fontSize: '1.1rem', color: '#0f172a', textAlign: 'right', flexShrink: 0 }}>
                          ${Number(d.subtotal).toLocaleString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            ) : null}
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

const OrderProductImg = ({ src, alt }) => {
  const [error, setError] = useState(false);
  if (!src || error) {
    return <Package size={32} color="#94a3b8" />;
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setError(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
    />
  );
};

export default Tickets;
