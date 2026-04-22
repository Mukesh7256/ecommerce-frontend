import { useState } from "react";
import axios from "axios";
import Login from "./Login";

function App() {
  const [page, setPage] = useState("register");
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [user, setUser] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    // Confirm password check
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8080/api/auth/register",
        {
          name: form.name,
          email: form.email,
          password: form.password
        }
      );
      setMessage(res.data + " Please login!");
      setTimeout(() => setPage("login"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong!");
    }
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setPage("dashboard");
  };

  // ✅ Dashboard Page
  if (page === "dashboard") {
    return (
      <div style={{
        textAlign: "center", marginTop: "100px", fontFamily: "Arial"
      }}>
        <div style={{
          maxWidth: "400px", margin: "0 auto", padding: "30px",
          boxShadow: "0 0 10px rgba(0,0,0,0.1)", borderRadius: "8px"
        }}>
          <h1>🎉 Welcome!</h1>
          <h3 style={{ color: "#007bff" }}>{user.name}</h3>
          <p style={{ color: "gray" }}>{user.email}</p>
          <div style={{
            backgroundColor: "#f8f9fa", padding: "10px",
            borderRadius: "4px", marginTop: "15px"
          }}>
            <p style={{ fontSize: "12px", color: "gray", wordBreak: "break-all" }}>
              🔑 Token: {user.token.substring(0, 40)}...
            </p>
          </div>
          <button
            onClick={() => { setPage("login"); setUser(null); }}
            style={{
              ...btnStyle,
              backgroundColor: "#dc3545",
              marginTop: "20px"
            }}
          >
            Logout
          </button>
        </div>
      </div>
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
        <label style={labelStyle}>Full Name</label>
        <input
          name="name"
          placeholder="Enter your full name"
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={labelStyle}>Email</label>
        <input
          name="email"
          type="email"
          placeholder="Enter your email"
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={labelStyle}>Password</label>
        <input
          name="password"
          type="password"
          placeholder="Min 6 characters"
          onChange={handleChange}
          style={inputStyle}
        />

        <label style={labelStyle}>Confirm Password</label>
        <input
          name="confirmPassword"
          type="password"
          placeholder="Re-enter your password"
          onChange={handleChange}
          style={{
            ...inputStyle,
            borderColor: form.confirmPassword && form.password !== form.confirmPassword
              ? "red" : "#ccc"
          }}
        />
        {form.confirmPassword && form.password !== form.confirmPassword && (
          <p style={{ color: "red", fontSize: "12px", marginTop: "-8px", marginBottom: "10px" }}>
            Passwords do not match!
          </p>
        )}

        <button type="submit" style={btnStyle}>
          Register
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: "15px" }}>
        Already have account?{" "}
        <span
          onClick={() => setPage("login")}
          style={{ color: "#007bff", cursor: "pointer", fontWeight: "bold" }}
        >
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