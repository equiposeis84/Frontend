import prisma from '../config/prisma.js';

const Repartidor = {
    findAll: async () => {
        const rows = await prisma.usuarios.findMany({
            where: { rol_id: 4 },
            select: {
                id_usuario: true,
                nombre: true,
                telefono: true,
                email: true,
                activo: true,
                pedidos_repartidor: {
                    select: {
                        estado: true
                    }
                }
            }
        });

        return rows.map(r => {
            const pedidos = r.pedidos_repartidor || [];
            return {
                id_usuario: r.id_usuario,
                nombre: r.nombre,
                telefono: r.telefono,
                email: r.email,
                activo: r.activo,
                total_pedidos: pedidos.length,
                pedidos_activos: pedidos.filter(p => p.estado === 'ASIGNADO' || p.estado === 'EN_CAMINO').length
            };
        });
    },

    findById: async (id) => {
        const r = await prisma.usuarios.findUnique({
            where: { id_usuario: Number(id) },
            include: {
                pedidos_repartidor: {
                    include: {
                        usuario: { select: { nombre: true } },
                        detalle_pedido: {
                            include: { producto: { select: { nombre: true } } }
                        },
                        seguimiento_pedido: {
                            include: { usuario: { select: { nombre: true } } },
                            orderBy: { fecha: 'desc' }
                        }
                    },
                    orderBy: { fecha_pedido: 'desc' }
                }
            }
        });
        
        // Formatear para que el frontend no se rompa (el frontend espera p.cliente y p.seguimiento)
        if (r && r.pedidos_repartidor) {
            r.pedidos_repartidor = r.pedidos_repartidor.map(p => ({
                ...p,
                cliente: p.usuario,
                seguimiento: p.seguimiento_pedido
            }));
        }
        return r;
    },

    toggleActivo: async (id, activo) => {
        return prisma.usuarios.update({
            where: { id_usuario: Number(id) },
            data: { activo }
        });
    },

    asignarPedido: async (pedidoId, repartidorId) => {
        return prisma.pedidos.update({
            where: { id_pedido: Number(pedidoId) },
            data: {
                repartidor_id: Number(repartidorId),
                estado: 'ASIGNADO',
                fecha_asignacion: new Date()
            }
        });
    },

    desasignarPedido: async (pedidoId) => {
        return prisma.pedidos.update({
            where: { id_pedido: Number(pedidoId) },
            data: {
                repartidor_id: null,
                estado: 'CONFIRMADO',
                fecha_asignacion: null
            }
        });
    },

    cambiarEstadoPedido: async (pedidoId, nuevoEstado, usuarioId, notas) => {
        const pedido = await prisma.pedidos.findUnique({ where: { id_pedido: Number(pedidoId) } });
        if (!pedido) throw new Error("Pedido no encontrado");

        // Transaction to update order and create seguimiento
        return prisma.$transaction([
            prisma.pedidos.update({
                where: { id_pedido: Number(pedidoId) },
                data: {
                    estado: nuevoEstado,
                    fecha_entrega_real: nuevoEstado === 'ENTREGADO' ? new Date() : undefined
                }
            }),
            prisma.seguimiento_pedido.create({
                data: {
                    pedido_id: Number(pedidoId),
                    estado_anterior: pedido.estado,
                    estado_nuevo: nuevoEstado,
                    cambiado_por: Number(usuarioId),
                    notas: notas || null
                }
            })
        ]);
    },

    getPedidosSinAsignar: async () => {
        const pedidos = await prisma.pedidos.findMany({
            where: {
                repartidor_id: null,
                estado: 'CONFIRMADO'
            },
            include: {
                usuario: { select: { nombre: true } }
            }
        });
        
        return pedidos.map(p => ({
            ...p,
            cliente: p.usuario
        }));
    }
};

export default Repartidor;
