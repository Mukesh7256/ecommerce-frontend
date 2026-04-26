import { useState, useEffect } from "react";
import axios from "axios";
import Login from "./Login";
import ProtectedRoute from "./ProtectedRoute";

function App() {
  const [page, setPage] = useState("register");
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);
  const [products, setProducts] = useState([]);

  // T022: Check if already logged in on page load
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

  // Fetch products from backend
  const fetchProducts = async (token) => {
    try {
      const res = await axios.get(
        "http://localhost:8080/api/products",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts(res.data);
    } catch (err) {
      console.log("No products yet");
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    try {
      const res = await axios.post(
        "http://localhost:8080/api/auth/register",
        { name: form.name, email: form.email, password: form.password }
      );
      setMessage(res.data + " Please login!");
      setTimeout(() => setPage("login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    }
  };

  // T022: Handle Login
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("token", userData.token);
    localStorage.setItem("name", userData.name);
    localStorage.setItem("email", userData.email);
    setPage("dashboard");
    fetchProducts(userData.token);
  };

  // T022: Handle Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    setUser(null);
    setProducts([]);
    setPage("login");
  };

  // ✅ T021: Dashboard - Protected Route
  if (page === "dashboard") {
    return (
      <ProtectedRoute>
        <div style={{ fontFamily: "Arial", padding: "20px" }}>

          {/* Navbar */}
          <div style={{
            backgroundColor: "#007bff", color: "white",
            padding: "15px 20px", display: "flex",
            justifyContent: "space-between", alignItems: "center",
            borderRadius: "8px", marginBottom: "20px"
          }}>
            <h2 style={{ margin: 0 }}>📦 E-Commerce</h2>
            <div>
              <span>👤 {user?.name}</span>
              <button
                onClick={handleLogout}
                style={{
                  marginLeft: "15px", padding: "8px 16px",
                  backgroundColor: "#dc3545", color: "white",
                  border: "none", borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Logout
              </button>
            </div>
          </div>

          {/* Welcome Card */}
          <div style={{
            backgroundColor: "#d4edda", padding: "20px",
            borderRadius: "8px", marginBottom: "20px"
          }}>
            <h3>🎉 Welcome back, {user?.name}!</h3>
            <p style={{ margin: 0, color: "gray" }}>
              Logged in as: {user?.email}
            </p>
          </div>

          {/* Products Section */}
          <div>
            <h3>🛒 Products ({products.length})</h3>
            {products.length === 0 ? (
              <div style={{
                textAlign: "center", padding: "40px",
                backgroundColor: "#f8f9fa", borderRadius: "8px"
              }}>
                <p>No products yet.</p>
                <p style={{ color: "gray", fontSize: "14px" }}>
                  Add products via Postman to see them here!
                </p>
              </div>
            ) : (
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "15px"
              }}>
                {products.map(p => (
                  <div key={p.id} style={{
                    border: "1px solid #ddd", borderRadius: "8px",
                    padding: "15px", backgroundColor: "white"
                  }}>
                    <h4 style={{ margin: "0 0 8px 0" }}>{p.name}</h4>
                    <p style={{ color: "gray", fontSize: "14px" }}>
                      {p.description}
                    </p>
                    <p style={{
                      color: "#28a745", fontWeight: "bold",
                      fontSize: "18px"
                    }}>
                      ₹{p.price}
                    </p>
                    <p style={{ fontSize: "12px", color: "gray" }}>
                      Category: {p.category}
                    </p>
                    <p style={{ fontSize: "12px", color: "gray" }}>
                      Stock: {p.quantity}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  // ✅ Login Page
  if (page === "login") {
    return (
      <div>
        <Login onLogin={handleLogin} />
        <p style={{ textAlign: "center", fontFamily: "Arial" }}>
          No account?{" "}
          <span
            onClick={() => setPage("register")}
            style={{ color: "#007bff", cursor: "pointer", fontWeight: "bold" }}
          >
            Register here
          </span>
        </p>
      </div>
    );
  }

  // ✅ Register Page
  return (
    <div style={{
      maxWidth: "400px", margin: "80px auto", fontFamily: "Arial",
      padding: "20px", boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      borderRadius: "8px"
    }}>
      <h2 style={{ textAlign: "center" }}>📦 E-Commerce Register</h2>
      {message && <p style={{ color: "green", textAlign: "center" }}>{message}</p>}
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Full Name</label>
        <input name="name" placeholder="Enter full name"
          onChange={handleChange} style={inputStyle} />
        <label style={labelStyle}>Email</label>
        <input name="email" type="email" placeholder="Enter email"
          onChange={handleChange} style={inputStyle} />
        <label style={labelStyle}>Password</label>
        <input name="password" type="password" placeholder="Min 6 characters"
          onChange={handleChange} style={inputStyle} />
        <label style={labelStyle}>Confirm Password</label>
        <input name="confirmPassword" type="password"
          placeholder="Re-enter password"
          onChange={handleChange}
          style={{
            ...inputStyle,
            borderColor: form.confirmPassword &&
              form.password !== form.confirmPassword ? "red" : "#ccc"
          }}
        />
        {form.confirmPassword &&
          form.password !== form.confirmPassword && (
          <p style={{ color: "red", fontSize: "12px", marginTop: "-8px" }}>
            Passwords do not match!
          </p>
        )}
        <button type="submit" style={btnStyle}>Register</button>
      </form>
      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Already have account?{" "}
        <span onClick={() => setPage("login")}
          style={{ color: "#007bff", cursor: "pointer", fontWeight: "bold" }}>
          Login here
        </span>
      </p>
    </div>
  );
}

const labelStyle = {
  display: "block", marginBottom: "4px",
  fontSize: "14px", fontWeight: "bold", color: "#333"
};
const inputStyle = {
  display: "block", width: "100%", padding: "10px",
  marginBottom: "12px", fontSize: "16px", borderRadius: "4px",
  border: "1px solid #ccc", boxSizing: "border-box"
};
const btnStyle = {
  width: "100%", padding: "12px", backgroundColor: "#007bff",
  color: "white", border: "none", fontSize: "16px",
  borderRadius: "4px", cursor: "pointer"
};

export default App;