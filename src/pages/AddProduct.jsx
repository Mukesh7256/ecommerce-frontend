import { useState } from "react";
import axios from "axios";

function AddProduct({ onBack }) {
  const [form, setForm] = useState({
    name: "", description: "", price: "",
    quantity: "", category: "", imageUrl: ""
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); setError("");
    setLoading(true);
    try {
      await axios.post(
        "http://localhost:8080/api/products",
        {
          ...form,
          price: parseFloat(form.price),
          quantity: parseInt(form.quantity)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessage("✅ Product added successfully!");
      setForm({
        name: "", description: "", price: "",
        quantity: "", category: "", imageUrl: ""
      });
    } catch (err) {
      setError("Failed to add product! Make sure you're logged in.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: "600px", margin: "40px auto",
      fontFamily: "Arial", padding: "30px",
      boxShadow: "0 0 15px rgba(0,0,0,0.1)",
      borderRadius: "8px", backgroundColor: "white"
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        marginBottom: "25px", gap: "10px"
      }}>
        <button
          onClick={onBack}
          style={{
            padding: "8px 15px", backgroundColor: "#6c757d",
            color: "white", border: "none", borderRadius: "4px",
            cursor: "pointer"
          }}
        >
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>➕ Add New Product</h2>
      </div>

      {message && (
        <div style={{
          backgroundColor: "#d4edda", color: "#155724",
          padding: "12px", borderRadius: "4px",
          marginBottom: "15px", textAlign: "center"
        }}>
          {message}
        </div>
      )}
      {error && (
        <div style={{
          backgroundColor: "#f8d7da", color: "#721c24",
          padding: "12px", borderRadius: "4px",
          marginBottom: "15px", textAlign: "center"
        }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
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

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
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
          <div style={{ marginBottom: "15px", textAlign: "center" }}>
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
          disabled={loading}
          style={{
            width: "100%", padding: "12px",
            backgroundColor: loading ? "#6c757d" : "#28a745",
            color: "white", border: "none", fontSize: "16px",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer"
          }}
        >
          {loading ? "Adding..." : "➕ Add Product"}
        </button>
      </form>
    </div>
  );
}

const labelStyle = {
  display: "block", marginBottom: "5px",
  fontWeight: "bold", fontSize: "14px", color: "#333"
};

const inputStyle = {
  display: "block", width: "100%", padding: "10px",
  marginBottom: "15px", fontSize: "15px",
  borderRadius: "4px", border: "1px solid #ccc",
  boxSizing: "border-box"
};

export default AddProduct;