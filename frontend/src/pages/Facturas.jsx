import { useState, useEffect } from 'react';
import api from '../api';
import { Pencil, Trash2, FileText } from 'lucide-react';
import { useModalScroll } from '../hooks/useModalScroll';

const URL_API = "/api/facturas";
const URL_PEDIDOS = "/api/pedidos";

const Facturas = () => {
  const [facturas, setFacturas] = useState([]);
  const [pedidosList, setPedidosList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [enEdicion, setEnEdicion] = useState(false);
  const [loading, setLoading] = useState(true);
  useModalScroll(showModal);

  // Paginación y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("numero_factura");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Campos
  const [idFactura, setIdFactura] = useState(null);
  const [pedidoId, setPedidoId] = useState("");
  const [numeroFactura, setNumeroFactura] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [impuesto, setImpuesto] = useState(0);
  const [total, setTotal] = useState(0);
  const [estado, setEstado] = useState('EMITIDA');

  const listar = () => {
    setLoading(true);
    api.get(URL_API)
      .then(res => setFacturas(res.data))
      .catch(err => console.error("Error al listar facturas:", err))
      .finally(() => setLoading(false));
  };

  const listarPedidos = () => {
    api.get(URL_PEDIDOS)
      .then(res => setPedidosList(res.data))
      .catch(err => console.error("Error al listar pedidos:", err));
  };

  useEffect(() => {
    listar();
    listarPedidos();
  }, []);

  const limpiarFormulario = () => {
    setPedidoId(""); setNumeroFactura(""); setSubtotal(0); setImpuesto(0); setTotal(0); setEstado('EMITIDA');
    setEnEdicion(false); setIdFactura(null);
    setShowModal(false);
  };

  const abrirRegistro = () => {
    limpiarFormulario();
    const nextId = facturas.length > 0 ? Math.max(...facturas.map(f => f.id_factura)) + 1 : 1;
    setIdFactura(nextId);
    setShowModal(true);
  };

  const seleccionarFactura = (f) => {
    setIdFactura(f.id_factura);
    setPedidoId(f.pedido_id);
    setNumeroFactura(f.numero_factura || "");
    setSubtotal(f.subtotal);
    setImpuesto(f.impuesto);
    setTotal(f.total);
    setEstado(f.estado);
    setEnEdicion(true);
    setShowModal(true);
  };

  const guardar = () => {
    const datos = {
      pedido_id: pedidoId,
      numero_factura: numeroFactura,
      subtotal: parseFloat(subtotal),
      impuesto: parseFloat(impuesto),
      total: parseFloat(total),
      estado
    };

    if (!pedidoId && !enEdicion) {
      alert("El pedido es obligatorio para crear una factura");
      return;
    }

    if (enEdicion) {
      api.put(`${URL_API}/${idFactura}`, datos)
        .then(() => {
          limpiarFormulario();
          listar();
          alert("Factura actualizada correctamente.");
        })
        .catch(err => {
          console.error("Error interno:", err);
          alert("Error al actualizar: " + (err.response?.data?.message || err.message));
        });
    } else {
      api.post(URL_API, datos)
        .then(() => {
          limpiarFormulario();
          listar();
          alert("Factura creada con éxito.");
        })
        .catch(err => {
          console.error("Error interno:", err);
          alert("Error al crear: " + (err.response?.data?.message || err.message));
        });
    }
  };

  const eliminar = (id) => {
    if (window.confirm("¿Confirmar eliminación de este registro?")) {
      api.delete(`${URL_API}/${id}`)
        .then(() => listar())
        .catch(err => {
          console.error("Error al eliminar:", err);
          alert("No se puede eliminar la factura.\nDetalle: " + (err.response?.data?.error || err.message));
        });
    }
  };

  const filteredFacturas = facturas.filter(f => {
    if (!searchTerm) return true;
    const value = f[searchField];
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredFacturas.length / itemsPerPage);
  const currentItems = filteredFacturas.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <div className="top-action-bar">
        <button className="btn-add-record" onClick={abrirRegistro}>Añadir Factura</button>
        <div className="search-container">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search..." 
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
          <select 
            className="search-select" 
            value={searchField}
            onChange={(e) => { setSearchField(e.target.value); setCurrentPage(1); }}
          >
            <option value="id_factura">ID Factura</option>
            <option value="numero_factura">Número Factura</option>
            <option value="pedido_id">ID Pedido</option>
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
        ) : facturas.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <FileText size={64} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1.5rem' }} />
            <h2>No hay facturas registradas</h2>
            <p>Haz clic en "Registrar Factura" para comenzar.</p>
          </div>
        ) : (
          <table className="styled-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Número</th>
                <th>Id Pedido</th>
                <th>Subtotal</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((f) => (
                <tr key={f.id_factura}>
                  <td>{f.id_factura}</td>
                  <td><strong>{f.numero_factura}</strong></td>
                  <td>#{f.pedido_id}</td>
                  <td>${Number(f.subtotal).toLocaleString()}</td>
                  <td>${Number(f.total).toLocaleString()}</td>
                  <td>
                    <span className="badge-rol" style={{ backgroundColor: f.estado === 'EMITIDA' ? '#3b82f6' : f.estado === 'ANULADA' ? '#e03131' : '#2f9e44' }}>
                      {f.estado}
                    </span>
                  </td>
                  <td>{new Date(f.fecha).toLocaleDateString()}</td>
                  <td className="actions-cell">
                    <button className="btn-icon" onClick={() => seleccionarFactura(f)}>
                      <Pencil size={18} color="var(--primary)" />
                    </button>
                    <button className="btn-icon" onClick={() => eliminar(f.id_factura)}>
                      <Trash2 size={18} color="var(--danger)" />
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
            <h2>{enEdicion ? "Actualizar Factura" : "Nueva Factura"}</h2>
            <div className="form-grid">
              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>ID</label>
                <input type="text" value={idFactura || ''} disabled style={{ background: 'var(--border)', cursor: 'not-allowed' }}/>
              </div>

              {!enEdicion && (
                <div className="input-field" style={{ gridColumn: 'span 2' }}>
                  <label>Pedido Relacionado *</label>
                  <select value={pedidoId} onChange={(e) => setPedidoId(Number(e.target.value))}>
                    <option value="" disabled>Seleccione un pedido...</option>
                    {pedidosList.map(p => (
                      <option key={p.id_pedido} value={p.id_pedido}>
                        Pedido #{p.id_pedido} - Total: ${p.total}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>Número de Factura</label>
                <input value={numeroFactura} onChange={(e) => setNumeroFactura(e.target.value)} placeholder="Ej: REM-0010" />
              </div>

              <div className="input-field">
                <label>Subtotal</label>
                <input type="number" step="0.01" value={subtotal} onChange={(e) => setSubtotal(e.target.value)} />
              </div>

              <div className="input-field">
                <label>Impuesto</label>
                <input type="number" step="0.01" value={impuesto} onChange={(e) => setImpuesto(e.target.value)} />
              </div>

              <div className="input-field">
                <label>Total</label>
                <input type="number" step="0.01" value={total} onChange={(e) => setTotal(e.target.value)} />
              </div>

              <div className="input-field">
                <label>Estado</label>
                <select value={estado} onChange={(e) => setEstado(e.target.value)}>
                  <option value="EMITIDA">EMITIDA</option>
                  <option value="PAGADA">PAGADA</option>
                  <option value="ANULADA">ANULADA</option>
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

export default Facturas;
