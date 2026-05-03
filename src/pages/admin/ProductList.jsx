import { useState } from "react";
import {
  deleteProduct,
  searchProducts,
  filterByCategory
} from "../../services/productService";
import "../../styles/products.css";
import "../../styles/dashboard.css";

function ProductList({ token, products, onRefresh, onEdit, onView }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [localProducts, setLocalProducts] = useState(products);

  const handleSearch = async () => {
    try {
      let result;
      if (search) {
        result = await searchProducts(search, token);
      } else if (category) {
        result = await filterByCategory(category, token);
      } else {
        result = products;
      }
      setLocalProducts(result);
    } catch (err) {
      console.log(err);
    }
  };

  const handleReset = () => {
    setSearch(""); setCategory("");
    setLocalProducts(products);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    try {
      await deleteProduct(id, token);
      onRefresh();
    } catch (err) {
      alert("Delete failed!");
    }
  };

  return (
    <div>
      {/* Summary Cards */}
      {localProducts.length > 0 && (
        <div className="summary-grid">
          <div className="summary-card"
            style={{ backgroundColor: "#007bff" }}>
            <h3>{localProducts.length}</h3>
            <p>Total Products</p>
          </div>
          <div className="summary-card"
            style={{ backgroundColor: "#28a745" }}>
            <h3>
              ₹{Math.max(...localProducts.map(p => p.price))
                .toLocaleString()}
            </h3>
            <p>Highest Price</p>
          </div>
          <div className="summary-card"
            style={{ backgroundColor: "#dc3545" }}>
            <h3>
              {localProducts.filter(p => p.quantity < 5).length}
            </h3>
            <p>Low Stock ⚠️</p>
          </div>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-bar">
        <input
          placeholder="🔍 Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Footwear">Footwear</option>
          <option value="Books">Books</option>
          <option value="Furniture">Furniture</option>
        </select>
        <button className="btn-primary" onClick={handleSearch}>
          Search
        </button>
        <button className="btn-secondary" onClick={handleReset}>
          Reset
        </button>
      </div>

      {/* No Products */}
      {localProducts.length === 0 && (
        <div className="empty-state">
          <h3>😕 No products found!</h3>
        </div>
      )}

      {/* Products Grid */}
      <div className="products-grid">
        {localProducts.map((p) => (
          <div key={p.id} className="product-card">
            <img
              src={p.imageUrl}
              alt={p.name}
              onError={(e) => {
                e.target.src =
                  "https://via.placeholder.com/300x180?text=No+Image";
              }}
            />
            <div className="product-card-body">
              <h4>{p.name}</h4>
              <p className="product-desc">
                {p.description?.substring(0, 50)}...
              </p>
              <p className="product-price">
                ₹{p.price?.toLocaleString()}
              </p>
              <div className="product-meta">
                <span>📁 {p.category}</span>
                <span className={
                  p.quantity < 5 ? "stock-low" : "stock-ok"
                }>
                  Stock: {p.quantity}
                  {p.quantity < 5 && " ⚠️"}
                </span>
              </div>

              {/* Admin Actions Only */}
              <div className="product-actions">
                <button
                  className="btn-primary"
                  onClick={() => onView(p)}
                >
                  👁️ View Details
                </button>
                <button
                  className="btn-success"
                  onClick={() => onEdit(p)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn-danger"
                  onClick={() => handleDelete(p.id)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ProductList;