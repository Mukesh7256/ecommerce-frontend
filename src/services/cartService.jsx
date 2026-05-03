import axios from "axios";

const BASE_URL = "http://localhost:8080/api/cart";

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export const getCartItems = async (token) => {
  const res = await axios.get(BASE_URL, getHeaders(token));
  return res.data;
};

export const getCartCount = async (token) => {
  const res = await axios.get(
    `${BASE_URL}/count`, getHeaders(token)
  );
  return res.data;
};

export const addToCart = async (productId, quantity, token) => {
  const res = await axios.post(
    `${BASE_URL}/add`,
    { productId, quantity },
    getHeaders(token)
  );
  return res.data;
};

export const removeFromCart = async (cartId, token) => {
  const res = await axios.delete(
    `${BASE_URL}/${cartId}`, getHeaders(token)
  );
  return res.data;
};

export const clearCart = async (token) => {
  const res = await axios.delete(
    `${BASE_URL}/clear`, getHeaders(token)
  );
  return res.data;
};