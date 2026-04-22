import { useState } from "react";
import axios from "axios";

function Login({ onLogin }) {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8080/api/auth/login", form
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("name", res.data.name);
      onLogin(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Invalid email or password!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: "400px", margin: "80px auto",
      fontFamily: "Arial", padding: "20px",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      borderRadius: "8px"
    }}>
      <h2 style={{ textAlign: "center" }}>🔐 Login</h2>

      {error && (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <label style={labelStyle}>Email</label>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          onChange={handleChange}
          style={inputStyle}
          required
        />

        <label style={labelStyle}>Password</label>
        <input
          name="password"
          type="password"
          placeholder="Enter your password"
          onChange={handleChange}
          style={inputStyle}
          required
        />

        <button
          type="submit"
          style={{
            ...btnStyle,
            backgroundColor: loading ? "#6c757d" : "#28a745",
            cursor: loading ? "not-allowed" : "pointer"
          }}
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
    </div>
  );
}

const labelStyle = {
  display: "block", marginBottom: "4px",
  fontSize: "14px", fontWeight: "bold", color: "#333"
};

const inputStyle = {
  display: "block", width: "100%",
  padding: "10px", marginBottom: "12px",
  fontSize: "16px", borderRadius: "4px",
  border: "1px solid #ccc", boxSizing: "border-box"
};

const btnStyle = {
  width: "100%", padding: "12px",
  color: "white", border: "none",
  fontSize: "16px", borderRadius: "4px"
};

export default Login;