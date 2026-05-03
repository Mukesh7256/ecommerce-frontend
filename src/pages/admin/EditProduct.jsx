import { useState } from "react";
import { updateProduct } from "../../services/productService";
import "../../styles/products.css";

function EditProduct({ token, product, onBack, onSuccess }) {
  const [form, setForm] = useState({
    name: product.name || "",
    description: product.description || "",
    price: product.price || "",
    category: product.category || "",
    quantity: product.quantity || "",
    imageUrl: product.imageUrl || ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await updateProduct(
        product.id,
        {
          ...form,
          price: parseFloat(form.price),
          quantity: parseInt(form.quantity)
        },
        token
      );
      alert("✅ Product updated!");
      onSuccess();
    } catch (err) {
      setError("Failed to update product!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <button className="btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <h2>✏️ Edit Product #{product.id}</h2>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Product Name *</label>
          <input
            name="name" value={form.name}
            onChange={handleChange} required
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description" value={form.description}
            onChange={handleChange} rows={3} required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price (₹) *</label>
            <input
              name="price" type="number"
              value={form.price}
              onChange={handleChange}
              required min="0"
            />
          </div>
          <div className="form-group">
            <label>Quantity *</label>
            <input
              name="quantity" type="number"
              value={form.quantity}
              onChange={handleChange}
              required min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Category *</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange} required
          >
            <option value="">Select Category</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Footwear">Footwear</option>
            <option value="Books">Books</option>
            <option value="Furniture">Furniture</option>
          </select>
        </div>

        <div className="form-group">
          <label>Image URL</label>
          <input
            name="imageUrl" value={form.imageUrl}
            onChange={handleChange}
          />
        </div>

        {form.imageUrl && (
          <div className="image-preview">
            <img
              src={form.imageUrl} alt="Preview"
              onError={(e) => e.target.style.display = "none"}
            />
          </div>
        )}

        <button
          type="submit"
          className="btn-success"
          style={{ width: "100%", padding: "12px", fontSize: "16px" }}
          disabled={loading}
        >
          {loading ? "Updating..." : "✅ Update Product"}
        </button>
      </form>
    </div>
  );
}

export default EditProduct;