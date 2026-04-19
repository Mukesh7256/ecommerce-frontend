import { useState } from "react";
import axios from "axios";

function App() {
  const [form, setForm] = useState({
    name: "", email: "", password: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    try {
      const res = await axios.post(
        "http://localhost:8080/api/auth/register", form
      );
      setMessage(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div style={{
      maxWidth: "400px", margin: "80px auto",
      fontFamily: "Arial", padding: "20px",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      borderRadius: "8px"
    }}>
      <h2 style={{ textAlign: "center" }}>📦 E-Commerce Register</h2>

      {message && (
        <p style={{ color: "green", textAlign: "center" }}>{message}</p>
      )}
      {error && (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      )}

      <form onSubmit={handleSubmit}>
        <input
          name="name"
          placeholder="Full Name"
          onChange={handleChange}
          style={inputStyle}
        />
        <input
          name="email"
          placeholder="Email"
          onChange={handleChange}
          style={inputStyle}
        />
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          style={inputStyle}
        />
        <button type="submit" style={btnStyle}>
          Register
        </button>
      </form>
    </div>
  );
}

const inputStyle = {
  display: "block", width: "100%",
  padding: "10px", marginBottom: "12px",
  fontSize: "16px", borderRadius: "4px",
  border: "1px solid #ccc", boxSizing: "border-box"
};

const btnStyle = {
  width: "100%", padding: "12px",
  backgroundColor: "#007bff", color: "white",
  border: "none", fontSize: "16px",
  borderRadius: "4px", cursor: "pointer"
};

export default App;