/**
 * @file Pedidos.jsx
 * @description Gestión de pedidos para Administradores y Clientes.
 * Incluye visualización de detalles, generación de tickets y gestión de estados.
 */
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2, ShoppingCart, Download, Eye, X, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useModalScroll } from '../hooks/useModalScroll';

const URL_API = "http://localhost:3000/api/pedidos";
const URL_USUARIOS = "http://localhost:3000/api/usuarios";

const Pedidos = ({ variant }) => {
  const [pedidos, setPedidos] = useState([]);
  const [usuariosList, setUsuariosList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [enEdicion, setEnEdicion] = useState(false);
  const [loading, setLoading] = useState(true);

  // Modal de detalle de pedido
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [pedidoDetalle, setPedidoDetalle] = useState(null);

  const navigate = useNavigate();
  const isAdminView = variant === 'admin' || !variant;
  const isGuestView = variant === 'guest';
  useModalScroll(showModal || showDetailModal);

  // Paginación y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("usuario_nombre");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Campos del formulario
  const [idPedido, setIdPedido] = useState(null);
  const [usuarioId, setUsuarioId] = useState("");
  const [total, setTotal] = useState(0);
  const [estado, setEstado] = useState('PENDIENTE');

  const listar = () => {
    setLoading(true);
    axios.get(URL_API)
      .then(res => setPedidos(res.data))
      .catch(err => console.error("Error al listar pedidos:", err))
      .finally(() => setLoading(false));
  };

  const listarUsuarios = () => {
    if (!isAdminView) return;
    axios.get(URL_USUARIOS)
      .then(res => setUsuariosList(res.data))
      .catch(err => console.error("Error al listar usuarios:", err));
  };

  // ── Ver detalles de un pedido en modal ──────────────────────────
  const verDetalles = async (pedidoId) => {
    setDetailLoading(true);
    setShowDetailModal(true);
    try {
      const res = await axios.get(`${URL_API}/${pedidoId}/ticket`);
      setPedidoDetalle(res.data);
    } catch (err) {
      console.error('Error cargando detalles:', err);
      alert('No se pudieron cargar los detalles del pedido.');
      setShowDetailModal(false);
    } finally {
      setDetailLoading(false);
    }
  };

  // --- LÓGICA RF011: Cancelación para el Cliente ---
  const cancelarMiPedido = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas cancelar este pedido?")) {
      try {
        await axios.put(`${URL_API}/${id}/cancelar`);
        listar(); // Refrescamos la lista automáticamente
        alert("Pedido cancelado correctamente.");
      } catch (err) {
        alert(err.response?.data?.message || "Error al cancelar");
      }
    }
  };

  useEffect(() => {
    listar();
    listarUsuarios();
  }, [isAdminView]);

  const limpiarFormulario = () => {
    setUsuarioId(""); setTotal(0); setEstado('PENDIENTE');
    setEnEdicion(false); setIdPedido(null);
    setShowModal(false);
  };

  const abrirRegistro = () => {
    limpiarFormulario();
    const nextId = pedidos.length > 0 ? Math.max(...pedidos.map(p => p.id_pedido)) + 1 : 1;
    setIdPedido(nextId);
    setShowModal(true);
  };

  const seleccionarPedido = (p) => {
    setIdPedido(p.id_pedido);
    setUsuarioId(p.usuario_id);
    setTotal(p.total);
    setEstado(p.estado);
    setEnEdicion(true);
    setShowModal(true);
  };

  const guardar = () => {
    const datos = {
      usuario_id: usuarioId,
      total: parseFloat(total),
      estado
    };

    if (!usuarioId && !enEdicion) {
      alert("El usuario es obligatorio para crear un pedido");
      return;
    }

    if (enEdicion) {
      axios.put(`${URL_API}/${idPedido}`, datos)
        .then(() => {
          limpiarFormulario();
          listar();
          alert("Pedido actualizado correctamente.");
        })
        .catch(err => {
          console.error("Error interno:", err);
          alert("Error al actualizar: " + (err.response?.data?.message || err.message));
        });
    } else {
      axios.post(URL_API, datos)
        .then(() => {
          limpiarFormulario();
          listar();
          alert("Pedido creado con éxito.");
        })
        .catch(err => {
          console.error("Error interno:", err);
          alert("Error al crear: " + (err.response?.data?.message || err.message));
        });
    }
  };

  const eliminar = (id) => {
    if (window.confirm("¿Confirmar eliminación de este registro?")) {
      axios.delete(`${URL_API}/${id}`)
        .then(() => listar())
        .catch(err => {
          console.error("Error al eliminar:", err);
          alert("No se puede eliminar el pedido. Es posible que tenga facturas relacionadas.\nDetalle: " + (err.response?.data?.error || err.message));
        });
    }
  };

  const descargarTicket = async (pedidoId) => {
    try {
      const res = await axios.get(`${URL_API}/${pedidoId}/ticket`);
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
          <title>Comprobante de Pedido - #${pedido.id_pedido}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; background: #e2e8f0; padding: 40px 20px; color: #1e293b; }
            .ticket { max-width: 600px; margin: 0 auto; background: #fff; border-radius: 4px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); overflow: hidden; border-top: 6px solid #0f172a; }
            .ticket-header { padding: 32px 32px 16px 32px; display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f1f5f9; }
            .ticket-header .brand { font-size: 1.75rem; font-weight: 700; color: #0f172a; margin-bottom: 4px; letter-spacing: -0.5px; }
            .ticket-header .doc-type { font-size: 0.85rem; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: 600; }
            .ticket-header .order-id { text-align: right; }
            .ticket-header .order-id-label { font-size: 0.75rem; color: #64748b; text-transform: uppercase; font-weight: 600; margin-bottom: 4px; }
            .ticket-header .order-id-value { font-size: 1.25rem; font-weight: 700; color: #0f172a; }
            .ticket-body { padding: 32px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; background: #f8fafc; padding: 20px; border-radius: 6px; border: 1px solid #f1f5f9; }
            .info-item label { display: block; font-size: 0.75rem; text-transform: uppercase; color: #64748b; font-weight: 600; margin-bottom: 6px; }
            .info-item span { font-size: 0.95rem; font-weight: 500; color: #0f172a; }
            .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 0.8rem; font-weight: 600; border: 1px solid transparent; }
            .badge-pendiente { background: #fffbeb; color: #b45309; border-color: #fde68a; }
            .badge-pagado { background: #f0fdf4; color: #15803d; border-color: #bbf7d0; }
            .badge-entregado { background: #eff6ff; color: #1d4ed8; border-color: #bfdbfe; }
            .badge-cancelado { background: #fef2f2; color: #b91c1c; border-color: #fecaca; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 32px; }
            thead th { border-bottom: 2px solid #e2e8f0; padding: 12px 12px; font-size: 0.8rem; text-transform: uppercase; color: #64748b; font-weight: 600; text-align: left; }
            thead th:nth-child(2), thead th:nth-child(3), thead th:nth-child(4) { text-align: center; }
            thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
            tbody td { padding: 14px 12px; font-size: 0.95rem; color: #334155; border-bottom: 1px solid #f1f5f9; }
            .total-section { display: flex; justify-content: flex-end; }
            .total-box { width: 250px; }
            .total-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; }
            .total-row.final { border-top: 2px solid #0f172a; padding-top: 16px; margin-top: 4px; }
            .total-row .label { font-size: 0.9rem; font-weight: 600; color: #64748b; }
            .total-row.final .label { font-size: 1.1rem; font-weight: 700; color: #0f172a; }
            .total-row .amount { font-size: 1rem; font-weight: 600; color: #334155; }
            .total-row.final .amount { font-size: 1.5rem; font-weight: 700; color: #0f172a; }
            .ticket-footer { text-align: center; padding: 24px 32px; background: #fff; border-top: 1px solid #f1f5f9; }
            .ticket-footer p { font-size: 0.85rem; color: #64748b; line-height: 1.5; }
            .ticket-footer .doc-info { font-size: 0.75rem; color: #94a3b8; margin-top: 12px; }
            @media print {
              body { background: #fff; padding: 0; }
              .ticket { box-shadow: none; border: none; border-top: 6px solid #0f172a; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div style="text-align:center;margin-bottom:24px;" class="no-print">
            <button onclick="window.print()" style="padding:12px 32px;background:#0f172a;color:#fff;border:none;border-radius:4px;font-weight:500;cursor:pointer;font-size:1rem;letter-spacing:0.5px;transition:background 0.2s;">
              Imprimir Documento
            </button>
          </div>
          <div class="ticket">
            <div class="ticket-header">
              <div>
                <div class="brand">Nexbit</div>
                <div class="doc-type">Comprobante de Pedido</div>
              </div>
              <div class="order-id">
                <div class="order-id-label">Nº de Pedido</div>
                <div class="order-id-value">${String(pedido.id_pedido).padStart(6, '0')}</div>
              </div>
            </div>
            <div class="ticket-body">
              <div class="info-grid">
                <div class="info-item">
                  <label>Cliente</label>
                  <span>${pedido.usuario_nombre || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <label>Documento de Identidad</label>
                  <span>${pedido.numero_documento || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <label>Fecha de Emisión</label>
                  <span>${new Date(pedido.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="info-item">
                  <label>Estado del Pedido</label>
                  <span class="badge badge-${pedido.estado?.toLowerCase() || 'pendiente'}">${pedido.estado || 'PENDIENTE'}</span>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Descripción del Producto</th>
                    <th>Cantidad</th>
                    <th>Precio Unitario</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${filasProductos}
                </tbody>
              </table>
              <div class="total-section">
                <div class="total-box">
                  <div class="total-row final">
                    <span class="label">Total a Pagar</span>
                    <span class="amount">$${Number(pedido.total).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="ticket-footer">
              <p>Este documento constituye el comprobante oficial de su pedido en Nexbit.</p>
              <p>Para consultas o reclamos, por favor conserve este número de pedido.</p>
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
      alert("No se pudo generar el ticket de compra. " + (err.response?.data?.message || err.message));
    }
  };

  // ── Filtrado y paginación ──
  const filteredPedidos = pedidos.filter(p => {
    if (!isAdminView) {
      const userStr = localStorage.getItem('user');
      const user = userStr ? JSON.parse(userStr) : null;
      if (!user || p.usuario_id !== user.id_usuario) return false;
    }

    if (!searchTerm) return true;
    const value = p[searchField];
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredPedidos.length / itemsPerPage);
  const currentItems = filteredPedidos.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // ── Vista: Invitado ──
  if (isGuestView) {
    return (
      <div className="module-container" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <ShoppingCart size={64} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1.5rem' }} />
        <h2>Debe registrarse o iniciar sesión para completar el pedido</h2>
        <button onClick={() => navigate('/login')} style={{ marginTop: '20px', padding: '12px 24px', background: 'var(--primary)', color: '#0f172a', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}>
          Iniciar Sesión / Registrarse
        </button>
      </div>
    );
  }

  // ── Vista: Cliente (Mis Pedidos) ──
  if (!isAdminView) {
    return (
      <>
        <div className="module-container">
          <div className="module-header" style={{marginBottom: '2rem'}}>
          <h1 className="module-title-table" style={{fontSize: '2rem', fontWeight: '800', color: '#111827', letterSpacing: '-0.03em'}}>Mis Pedidos</h1>
        </div>
        
        <div className="module-content">
          {currentItems.length === 0 ? (
            <div className="empty-orders">
              <div className="empty-icon-wrap">
                <ShoppingCart size={32} color="#9ca3af" />
              </div>
              <h3>Aún no tienes pedidos</h3>
              <p>Cuando realices una compra, aparecerá aquí para que puedas hacerle seguimiento.</p>
            </div>
          ) : (
            <div className="orders-grid">
              {currentItems.map((p) => (
                <div className="order-card" key={p.id_pedido}>
                  <div className="order-header">
                    <span className="order-id">#{p.id_pedido}</span>
                    <span className={`order-status status-${p.estado?.toLowerCase() || 'pendiente'}`}>
                      {p.estado}
                    </span>
                  </div>
                  
                  <div className="order-body">
                    <div className="order-info-row">
                      <span className="order-info-label">Fecha de orden</span>
                      <span className="order-info-value">{new Date(p.fecha).toLocaleDateString()}</span>
                    </div>
                    <div className="order-info-row order-total-row">
                      <span className="order-info-label">Total a pagar</span>
                      <span className="order-total-value">${Number(p.total).toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="order-actions">
                    <button
                      className="btn-order-action btn-download"
                      onClick={() => verDetalles(p.id_pedido)}
                      style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #e2e8f0' }}
                    >
                      <Eye size={16} /> Ver Detalles
                    </button>

                    <button
                      className="btn-order-action btn-download"
                      onClick={() => descargarTicket(p.id_pedido)}
                    >
                      <Download size={16} /> Ticket
                    </button>

                    {p.estado === 'PENDIENTE' && (
                      <button
                        className="btn-order-action btn-cancel-order"
                        onClick={() => cancelarMiPedido(p.id_pedido)}
                      >
                        <Trash2 size={16} /> Cancelar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="pagination-bar">
              <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Anterior</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button key={num} className={`page-btn ${currentPage === num ? 'active' : ''}`} onClick={() => setCurrentPage(num)}>{num}</button>
              ))}
              <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Siguiente</button>
            </div>
          )}
        </div>
      </div>

      {/* ── MODAL DETALLE DE PEDIDO ─────────────────────────────── */}
      {showDetailModal && (
        <div className="modal-backdrop" onClick={() => setShowDetailModal(false)}>
          <div
            className="modal-box"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '700px', maxHeight: '85vh', overflowY: 'auto' }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>
                {pedidoDetalle ? `Pedido #${String(pedidoDetalle.id_pedido).padStart(6, '0')}` : 'Cargando...'}
              </h2>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {pedidoDetalle && (
                  <button
                    onClick={() => { setShowDetailModal(false); descargarTicket(pedidoDetalle.id_pedido); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px', background: '#0f172a', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}
                  >
                    <Download size={15} /> Descargar Ticket
                  </button>
                )}
                <button onClick={() => setShowDetailModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#94a3b8', lineHeight: 1 }}>
                  <X size={22} />
                </button>
              </div>
            </div>

            {detailLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>Cargando detalles...</div>
            ) : pedidoDetalle ? (
              <>
                {/* Info general */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#f8fafc', borderRadius: '12px', padding: '16px', marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Cliente</div>
                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{pedidoDetalle.usuario_nombre || 'N/A'}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Estado</div>
                    <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700,
                      background: pedidoDetalle.estado === 'PENDIENTE' ? '#fffbeb' : pedidoDetalle.estado === 'CANCELADO' ? '#fef2f2' : '#f0fdf4',
                      color: pedidoDetalle.estado === 'PENDIENTE' ? '#b45309' : pedidoDetalle.estado === 'CANCELADO' ? '#b91c1c' : '#15803d'
                    }}>{pedidoDetalle.estado}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Fecha</div>
                    <div style={{ fontWeight: 500, color: '#334155' }}>{new Date(pedidoDetalle.fecha_pedido || pedidoDetalle.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, marginBottom: '4px' }}>Total</div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0f172a' }}>${Number(pedidoDetalle.total).toLocaleString()}</div>
                  </div>
                </div>

                {/* Productos del pedido con imágenes */}
                <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', color: '#64748b', fontWeight: 700, letterSpacing: '0.05em', marginBottom: '12px' }}>Productos</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {(pedidoDetalle.detalles || []).length === 0 ? (
                    <p style={{ color: '#94a3b8', textAlign: 'center', padding: '2rem' }}>Sin productos detallados.</p>
                  ) : (
                    (pedidoDetalle.detalles || []).map(d => (
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
  }

  // ── Vista: Admin ──
  return (
    <>
      <div className="top-action-bar">
        <button className="btn-add-record" onClick={abrirRegistro}>Añadir Pedido</button>
        <div className="search-container">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <select
            className="search-select"
            value={searchField}
            onChange={(e) => { setSearchField(e.target.value); setCurrentPage(1); }}
          >
            <option value="usuario_nombre">Cliente/Usuario</option>
            <option value="id_pedido">ID Pedido</option>
            <option value="estado">Estado</option>
          </select>
          <button className="btn-search-ok" onClick={() => setCurrentPage(1)}>OK</button>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <div className="spinner"></div>
            <p style={{ marginTop: '1rem' }}>Cargando datos...</p>
          </div>
        ) : pedidos.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <ShoppingCart size={64} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1.5rem' }} />
            <h2>No hay pedidos registrados</h2>
            <p>Haz clic en "Añadir Pedido" para comenzar.</p>
          </div>
        ) : (
          <table className="styled-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente / Usuario</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
                <th>Ticket</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((p) => (
                <tr key={p.id_pedido}>
                  <td>{p.id_pedido}</td>
                  <td>{p.usuario_nombre || p.usuario_id}</td>
                  <td>${Number(p.total).toLocaleString()}</td>
                  <td>
                    <span className="badge-rol" style={{ backgroundColor: p.estado === 'PENDIENTE' ? '#f59f00' : p.estado === 'CANCELADO' ? '#e03131' : '#2f9e44' }}>
                      {p.estado}
                    </span>
                  </td>
                  <td>{new Date(p.fecha).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button className="btn-icon" onClick={() => seleccionarPedido(p)}>
                      <Pencil size={18} color="var(--primary)" />
                    </button>
                    <button className="btn-icon" onClick={() => eliminar(p.id_pedido)}>
                      <Trash2 size={18} color="var(--danger)" />
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-icon"
                      onClick={() => descargarTicket(p.id_pedido)}
                      title="Descargar Ticket de Compra"
                    >
                      <Download size={18} color="var(--primary)" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {!loading && totalPages > 1 && (
        <div className="pagination-bar">
          <button
            className="page-btn"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              className={`page-btn ${currentPage === num ? 'active' : ''}`}
              onClick={() => setCurrentPage(num)}
            >
              {num}
            </button>
          ))}
          <button
            className="page-btn"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next
          </button>
        </div>
      )}

      {showModal && (
        <div className="modal-backdrop">
          <div className="modal-box">
            <h2>{enEdicion ? "Actualizar Pedido" : "Nuevo Pedido"}</h2>
            <div className="form-grid">
              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>ID</label>
                <input type="text" value={idPedido || ''} disabled style={{ background: 'var(--border)', cursor: 'not-allowed' }} />
              </div>

              {!enEdicion && (
                <div className="input-field" style={{ gridColumn: 'span 2' }}>
                  <label>Cliente / Usuario *</label>
                  <select value={usuarioId} onChange={(e) => setUsuarioId(Number(e.target.value))}>
                    <option value="" disabled>Seleccione un usuario...</option>
                    {usuariosList.map(u => (
                      <option key={u.id_usuario} value={u.id_usuario}>{u.nombre} - {u.numero_documento}</option>
                    ))}
                  </select>
                </div>
              )}

              <div className="input-field">
                <label>Total</label>
                <input type="number" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} />
              </div>

              <div className="input-field">
                <label>Estado</label>
                <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                  <option value="PENDIENTE">PENDIENTE</option>
                  <option value="PAGADO">PAGADO</option>
                  <option value="ENTREGADO">ENTREGADO</option>
                  <option value="CANCELADO">CANCELADO</option>
                </select>
              </div>

            </div>
            <div className="modal-btns">
              <button className="btn-cancel" onClick={limpiarFormulario}>Cancelar</button>
              <button className="btn-save" onClick={guardar}>Guardar Cambios</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Componente de imagen para detalles de pedido (con fallback)
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

export default Pedidos;