import { useState, useEffect } from 'react';
import axios from 'axios';
import { Pencil, Trash2, Users } from 'lucide-react';
import { useModalScroll } from '../hooks/useModalScroll';

const URL_API = "http://localhost:3000/api/usuarios";

const Usuarios = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [rolesList, setRolesList] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [enEdicion, setEnEdicion] = useState(false);
  const [loading, setLoading] = useState(true);
  useModalScroll(showModal);
  
  // Paginación y búsqueda
  const [searchTerm, setSearchTerm] = useState("");
  const [searchField, setSearchField] = useState("nombre");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  
  // Estados vinculados a los campos de la BD
  const [idUsuario, setIdUsuario] = useState(null);
  const [rolId, setRolId] = useState(1);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [numDoc, setNumDoc] = useState("");
  const [activo, setActivo] = useState(1);

  const listar = () => {
    setLoading(true);
    axios.get(URL_API)
      .then(res => setUsuarios(res.data))
      .catch(err => console.error("Error al listar usuarios:", err))
      .finally(() => setLoading(false));
  };

  const listarRoles = () => {
    axios.get(`${URL_API}/roles`)
      .then(res => setRolesList(res.data))
      .catch(err => console.error("Error al listar roles:", err));
  };

  useEffect(() => {
    listar();
    listarRoles();
  }, []);

  const limpiarFormulario = () => {
    setRolId(1); setNombre(""); setEmail(""); setPassword("");
    setNumDoc("");
    setActivo(1); setEnEdicion(false); setIdUsuario(null);
    setShowModal(false);
  };

  const abrirRegistro = () => {
    limpiarFormulario();
    const nextId = usuarios.length > 0 ? Math.max(...usuarios.map(u => u.id_usuario)) + 1 : 1;
    setIdUsuario(nextId);
    setShowModal(true);
  };

  const seleccionarUsuario = (u) => {
    setIdUsuario(u.id_usuario);
    setRolId(u.rol_id);
    setNombre(u.nombre);
    setEmail(u.email);
    setNumDoc(u.numero_documento);
    setActivo(u.activo);
    setEnEdicion(true);
    setShowModal(true);
  };

  const guardar = () => {
    const datos = {
      rol_id: rolId, nombre, email, password,
      numero_documento: numDoc,
      activo
    };

    if (enEdicion) {
      axios.put(`${URL_API}/${idUsuario}`, datos)
        .then(() => {
          limpiarFormulario();
          listar();
          alert("Usuario actualizado correctamente.");
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
          alert("Usuario creado con éxito.");
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
          alert("No se puede eliminar el usuario. Es posible que tenga registros asociados (ventas, compras, etc.).\nDetalle: " + (err.response?.data?.error || err.message));
        });
    }
  };

  const filteredUsuarios = usuarios.filter(u => {
    if (!searchTerm) return true;
    const value = u[searchField];
    if (value === null || value === undefined) return false;
    return String(value).toLowerCase().includes(searchTerm.toLowerCase());
  });

  const totalPages = Math.ceil(filteredUsuarios.length / itemsPerPage);
  const currentItems = filteredUsuarios.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <div className="top-action-bar">
        <button className="btn-add-record" onClick={abrirRegistro}>Añadir Usuario</button>
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
            <option value="id_usuario">ID Usuario</option>
            <option value="nombre">Nombre</option>
            <option value="email">Email</option>
            <option value="numero_documento">Num. Doc</option>
          </select>
          <button className="btn-search-ok" onClick={() => setCurrentPage(1)}>OK</button>
        </div>
      </div>

      <div className="table-wrapper">
        {loading ? (
          <div style={{ padding: '4rem', textAlign: 'center', color: '#94a3b8' }}>
            <div className="spinner"></div> {/* Asume clase css para un loader */}
            <p style={{ marginTop: '1rem' }}>Cargando datos...</p>
          </div>
        ) : usuarios.length === 0 ? (
          <div style={{ padding: '5rem 2rem', textAlign: 'center', color: '#94a3b8' }}>
            <Users size={64} style={{ color: 'var(--primary)', opacity: 0.5, marginBottom: '1.5rem' }} />
            <h2>No hay usuarios registrados</h2>
            <p>Haz clic en "Registrar Usuario" para comenzar.</p>
          </div>
        ) : (
          <table className="styled-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Rol</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Documento</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((u) => (
                <tr key={u.id_usuario}>
                  <td>{u.id_usuario}</td>
                  <td><span className="badge-rol">{u.rol_nombre}</span></td>
                  <td>{u.nombre}</td>
                  <td>{u.email}</td>
                  <td>{u.numero_documento}</td>
                  <td>
                    <button className={`status-toggle ${u.activo ? 'is-active' : 'is-inactive'}`}>
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </button>
                  </td>
                  <td className="actions-cell">
                    <button className="btn-icon" onClick={() => seleccionarUsuario(u)}>
                      <Pencil size={18} color="var(--primary)" />
                    </button>
                    <button className="btn-icon" onClick={() => eliminar(u.id_usuario)}>
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
            <h2>{enEdicion ? "Actualizar Usuario" : "Nuevo Registro"}</h2>
            <div className="form-grid">
              <div className="input-field" style={{ gridColumn: 'span 2' }}>
                <label>ID</label>
                <input type="text" value={idUsuario || ''} disabled style={{ background: 'var(--border)', cursor: 'not-allowed' }}/>
              </div>
              <div className="input-field">
                <label>Rol</label>
                <select value={rolId} onChange={(e) => setRolId(Number(e.target.value))}>
                  <option value="" disabled>Seleccione un rol...</option>
                  {rolesList.map(r => (
                    <option key={r.id_rol} value={r.id_rol}>{r.nombre}</option>
                  ))}
                </select>
              </div>
              <div className="input-field">
                <label>Nombre Completo</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
              </div>
              <div className="input-field">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              {!enEdicion && (
                <div className="input-field">
                  <label>Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                </div>
              )}
              <div className="input-field">
                <label>Numero Documento</label>
                <input value={numDoc} onChange={(e) => setNumDoc(e.target.value)} />
              </div>
              <div className="input-field">
                <label>Estado</label>
                <select value={activo} onChange={(e) => setActivo(Number(e.target.value))}>
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
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

export default Usuarios;
