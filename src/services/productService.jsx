import axios from "axios";

const BASE_URL = "http://localhost:8080/api/products";

const getHeaders = (token) => ({
  headers: { Authorization: `Bearer ${token}` }
});

export const getAllProducts = async (token) => {
  const res = await axios.get(BASE_URL, getHeaders(token));
  return res.data;
};

export const getProductById = async (id, token) => {
  const res = await axios.get(`${BASE_URL}/${id}`, getHeaders(token));
  return res.data;
};

export const addProduct = async (data, token) => {
  const res = await axios.post(BASE_URL, data, getHeaders(token));
  return res.data;
};

export const updateProduct = async (id, data, token) => {
  const res = await axios.put(
    `${BASE_URL}/${id}`, data, getHeaders(token)
  );
  return res.data;
};

export const deleteProduct = async (id, token) => {
  const res = await axios.delete(
    `${BASE_URL}/${id}`, getHeaders(token)
  );
  return res.data;
};

export const searchProducts = async (keyword, token) => {
  const res = await axios.get(
    `${BASE_URL}/search?keyword=${keyword}`, getHeaders(token)
  );
  return res.data;
};

export const filterByCategory = async (category, token) => {
  const res = await axios.get(
    `${BASE_URL}/category/${category}`, getHeaders(token)
  );
  return res.data;
};