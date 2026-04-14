import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2, ShoppingCart, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const URL_API = "http://localhost:3000/api/pedidos";
const URL_USUARIOS = "http://localhost:3000/api/usuarios";

const Pedidos = ({ variant }) => {
  const [pedidos, setPedidos] = useState([]);
  const [usuariosList, setUsuariosList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [enEdicion, setEnEdicion] = useState(false);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const isAdminView = variant === 'admin' || !variant;
  const isGuestView = variant === 'guest';

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
          <title>Ticket de Compra - Pedido #${pedido.id_pedido}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Inter', sans-serif; background: #f1f5f9; padding: 20px; color: #1e293b; }
            .ticket { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 4px 24px rgba(0,0,0,0.08); overflow: hidden; }
            .ticket-header { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff; padding: 28px 24px; text-align: center; }
            .ticket-header h1 { font-size: 1.5rem; font-weight: 700; margin-bottom: 4px; letter-spacing: -0.5px; }
            .ticket-header .subtitle { color: #94a3b8; font-size: 0.85rem; }
            .ticket-header .order-id { display: inline-block; margin-top: 12px; background: rgba(56,189,248,0.15); color: #38bdf8; padding: 6px 18px; border-radius: 20px; font-weight: 600; font-size: 0.95rem; }
            .ticket-body { padding: 24px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 22px; }
            .info-item label { display: block; font-size: 0.72rem; text-transform: uppercase; color: #94a3b8; font-weight: 600; letter-spacing: 0.5px; margin-bottom: 3px; }
            .info-item span { font-size: 0.92rem; font-weight: 500; }
            .badge { display: inline-block; padding: 3px 12px; border-radius: 12px; font-size: 0.78rem; font-weight: 600; }
            .badge-pendiente { background: #fef3c7; color: #92400e; }
            .badge-pagado { background: #d1fae5; color: #065f46; }
            .badge-entregado { background: #dbeafe; color: #1e40af; }
            .badge-cancelado { background: #fee2e2; color: #991b1b; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            thead th { background: #f8fafc; padding: 10px 12px; font-size: 0.78rem; text-transform: uppercase; color: #64748b; font-weight: 600; letter-spacing: 0.5px; border-bottom: 2px solid #e2e8f0; text-align: left; }
            thead th:nth-child(2), thead th:nth-child(3), thead th:nth-child(4) { text-align: center; }
            thead th:nth-child(3), thead th:nth-child(4) { text-align: right; }
            .total-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-top: 2px solid #0f172a; margin-top: 4px; }
            .total-row .label { font-size: 1rem; font-weight: 700; color: #0f172a; }
            .total-row .amount { font-size: 1.4rem; font-weight: 700; color: #0f172a; }
            .ticket-footer { text-align: center; padding: 18px 24px; background: #f8fafc; border-top: 1px solid #e2e8f0; }
            .ticket-footer p { font-size: 0.8rem; color: #94a3b8; }
            .ticket-footer .brand { font-weight: 700; color: #38bdf8; }
            @media print {
              body { background: #fff; padding: 0; }
              .ticket { box-shadow: none; border-radius: 0; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div style="text-align:center;margin-bottom:16px;" class="no-print">
            <button onclick="window.print()" style="padding:10px 28px;background:#0f172a;color:#fff;border:none;border-radius:8px;font-weight:600;cursor:pointer;font-size:0.95rem;">
              🖨️ Imprimir / Guardar como PDF
            </button>
          </div>
          <div class="ticket">
            <div class="ticket-header">
              <h1>RematesPaisa</h1>
              <div class="subtitle">Ticket de Compra</div>
              <div class="order-id">Pedido #${pedido.id_pedido}</div>
            </div>
            <div class="ticket-body">
              <div class="info-grid">
                <div class="info-item">
                  <label>Cliente</label>
                  <span>${pedido.usuario_nombre || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <label>Documento</label>
                  <span>${pedido.numero_documento || 'N/A'}</span>
                </div>
                <div class="info-item">
                  <label>Fecha</label>
                  <span>${new Date(pedido.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="info-item">
                  <label>Estado</label>
                  <span class="badge badge-${pedido.estado?.toLowerCase() || 'pendiente'}">${pedido.estado || 'PENDIENTE'}</span>
                </div>
              </div>
              <table>
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Cant.</th>
                    <th>P. Unit.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${filasProductos}
                </tbody>
              </table>
              <div class="total-row">
                <span class="label">TOTAL A PAGAR</span>
                <span class="amount">$${Number(pedido.total).toLocaleString()}</span>
              </div>
            </div>
            <div class="ticket-footer">
              <p>Gracias por tu compra en <span class="brand">RematesPaisa</span></p>
              <p style="margin-top:4px;">Este documento es tu comprobante de compra.</p>
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
      <div className="module-container">
        <div className="module-header">
          <h1 className="module-title-table">Mis Pedidos</h1>
        </div>
        <div className="module-content">
          {currentItems.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem' }}>
              <ShoppingCart size={48} style={{ color: '#94a3b8', opacity: 0.5, marginBottom: '1rem' }} />
              <p style={{ color: '#94a3b8' }}>Aún no tienes pedidos registrados.</p>
            </div>
          ) : (
            <table className="styled-table">
              <thead>
                <tr>
                  <th>ID Pedido</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th>Acciones</th> {/* Cambiado Ticket por Acciones */}
                </tr>
              </thead>
              <tbody>
                {currentItems.map((p) => (
                  <tr key={p.id_pedido}>
                    <td>#{p.id_pedido}</td>
                    <td>{new Date(p.fecha).toLocaleDateString()}</td>
                    <td>${Number(p.total).toLocaleString()}</td>
                    <td>
                      <span className="badge-rol" style={{ backgroundColor: p.estado === 'PENDIENTE' ? '#f59f00' : p.estado === 'CANCELADO' ? '#e03131' : '#2f9e44', fontSize: '0.8rem' }}>
                        {p.estado}
                      </span>
                    </td>
                    <td>
                      {/* DIV CONTENEDOR DE BOTONES (LINEA 268) */}
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        {/* BOTÓN TICKET (RF023) */}
                        <button
                          className="btn-icon"
                          onClick={() => descargarTicket(p.id_pedido)}
                          title="Descargar Ticket de Compra"
                        >
                          <Download size={18} color="var(--primary)" />
                        </button>

                        {/* BOTÓN CANCELAR (RF011): Solo visible si está PENDIENTE */}
                        {p.estado === 'PENDIENTE' && (
                          <button
                            className="btn-icon"
                            onClick={() => cancelarMiPedido(p.id_pedido)}
                            title="Cancelar Pedido"
                          >
                            <Trash2 size={18} color="#ef4444" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {totalPages > 1 && (
            <div className="pagination-bar">
              <button className="page-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>Previous</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
                <button key={num} className={`page-btn ${currentPage === num ? 'active' : ''}`} onClick={() => setCurrentPage(num)}>{num}</button>
              ))}
              <button className="page-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>Next</button>
            </div>
          )}
        </div>
      </div>
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

export default Pedidos;