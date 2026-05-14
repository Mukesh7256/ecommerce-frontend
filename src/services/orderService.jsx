import axios from "axios";

const BASE_URL = "http://localhost:8080/api/orders";

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

// T051: Checkout integrated with backend
export const placeOrder = async (checkoutData, token) => {
  const res = await axios.post(
    `${BASE_URL}/checkout`,
    checkoutData,
    getHeaders(token)
  );
  return res.data;
};

// Get my orders
export const getMyOrders = async (token) => {
  const res = await axios.get(
    `${BASE_URL}/my-orders`,
    getHeaders(token)
  );
  return res.data;
};

// Get order by ID
export const getOrderById = async (id, token) => {
  const res = await axios.get(
    `${BASE_URL}/${id}`,
    getHeaders(token)
  );
  return res.data;
};

// Cancel order
export const cancelOrder = async (id, token) => {
  const res = await axios.put(
    `${BASE_URL}/${id}/cancel`,
    {},
    getHeaders(token)
  );
  return res.data;
};

// Admin - Get all orders
export const getAllOrders = async (token) => {
  const res = await axios.get(
    `${BASE_URL}/admin/all`,
    getHeaders(token)
  );
  return res.data;
};

// Admin - Update status
export const updateOrderStatus = async (id, status, token) => {
  const res = await axios.put(
    `${BASE_URL}/admin/${id}/status`,
    { status },
    getHeaders(token)
  );
  return res.data;
};