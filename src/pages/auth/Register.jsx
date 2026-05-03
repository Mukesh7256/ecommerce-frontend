import { useState } from "react";
import { registerUser } from "../../services/authService";
import "../../styles/auth.css";

function Register({ onSwitchToLogin }) {
  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Clear field error when user types
    setFieldErrors({ ...fieldErrors, [e.target.name]: "" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setMessage(""); setFieldErrors({});

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }

    setLoading(true);
    try {
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password
      });
      setMessage("✅ Registered successfully! Redirecting...");
      setTimeout(onSwitchToLogin, 1500);
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === "object" && data !== null) {
        setFieldErrors(data);
        setError("Please fix the errors below!");
      } else {
        setError(data || "Registration failed!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join E-Commerce Platform</p>

        {error && <p className="error-msg">⚠️ {error}</p>}
        {message && <p className="success-msg">{message}</p>}

        <form onSubmit={handleSubmit} className="auth-form">

          <div>
            <input
              name="name"
              placeholder="Full Name"
              onChange={handleChange}
              required
            />
            {fieldErrors.name && (
              <p style={{
                color: "red", fontSize: "12px", margin: "4px 0 0"
              }}>
                ⚠️ {fieldErrors.name}
              </p>
            )}
          </div>

          <div>
            <input
              name="email"
              type="email"
              placeholder="Email Address"
              onChange={handleChange}
              required
            />
            {fieldErrors.email && (
              <p style={{
                color: "red", fontSize: "12px", margin: "4px 0 0"
              }}>
                ⚠️ {fieldErrors.email}
              </p>
            )}
          </div>

          <div>
            <input
              name="password"
              type="password"
              placeholder="Password (min 6 characters)"
              onChange={handleChange}
              required
            />
            {fieldErrors.password && (
              <p style={{
                color: "red", fontSize: "12px", margin: "4px 0 0"
              }}>
                ⚠️ {fieldErrors.password}
              </p>
            )}
          </div>

          <div>
            <input
              name="confirmPassword"
              type="password"
              placeholder="Confirm Password"
              onChange={handleChange}
              required
            />
            {form.confirmPassword &&
              form.password !== form.confirmPassword && (
              <p style={{
                color: "red", fontSize: "12px", margin: "4px 0 0"
              }}>
                ⚠️ Passwords do not match!
              </p>
            )}
          </div>

          <button
            type="submit"
            className="auth-btn"
            disabled={loading}
            style={{
              backgroundColor: loading ? "#6c757d" : "#007bff"
            }}
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <p className="auth-switch">
          Already have account?{" "}
          <span onClick={onSwitchToLogin}>Login here</span>
        </p>
      </div>
    </div>
  );
}

export default Register;