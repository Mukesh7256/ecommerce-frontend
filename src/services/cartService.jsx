import axios from "axios";

const BASE_URL = "http://localhost:8080/api/cart";

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

// T035 - Add to cart
export const addToCart = async (productId, quantity, token) => {
  const res = await axios.post(
    `${BASE_URL}/add`,
    { productId, quantity },
    getHeaders(token)
  );
  return res.data;
};

// T036 - Get cart items
export const getCartItems = async (token) => {
  const res = await axios.get(BASE_URL, getHeaders(token));
  return res.data;
};

// T037 - Update quantity
export const updateCartQuantity = async (cartId, quantity, token) => {
  const res = await axios.put(
    `${BASE_URL}/update/${cartId}`,
    { quantity },
    getHeaders(token)
  );
  return res.data;
};

// T038 - Remove item
export const removeFromCart = async (cartId, token) => {
  const res = await axios.delete(
    `${BASE_URL}/${cartId}`,
    getHeaders(token)
  );
  return res.data;
};

// Get cart count
export const getCartCount = async (token) => {
  const res = await axios.get(
    `${BASE_URL}/count`,
    getHeaders(token)
  );
  return res.data;
};

// Get cart total
export const getCartTotal = async (token) => {
  const res = await axios.get(
    `${BASE_URL}/total`,
    getHeaders(token)
  );
  return res.data;
};

// Clear entire cart
export const clearCart = async (token) => {
  const res = await axios.delete(
    `${BASE_URL}/clear`,
    getHeaders(token)
  );
  return res.data;
};