import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2, ShoppingCart } from 'lucide-react';
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
  
  // Campos
  const [idPedido, setIdPedido] = useState(null);
  const [usuarioId, setUsuarioId] = useState("");
  const [subtotal, setSubtotal] = useState(0);
  const [impuesto, setImpuesto] = useState(0);
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

  useEffect(() => {
    listar();
    listarUsuarios();
  }, [isAdminView]);

  const limpiarFormulario = () => {
    setUsuarioId(""); setSubtotal(0); setImpuesto(0); setTotal(0); setEstado('PENDIENTE');
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
    setSubtotal(p.subtotal);
    setImpuesto(p.impuesto);
    setTotal(p.total);
    setEstado(p.estado);
    setEnEdicion(true);
    setShowModal(true);
  };

  const guardar = () => {
    const datos = {
      usuario_id: usuarioId,
      subtotal: parseFloat(subtotal),
      impuesto: parseFloat(impuesto),
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
                  <th>Subtotal</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.map((p) => (
                  <tr key={p.id_pedido}>
                    <td>#{p.id_pedido}</td>
                    <td>{new Date(p.fecha).toLocaleDateString()}</td>
                    <td>${Number(p.subtotal).toLocaleString()}</td>
                    <td>${Number(p.total).toLocaleString()}</td>
                    <td>
                      <span className="badge-rol" style={{ backgroundColor: p.estado === 'PENDIENTE' ? '#f59f00' : p.estado === 'CANCELADO' ? '#e03131' : '#2f9e44', fontSize: '0.8rem' }}>
                        {p.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="top-action-bar">
        <button className="btn-add-record" onClick={abrirRegistro}>Añadir Pedido</button>
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
            <p>Haz clic en "Registrar Pedido" para comenzar.</p>
          </div>
        ) : (
          <table className="styled-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Cliente / Usuario</th>
                <th>Subtotal</th>
                <th>Total</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((p) => (
                <tr key={p.id_pedido}>
                  <td>{p.id_pedido}</td>
                  <td>{p.usuario_nombre || p.usuario_id}</td>
                  <td>${Number(p.subtotal).toLocaleString()}</td>
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
                <input type="text" value={idPedido || ''} disabled style={{ background: 'var(--border)', cursor: 'not-allowed' }}/>
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
