/**
 * @file CartContext.jsx
 * @description Contexto del carrito de compras.
 * Expone `toast` (última notificación) y `clearToast` para el sistema de notificaciones.
 */
import { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CartContext = createContext();
export const useCart = () => useContext(CartContext);

const generateSessionId = () => {
  let sessionId = localStorage.getItem('cart_session_id');
  if (!sessionId) {
    sessionId = 'sess_' + Math.random().toString(36).substring(2, 15)
                       + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('cart_session_id', sessionId);
  }
  return sessionId;
};

const URL_CARRITO = 'http://localhost:3000/api/carrito';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [toast, setToast]         = useState(null); // { product, quantity }
  const { user, isAuthenticated } = useAuth();

  const sessionId  = generateSessionId();
  const usuario_id = user?.id_usuario;

  /* ── Cargar carrito ──────────────────────────────────────── */
  const fetchCart = async () => {
    try {
      const params = {};
      if (isAuthenticated && usuario_id) params.usuario_id = usuario_id;
      if (sessionId) params.session_id = sessionId;
      const res = await axios.get(URL_CARRITO, { params });
      setCartItems(res.data);
    } catch (err) {
      console.error('Error cargando carrito remoto', err);
    }
  };

  useEffect(() => {
    const syncCart = async () => {
      if (isAuthenticated && usuario_id && sessionId) {
        try {
          await axios.post(`${URL_CARRITO}/merge`, { session_id: sessionId, usuario_id });
        } catch (e) {
          console.log('Error en merge de carrito', e);
        }
      }
      await fetchCart();
    };
    syncCart();
  }, [user, isAuthenticated]);

  /* ── Agregar al carrito + notificación ───────────────────── */
  const addToCart = async (product, quantity = 1) => {
    try {
      const payload = { producto_id: product.id_producto, cantidad: quantity };
      if (isAuthenticated) payload.usuario_id = usuario_id;
      payload.session_id = sessionId;

      const res = await axios.post(`${URL_CARRITO}/add`, payload);
      setCartItems(res.data);

      // Disparar toast de notificación
      setToast({ product, quantity, id: Date.now() });
    } catch (err) {
      console.error('Error agregando al carrito', err);
    }
  };

  const clearToast = () => setToast(null);

  /* ── Eliminar ────────────────────────────────────────────── */
  const removeFromCart = async (productId) => {
    try {
      const params = {};
      if (isAuthenticated) params.usuario_id = usuario_id;
      params.session_id = sessionId;
      const res = await axios.delete(`${URL_CARRITO}/remove/${productId}`, { params });
      setCartItems(res.data);
    } catch (err) {
      console.error('Error removiendo item', err);
    }
  };

  /* ── Actualizar cantidad ─────────────────────────────────── */
  const updateQuantity = async (productId, quantity) => {
    if (quantity <= 0) return removeFromCart(productId);
    const cartItem = cartItems.find(i => i.producto_id === productId);
    if (!cartItem) return;
    try {
      const payload = { cantidad: quantity };
      if (isAuthenticated) payload.usuario_id = usuario_id;
      payload.session_id = sessionId;
      const res = await axios.put(`${URL_CARRITO}/update/${cartItem.id_carrito}`, payload);
      setCartItems(res.data);
    } catch (err) {
      console.error('Error actualizando cantidad', err);
    }
  };

  /* ── Vaciar carrito ──────────────────────────────────────── */
  const clearCart = async () => {
    try {
      const payload = {};
      if (isAuthenticated) payload.usuario_id = usuario_id;
      payload.session_id = sessionId;
      await axios.post(`${URL_CARRITO}/clear`, payload);
      setCartItems([]);
    } catch (err) {
      console.error('Error vaciando carrito', err);
    }
  };

  /* ── Checkout ────────────────────────────────────────────── */
  const checkout = async () => {
    if (!isAuthenticated || !usuario_id) return false;
    try {
      await axios.post('http://localhost:3000/api/pedidos/checkout', { usuario_id });
      setCartItems([]);
      return true;
    } catch (err) {
      console.error('Error generando checkout:', err);
      return false;
    }
  };

  const totalItems = cartItems.reduce((t, i) => t + i.cantidad, 0);
  const getCartCount = () => totalItems;
  const getCartTotal = () => cartItems.reduce((t, i) => t + i.precio * i.cantidad, 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      checkout,
      getCartCount,
      getCartTotal,
      totalItems,
      toast,
      clearToast,
    }}>
      {children}
    </CartContext.Provider>
  );
};
