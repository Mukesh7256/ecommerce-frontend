import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";
import "./App.css";

function App() {

  // ================= GLOBAL STATES =================
  const [page, setPage] = useState("register");
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);

  // ================= ADMIN VIEW =================
  const [view, setView] = useState("list");

  // ================= REGISTER FORM =================
  const [regForm, setRegForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // ================= ADD PRODUCT FORM =================
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "",
    quantity: "",
    imageUrl: ""
  });

  // ================= SEARCH & FILTER =================
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  // ================= AUTO LOGIN =================
  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    if (token) {
      setUser({ token, name, email });
      setPage("dashboard");
      fetchProducts(token);
    }
  }, []);

  // ================= FETCH ALL PRODUCTS =================
  const fetchProducts = async (token) => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8080/api/products",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= SEARCH PRODUCTS =================
  const handleSearch = async () => {
    try {
      setLoading(true);
      let url = "http://localhost:8080/api/products";
      if (search) {
        url = `http://localhost:8080/api/products/search?keyword=${search}`;
      } else if (category) {
        url = `http://localhost:8080/api/products/category/${category}`;
      }
      const res = await axios.get(url, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setProducts(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= REGISTER =================
  const handleRegChange = (e) => {
    setRegForm({ ...regForm, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(""); setMessage("");
    if (regForm.password !== regForm.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
      await axios.post(
        "http://localhost:8080/api/auth/register",
        {
          name: regForm.name,
          email: regForm.email,
          password: regForm.password
        }
      );
      setMessage("Registered successfully! Redirecting to login...");
      setTimeout(() => setPage("login"), 1500);
    } catch (err) {
      setError(err.response?.data || "Registration failed");
    }
  };

  // ================= LOGIN =================
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("token", userData.token);
    localStorage.setItem("name", userData.name);
    localStorage.setItem("email", userData.email);
    setPage("dashboard");
    fetchProducts(userData.token);
  };

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setProducts([]);
    setPage("login");
  };

  // ================= ADD PRODUCT =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addProduct = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:8080/api/products",
        {
          ...form,
          price: parseFloat(form.price),
          quantity: parseInt(form.quantity)
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("✅ Product added successfully!");
      setForm({
        name: "", description: "", price: "",
        category: "", quantity: "", imageUrl: ""
      });
      setView("list");
      fetchProducts(user.token);
    } catch (err) {
      console.log(err);
      alert("❌ Error adding product. Please try again.");
    }
  };

  // ================= DELETE PRODUCT =================
  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await axios.delete(
        `http://localhost:8080/api/products/${id}`,
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      alert("✅ Deleted successfully!");
      fetchProducts(user.token);
    } catch (err) {
      console.log(err);
      alert("❌ Delete failed!");
    }
  };

  // ================= DASHBOARD =================
  if (page === "dashboard") {
    return (
      <ProtectedRoute>
        <div>

          {/* NAVBAR */}
          <div className="navbar">
            <h2>📦 E-Commerce Admin</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <span>👤 {user?.name}</span>
              <button
                className="logout-btn"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>

          <div style={{ padding: "20px" }}>

            {/* NAV BUTTONS */}
            <div style={{ marginBottom: "20px" }}>
              <button
                className="search-btn"
                onClick={() => setView("list")}
                style={{
                  backgroundColor: view === "list" ? "#0056b3" : "#007bff"
                }}
              >
                📦 Products ({products.length})
              </button>
              <button
                className="reset-btn"
                style={{ marginLeft: "10px" }}
                onClick={() => setView("add")}
              >
                ➕ Add Product
              </button>
            </div>

            {/* LOADING */}
            {loading && (
              <div className="loader">⏳ Loading products...</div>
            )}

            {/* ===== PRODUCT LIST VIEW ===== */}
            {view === "list" && !loading && (
              <div>

                {/* SEARCH & FILTER */}
                <div style={{
                  display: "flex", gap: "10px",
                  marginBottom: "20px", flexWrap: "wrap"
                }}>
                  <input
                    placeholder="🔍 Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                    style={{
                      flex: 1, minWidth: "200px", padding: "10px",
                      fontSize: "15px", borderRadius: "4px",
                      border: "1px solid #ddd"
                    }}
                  />
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    style={{
                      padding: "10px", fontSize: "15px",
                      borderRadius: "4px", border: "1px solid #ddd"
                    }}
                  >
                    <option value="">All Categories</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Books">Books</option>
                    <option value="Furniture">Furniture</option>
                  </select>
                  <button className="search-btn" onClick={handleSearch}>
                    Search
                  </button>
                  <button
                    className="reset-btn"
                    onClick={() => {
                      setSearch(""); setCategory("");
                      fetchProducts(user.token);
                    }}
                  >
                    Reset
                  </button>
                </div>

                {/* SUMMARY CARDS */}
                {products.length > 0 && (
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "15px", marginBottom: "20px"
                  }}>
                    <div style={summaryCard("#007bff")}>
                      <h3 style={{ margin: 0, fontSize: "28px" }}>
                        {products.length}
                      </h3>
                      <p style={{ margin: 0 }}>Total Products</p>
                    </div>
                    <div style={summaryCard("#28a745")}>
                      <h3 style={{ margin: 0, fontSize: "28px" }}>
                        ₹{Math.max(...products.map(p => p.price))
                          .toLocaleString()}
                      </h3>
                      <p style={{ margin: 0 }}>Highest Price</p>
                    </div>
                    <div style={summaryCard("#dc3545")}>
                      <h3 style={{ margin: 0, fontSize: "28px" }}>
                        {products.filter(p => p.quantity < 5).length}
                      </h3>
                      <p style={{ margin: 0 }}>Low Stock ⚠️</p>
                    </div>
                  </div>
                )}

                {/* NO PRODUCTS */}
                {products.length === 0 && (
                  <div style={{
                    textAlign: "center", padding: "60px",
                    backgroundColor: "#f8f9fa", borderRadius: "8px"
                  }}>
                    <h3>😕 No products found!</h3>
                    <p style={{ color: "gray" }}>
                      Click "Add Product" to add your first product.
                    </p>
                    <button
                      className="search-btn"
                      onClick={() => setView("add")}
                    >
                      ➕ Add First Product
                    </button>
                  </div>
                )}

                {/* PRODUCT GRID */}
                <div className="products-grid">
                  {products.map((p) => (
                    <div key={p.id} className="card">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="product-img"
                        onError={(e) => {
                          e.target.src =
                            "https://via.placeholder.com/200x150?text=No+Image";
                        }}
                      />
                      <div style={{ padding: "10px" }}>
                        <h4 style={{ margin: "0 0 5px 0" }}>{p.name}</h4>
                        <p style={{
                          color: "gray", fontSize: "13px",
                          margin: "0 0 8px 0"
                        }}>
                          {p.description?.substring(0, 60)}...
                        </p>
                        <p className="price">₹{p.price?.toLocaleString()}</p>
                        <div style={{
                          display: "flex", justifyContent: "space-between",
                          fontSize: "13px", color: "gray", marginBottom: "10px"
                        }}>
                          <span>📁 {p.category}</span>
                          <span style={{
                            color: p.quantity < 5 ? "red" : "green",
                            fontWeight: "bold"
                          }}>
                            Stock: {p.quantity}
                            {p.quantity < 5 && " ⚠️"}
                          </span>
                        </div>
                        <button
                          className="reset-btn"
                          style={{ width: "100%" }}
                          onClick={() => deleteProduct(p.id)}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* ===== ADD PRODUCT VIEW ===== */}
            {view === "add" && (
              <div style={{
                maxWidth: "600px", margin: "0 auto",
                backgroundColor: "white", padding: "30px",
                borderRadius: "8px",
                boxShadow: "0 0 15px rgba(0,0,0,0.1)"
              }}>
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: "10px", marginBottom: "25px"
                }}>
                  <button
                    className="reset-btn"
                    onClick={() => setView("list")}
                  >
                    ← Back
                  </button>
                  <h2 style={{ margin: 0 }}>➕ Add New Product</h2>
                </div>

                <form onSubmit={addProduct}>
                  <label style={labelStyle}>Product Name *</label>
                  <input
                    name="name" value={form.name}
                    placeholder="e.g. iPhone 15"
                    onChange={handleChange}
                    style={inputStyle} required
                  />

                  <label style={labelStyle}>Description *</label>
                  <textarea
                    name="description" value={form.description}
                    placeholder="Enter product description..."
                    onChange={handleChange}
                    rows={3}
                    style={{ ...inputStyle, resize: "vertical" }}
                    required
                  />

                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr", gap: "15px"
                  }}>
                    <div>
                      <label style={labelStyle}>Price (₹) *</label>
                      <input
                        name="price" type="number"
                        value={form.price}
                        placeholder="e.g. 9999"
                        onChange={handleChange}
                        style={inputStyle} required min="0"
                      />
                    </div>
                    <div>
                      <label style={labelStyle}>Quantity *</label>
                      <input
                        name="quantity" type="number"
                        value={form.quantity}
                        placeholder="e.g. 50"
                        onChange={handleChange}
                        style={inputStyle} required min="0"
                      />
                    </div>
                  </div>

                  <label style={labelStyle}>Category *</label>
                  <select
                    name="category" value={form.category}
                    onChange={handleChange}
                    style={inputStyle} required
                  >
                    <option value="">Select Category</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Footwear">Footwear</option>
                    <option value="Books">Books</option>
                    <option value="Furniture">Furniture</option>
                  </select>

                  <label style={labelStyle}>Image URL</label>
                  <input
                    name="imageUrl" value={form.imageUrl}
                    placeholder="https://example.com/image.jpg"
                    onChange={handleChange}
                    style={inputStyle}
                  />

                  {/* Image Preview */}
                  {form.imageUrl && (
                    <div style={{
                      marginBottom: "15px", textAlign: "center"
                    }}>
                      <img
                        src={form.imageUrl}
                        alt="Preview"
                        style={{
                          maxHeight: "150px", maxWidth: "100%",
                          borderRadius: "4px", border: "1px solid #ddd"
                        }}
                        onError={(e) => e.target.style.display = "none"}
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    className="search-btn"
                    style={{ width: "100%", padding: "12px", fontSize: "16px" }}
                  >
                    ➕ Add Product
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ================= LOGIN PAGE =================
  if (page === "login") {
    return (
      <div>
        <Login onLogin={handleLogin} />
        <p style={{ textAlign: "center", fontFamily: "Arial" }}>
          No account?{" "}
          <span
            onClick={() => setPage("register")}
            style={{
              color: "#007bff", cursor: "pointer", fontWeight: "bold"
            }}
          >
            Register here
          </span>
        </p>
      </div>
    );
  }

  // ================= REGISTER PAGE =================
  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join your e-commerce dashboard</p>

        {error && <p className="error">{error}</p>}
        {message && <p className="success">{message}</p>}

        <form onSubmit={handleRegister} className="auth-form">
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleRegChange}
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email Address"
            onChange={handleRegChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password (min 6 characters)"
            onChange={handleRegChange}
            required
          />
          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm Password"
            onChange={handleRegChange}
            required
          />
          {regForm.confirmPassword &&
            regForm.password !== regForm.confirmPassword && (
            <p style={{
              color: "red", fontSize: "13px",
              marginTop: "-10px", marginBottom: "10px"
            }}>
              ⚠️ Passwords do not match!
            </p>
          )}
          <button type="submit" className="auth-btn">
            Create Account
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{" "}
          <span onClick={() => setPage("login")}>Login</span>
        </p>
      </div>
    </div>
  );
}

// ================= HELPER STYLES =================
const summaryCard = (color) => ({
  backgroundColor: color,
  color: "white",
  padding: "20px",
  borderRadius: "8px",
  textAlign: "center"
});

const labelStyle = {
  display: "block",
  marginBottom: "5px",
  fontWeight: "bold",
  fontSize: "14px",
  color: "#333"
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  fontSize: "15px",
  borderRadius: "4px",
  border: "1px solid #ccc",
  boxSizing: "border-box"
};

export default App;