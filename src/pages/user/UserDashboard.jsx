import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Cart from "./Cart";
import { getAllProducts } from "../../services/productService";
import { addToCart, getCartCount } from "../../services/cartService";
import "../../styles/dashboard.css";
import "../../styles/products.css";

function UserDashboard({ user, onLogout }) {
  const [view, setView] = useState("products");
  const [products, setProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
    fetchCount();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts(user.token);
      setProducts(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCount = async () => {
    try {
      const count = await getCartCount(user.token);
      setCartCount(count);
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1, user.token);
      alert("✅ Added to cart!");
      fetchCount();
    } catch (err) {
      alert("❌ Failed to add!");
    }
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar
        user={user}
        isAdmin={false}
        cartCount={cartCount}
        onCartClick={() => setView("cart")}
        onLogout={onLogout}
      />

      <div className="dashboard-container">

        {view === "cart" && (
          <Cart
            token={user.token}
            onBack={() => {
              setView("products");
              fetchCount();
            }}
          />
        )}

        {view === "detail" && selectedProduct && (
          <div className="detail-container">
            <button
              className="btn-secondary"
              onClick={() => setView("products")}
              style={{ marginBottom: "15px" }}
            >
              ← Back
            </button>
            <div className="detail-grid">
              <div className="detail-image">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/400x300?text=No+Image";
                  }}
                />
              </div>
              <div className="detail-info">
                <span className="category-badge">
                  {selectedProduct.category}
                </span>
                <h2 style={{ margin: "15px 0 10px" }}>
                  {selectedProduct.name}
                </h2>
                <p style={{ color: "gray", lineHeight: "1.6" }}>
                  {selectedProduct.description}
                </p>
                <p className="detail-price">
                  ₹{selectedProduct.price?.toLocaleString()}
                </p>
                <p>
                  Stock:{" "}
                  <strong className={
                    selectedProduct.quantity < 5
                      ? "stock-low" : "stock-ok"
                  }>
                    {selectedProduct.quantity} units
                  </strong>
                </p>
                <div className="detail-actions">
                  <button
                    className="btn-success"
                    style={{ padding: "12px" }}
                    onClick={() => handleAddToCart(selectedProduct.id)}
                  >
                    🛒 Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === "products" && (
          <div>
            <h2 style={{ marginBottom: "20px" }}>🛍️ All Products</h2>

            {loading && (
              <div className="loader">Loading products...</div>
            )}

            {!loading && products.length === 0 && (
              <div className="empty-state">
                <h3>No products available yet!</h3>
              </div>
            )}

            <div className="products-grid">
              {products.map((p) => (
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
                      {p.description?.substring(0, 60)}...
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
                      </span>
                    </div>
                    {/* USER only sees these buttons - NO edit/delete */}
                    <div className="product-actions">
                      <button
                        className="btn-primary"
                        onClick={() => {
                          setSelectedProduct(p);
                          setView("detail");
                        }}
                      >
                        👁️ View Details
                      </button>
                      <button
                        className="btn-success"
                        onClick={() => handleAddToCart(p.id)}
                      >
                        🛒 Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UserDashboard;