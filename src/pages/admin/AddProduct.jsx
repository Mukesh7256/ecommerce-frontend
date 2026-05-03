import { useState } from "react";
import { addProduct } from "../../services/productService";
import "../../styles/products.css";

function AddProduct({ token, onBack, onSuccess }) {
  const [form, setForm] = useState({
    name: "", description: "", price: "",
    category: "", quantity: "", imageUrl: "",
    image2: "", image3: "", image4: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);

    // Combine all images into imageUrls
    const allImages = [
      form.imageUrl,
      form.image2,
      form.image3,
      form.image4
    ].filter(url => url.trim() !== "").join(",");

    try {
      await addProduct(
        {
          name: form.name,
          description: form.description,
          price: parseFloat(form.price),
          quantity: parseInt(form.quantity),
          category: form.category,
          imageUrl: form.imageUrl,  // main image
          imageUrls: allImages      // all images
        },
        token
      );
      alert("✅ Product added!");
      onSuccess();
    } catch (err) {
      setError("Failed to add product!");
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
        <h2>➕ Add New Product</h2>
      </div>

      {error && <p className="error-msg">{error}</p>}

      <form onSubmit={handleSubmit}>

        <div className="form-group">
          <label>Product Name *</label>
          <input
            name="name" value={form.name}
            placeholder="e.g. iPhone 15"
            onChange={handleChange} required
          />
        </div>

        <div className="form-group">
          <label>Description *</label>
          <textarea
            name="description" value={form.description}
            placeholder="Product description..."
            onChange={handleChange} rows={3} required
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Price (₹) *</label>
            <input
              name="price" type="number"
              value={form.price} placeholder="9999"
              onChange={handleChange} required min="0"
            />
          </div>
          <div className="form-group">
            <label>Quantity *</label>
            <input
              name="quantity" type="number"
              value={form.quantity} placeholder="50"
              onChange={handleChange} required min="0"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Category *</label>
          <select
            name="category" value={form.category}
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

        {/* Multiple Images Section */}
        <div style={{
          backgroundColor: "#f8f9fa", padding: "20px",
          borderRadius: "8px", marginBottom: "15px"
        }}>
          <h4 style={{ marginBottom: "15px", color: "#333" }}>
            📸 Product Images (Like Amazon)
          </h4>

          <div className="form-group">
            <label>🖼️ Main Image URL * (Front View)</label>
            <input
              name="imageUrl" value={form.imageUrl}
              placeholder="https://example.com/front.jpg"
              onChange={handleChange} required
            />
          </div>

          <div className="form-group">
            <label>🖼️ Image 2 URL (Back View)</label>
            <input
              name="image2" value={form.image2}
              placeholder="https://example.com/back.jpg"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>🖼️ Image 3 URL (Side View)</label>
            <input
              name="image3" value={form.image3}
              placeholder="https://example.com/side.jpg"
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>🖼️ Image 4 URL (Detail View)</label>
            <input
              name="image4" value={form.image4}
              placeholder="https://example.com/detail.jpg"
              onChange={handleChange}
            />
          </div>

          {/* Image Previews */}
          {(form.imageUrl || form.image2 ||
            form.image3 || form.image4) && (
            <div>
              <p style={{
                fontSize: "13px", color: "gray",
                marginBottom: "10px"
              }}>
                Preview:
              </p>
              <div style={{
                display: "flex", gap: "8px",
                flexWrap: "wrap"
              }}>
                {[form.imageUrl, form.image2,
                  form.image3, form.image4]
                  .filter(url => url)
                  .map((url, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <img
                      src={url}
                      alt={`Image ${i + 1}`}
                      style={{
                        width: "80px", height: "80px",
                        objectFit: "contain",
                        border: i === 0
                          ? "2px solid #007bff"
                          : "1px solid #ddd",
                        borderRadius: "5px",
                        backgroundColor: "#f8f9fa",
                        padding: "4px"
                      }}
                      onError={(e) =>
                        e.target.style.display = "none"
                      }
                    />
                    {i === 0 && (
                      <span style={{
                        position: "absolute", top: "-8px",
                        left: "-8px", backgroundColor: "#007bff",
                        color: "white", fontSize: "10px",
                        padding: "2px 5px", borderRadius: "3px"
                      }}>
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary"
          style={{
            width: "100%", padding: "12px", fontSize: "16px"
          }}
          disabled={loading}
        >
          {loading ? "Adding..." : "➕ Add Product"}
        </button>
      </form>
    </div>
  );
}

export default AddProduct;