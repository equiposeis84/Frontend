import React from 'react';
import { Eye } from 'lucide-react';

const TarjetaPedido = ({ pedido, alVer }) => {
  return (
    <div className="card mb-3 shadow-sm border-0">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-start mb-2">
          <div>
            <h5 className="card-title fw-bold">Pedido #{pedido.id_pedido}</h5>
            <h6 className="card-subtitle mb-2 text-muted">Cliente: {pedido.usuario?.nombre}</h6>
          </div>
          <span className={`badge ${
            pedido.estado === 'PENDIENTE' ? 'bg-warning text-dark' :
            pedido.estado === 'EN_CAMINO' ? 'bg-primary' :
            'bg-secondary'
          }`}>
            {pedido.estado}
          </span>
        </div>
        
        <div className="mb-3 text-secondary" style={{ fontSize: '0.9rem' }}>
          <p className="mb-1"><strong>Dirección:</strong> {pedido.direccion_entrega || pedido.usuario?.direccion || 'No especificada'}</p>
          <p className="mb-1"><strong>Total:</strong> ${pedido.total}</p>
        </div>
        
        <div className="d-flex justify-content-end">
          <button
            onClick={() => alVer(pedido)}
            className="btn btn-outline-primary btn-sm d-flex align-items-center"
            title="Ver Detalle"
          >
            <Eye size={18} className="me-2" />
            Ver Detalle
          </button>
        </div>
      </div>
    </div>
  );
};

export default TarjetaPedido;
