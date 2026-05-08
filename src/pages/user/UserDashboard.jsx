import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import Cart from "./Cart";
import Checkout from "./Checkout";
import Orders from "./Orders";
import ProductDetail from "../../components/ProductDetail";
import { getAllProducts, searchProducts, filterByCategory } from "../../services/productService";
import { addToCart, getCartCount } from "../../services/cartService";
import "../../styles/dashboard.css";
import "../../styles/products.css";
import "../../styles/home.css";

function UserDashboard({ user, onLogout }) {
  const [view, setView] = useState("home");
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [orderSuccess, setOrderSuccess] = useState(null);
  const [cartItems, setCartItems] = useState([]);

  const categories = [
    { name: "All", icon: "🏪" },
    { name: "Electronics", icon: "📱" },
    { name: "Clothing", icon: "👕" },
    { name: "Footwear", icon: "👟" },
    { name: "Books", icon: "📚" },
    { name: "Furniture", icon: "🛋️" }
  ];

  useEffect(() => {
    fetchProducts();
    fetchCount();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const data = await getAllProducts(user.token);
      setProducts(data);
      setFilteredProducts(data);
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

  const handleSearch = async (keyword) => {
    if (!keyword.trim()) {
      setFilteredProducts(products);
      return;
    }
    try {
      setLoading(true);
      const data = await searchProducts(keyword, user.token);
      setFilteredProducts(data);
      setView("products");
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryFilter = async (category) => {
    setSelectedCategory(category);
    setView("products");
    try {
      setLoading(true);
      if (category === "All") {
        setFilteredProducts(products);
      } else {
        const data = await filterByCategory(category, user.token);
        setFilteredProducts(data);
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId, quantity = 1) => {
    try {
      await addToCart(productId, quantity, user.token);
      alert("✅ Added to cart!");
      fetchCount();
    } catch (err) {
      alert(err.response?.data || "Failed to add to cart!");
    }
  };

  const handleOrderSuccess = (order) => {
    setOrderSuccess(order);
    setView("order-success");
    fetchCount();
    fetchProducts();
  };

  // ===== HOME PAGE =====
  if (view === "home") {
    return (
      <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
        <Navbar
          user={user}
          isAdmin={false}
          cartCount={cartCount}
          onCartClick={() => setView("cart")}
          onLogout={onLogout}
          onSearch={handleSearch}
          onHomeClick={() => setView("home")}
          onOrdersClick={() => setView("orders")}
        />

        {/* Hero Section */}
        <div className="hero-section">
          <h1 className="hero-title">
            🛍️ Welcome to ShopEasy
          </h1>
          <p className="hero-subtitle">
            Discover millions of products at unbeatable prices
          </p>
          <div className="hero-buttons">
            <button
              className="btn-hero-primary"
              onClick={() => setView("products")}
            >
              Shop Now →
            </button>
            <button
              className="btn-hero-secondary"
              onClick={() => setView("orders")}
            >
              My Orders
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar">
          {[
            { number: products.length + "+", label: "Products" },
            { number: "10K+", label: "Happy Customers" },
            { number: "500+", label: "Brands" },
            { number: "FREE", label: "Delivery above ₹499" }
          ].map((stat, i) => (
            <div key={i} className="stat-item">
              <div className="stat-number">{stat.number}</div>
              <div className="stat-label">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Category Section */}
        <div className="category-section">
          <h2 className="section-title">
            Shop by Category
          </h2>
          <div className="categories-grid">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="category-card"
                onClick={() => handleCategoryFilter(cat.name)}
              >
                <div className="category-icon">{cat.icon}</div>
                <div className="category-name">{cat.name}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Offer Banner */}
        <div className="offer-banner">
          <div>
            <div className="offer-title">
              🔥 Big Sale — Up to 50% OFF!
            </div>
            <div className="offer-subtitle">
              On Electronics, Clothing & More
            </div>
          </div>
          <button
            className="btn-offer"
            onClick={() => setView("products")}
          >
            Shop Now
          </button>
        </div>

        {/* Featured Products */}
        <div style={{ padding: "0 40px 40px" }}>
          <h2 className="section-title">
            🔥 Featured Products
          </h2>

          {loading ? (
            <div className="loader">Loading products...</div>
          ) : (
            <div className="products-grid">
              {products.slice(0, 6).map((p) => (
                <div key={p.id} className="product-card">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/300x200?text=No+Image";
                    }}
                  />
                  <div className="product-card-body">
                    <h4>{p.name}</h4>
                    <p className="product-desc">
                      {p.description?.substring(0, 50)}...
                    </p>
                    <div style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "5px"
                    }}>
                      <span style={{
                        color: "#B12704",
                        fontSize: "20px",
                        fontWeight: "bold"
                      }}>
                        ₹{p.price?.toLocaleString()}
                      </span>
                      <span style={{
                        color: "gray",
                        textDecoration: "line-through",
                        fontSize: "14px"
                      }}>
                        ₹{Math.round(p.price * 1.1).toLocaleString()}
                      </span>
                      <span style={{
                        backgroundColor: "#cc0c39",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: "3px",
                        fontSize: "12px"
                      }}>
                        -10%
                      </span>
                    </div>
                    <div className="product-meta">
                      <span>📁 {p.category}</span>
                      <span style={{
                        color: p.quantity < 5 ? "red" : "green",
                        fontWeight: "bold"
                      }}>
                        {p.quantity < 5 ? "⚠️ Few Left" : "✅ In Stock"}
                      </span>
                    </div>
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
          )}

          {products.length > 6 && (
            <div style={{ textAlign: "center", marginTop: "25px" }}>
              <button
                className="btn-primary"
                style={{ padding: "12px 40px", fontSize: "16px" }}
                onClick={() => setView("products")}
              >
                View All Products →
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="footer">
          <div className="footer-grid">
            <div className="footer-section">
              <h4>🛍️ ShopEasy</h4>
              <p>India's trusted online shopping destination</p>
              <p>Quality products at best prices</p>
            </div>
            <div className="footer-section">
              <h4>Quick Links</h4>
              <a onClick={() => setView("home")}>Home</a>
              <a onClick={() => setView("products")}>All Products</a>
              <a onClick={() => setView("orders")}>My Orders</a>
              <a onClick={() => setView("cart")}>Cart</a>
            </div>
            <div className="footer-section">
              <h4>Customer Service</h4>
              <a>Help Center</a>
              <a>Return Policy</a>
              <a>Shipping Info</a>
              <a>Contact Us</a>
            </div>
            <div className="footer-section">
              <h4>Contact Us</h4>
              <p>📧 support@shopeasy.com</p>
              <p>📞 1800-XXX-XXXX</p>
              <p>⏰ Mon-Sat 9AM-6PM</p>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 ShopEasy. All rights reserved.</p>
          </div>
        </div>
      </div>
    );
  }

  // ===== CART VIEW =====
  if (view === "cart") {
    return (
      <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
        <Navbar
          user={user} isAdmin={false}
          cartCount={cartCount}
          onCartClick={() => setView("cart")}
          onLogout={onLogout}
          onSearch={handleSearch}
          onHomeClick={() => setView("home")}
          onOrdersClick={() => setView("orders")}
        />
        <div style={{ padding: "20px" }}>
          <Cart
            token={user.token}
            onBack={() => setView("home")}
            onCartCountChange={fetchCount}
            onCheckout={(items) => {
              setCartItems(items);
              setView("checkout");
            }}
          />
        </div>
      </div>
    );
  }

  // ===== CHECKOUT VIEW =====
  if (view === "checkout") {
    return (
      <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
        <Navbar
          user={user} isAdmin={false}
          cartCount={cartCount}
          onCartClick={() => setView("cart")}
          onLogout={onLogout}
          onSearch={handleSearch}
          onHomeClick={() => setView("home")}
          onOrdersClick={() => setView("orders")}
        />
        <div style={{ padding: "20px" }}>
          <Checkout
            token={user.token}
            cartItems={cartItems}
            onSuccess={handleOrderSuccess}
            onBack={() => setView("cart")}
          />
        </div>
      </div>
    );
  }

  // ===== ORDER SUCCESS VIEW =====
  if (view === "order-success" && orderSuccess) {
    return (
      <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
        <Navbar
          user={user} isAdmin={false}
          cartCount={cartCount}
          onCartClick={() => setView("cart")}
          onLogout={onLogout}
          onSearch={handleSearch}
          onHomeClick={() => setView("home")}
          onOrdersClick={() => setView("orders")}
        />
        <div style={{ padding: "20px" }}>
          <div className="order-success">
            <div className="success-icon">🎉</div>
            <h2 style={{ color: "#28a745", marginBottom: "10px" }}>
              Order Placed Successfully!
            </h2>
            <p style={{ color: "gray", marginBottom: "5px" }}>
              Order ID: <strong>#{orderSuccess.id}</strong>
            </p>
            <p style={{ color: "gray", marginBottom: "20px" }}>
              Expected delivery by{" "}
              <strong>
                {new Date(orderSuccess.deliveryDate)
                  .toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric"
                  })}
              </strong>
            </p>
            <div style={{
              backgroundColor: "#f8f9fa", padding: "15px",
              borderRadius: "8px", marginBottom: "20px"
            }}>
              <p style={{ margin: "5px 0" }}>
                💳 Payment: {orderSuccess.paymentMethod}
              </p>
              <p style={{ margin: "5px 0" }}>
                📍 Delivery to: {orderSuccess.deliveryAddress},
                {orderSuccess.city}
              </p>
              <p style={{
                margin: "5px 0", fontSize: "18px",
                fontWeight: "bold", color: "#B12704"
              }}>
                Total: ₹{orderSuccess.finalPrice?.toLocaleString()}
              </p>
            </div>
            <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
              <button
                className="btn-primary"
                style={{ padding: "12px 25px" }}
                onClick={() => setView("orders")}
              >
                📦 Track Order
              </button>
              <button
                className="btn-success"
                style={{ padding: "12px 25px" }}
                onClick={() => setView("home")}
              >
                🛍️ Continue Shopping
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== ORDERS VIEW =====
  if (view === "orders") {
    return (
      <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
        <Navbar
          user={user} isAdmin={false}
          cartCount={cartCount}
          onCartClick={() => setView("cart")}
          onLogout={onLogout}
          onSearch={handleSearch}
          onHomeClick={() => setView("home")}
          onOrdersClick={() => setView("orders")}
        />
        <div style={{ padding: "20px" }}>
          <Orders
            token={user.token}
            onBack={() => setView("home")}
          />
        </div>
      </div>
    );
  }

  // ===== PRODUCT DETAIL VIEW =====
  if (view === "detail" && selectedProduct) {
    return (
      <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
        <Navbar
          user={user} isAdmin={false}
          cartCount={cartCount}
          onCartClick={() => setView("cart")}
          onLogout={onLogout}
          onSearch={handleSearch}
          onHomeClick={() => setView("home")}
          onOrdersClick={() => setView("orders")}
        />
        <div style={{ padding: "20px" }}>
          <ProductDetail
            product={selectedProduct}
            token={user.token}
            onBack={() => setView("products")}
            isAdmin={false}
            onAddToCart={handleAddToCart}
          />
        </div>
      </div>
    );
  }

  // ===== ALL PRODUCTS VIEW =====
  return (
    <div style={{ backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
      <Navbar
        user={user} isAdmin={false}
        cartCount={cartCount}
        onCartClick={() => setView("cart")}
        onLogout={onLogout}
        onSearch={handleSearch}
        onHomeClick={() => setView("home")}
        onOrdersClick={() => setView("orders")}
      />
      <div style={{ padding: "20px" }}>

        {/* Category Filter */}
        <div style={{
          display: "flex", gap: "10px",
          marginBottom: "20px", flexWrap: "wrap"
        }}>
          {categories.map((cat, i) => (
            <button
              key={i}
              onClick={() => handleCategoryFilter(cat.name)}
              style={{
                padding: "8px 16px",
                backgroundColor: selectedCategory === cat.name
                  ? "#007bff" : "white",
                color: selectedCategory === cat.name
                  ? "white" : "#333",
                border: "1px solid #ddd",
                borderRadius: "20px",
                cursor: "pointer",
                fontSize: "14px",
                transition: "all 0.2s"
              }}
            >
              {cat.icon} {cat.name}
            </button>
          ))}
        </div>

        <h3 style={{ marginBottom: "15px" }}>
          {selectedCategory === "All"
            ? `All Products (${filteredProducts.length})`
            : `${selectedCategory} (${filteredProducts.length})`
          }
        </h3>

        {loading && <div className="loader">Loading...</div>}

        {!loading && filteredProducts.length === 0 && (
          <div className="empty-state">
            <h3>No products found!</h3>
          </div>
        )}

        <div className="products-grid">
          {filteredProducts.map((p) => (
            <div key={p.id} className="product-card">
              <img
                src={p.imageUrl}
                alt={p.name}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/300x200?text=No+Image";
                }}
              />
              <div className="product-card-body">
                <h4>{p.name}</h4>
                <p className="product-desc">
                  {p.description?.substring(0, 50)}...
                </p>
                <div style={{
                  display: "flex", alignItems: "center",
                  gap: "8px", marginBottom: "5px"
                }}>
                  <span style={{
                    color: "#B12704", fontSize: "20px",
                    fontWeight: "bold"
                  }}>
                    ₹{p.price?.toLocaleString()}
                  </span>
                  <span style={{
                    color: "gray",
                    textDecoration: "line-through",
                    fontSize: "13px"
                  }}>
                    ₹{Math.round(p.price * 1.1).toLocaleString()}
                  </span>
                  <span style={{
                    backgroundColor: "#cc0c39",
                    color: "white", padding: "2px 5px",
                    borderRadius: "3px", fontSize: "11px"
                  }}>
                    -10%
                  </span>
                </div>
                <div className="product-meta">
                  <span>📁 {p.category}</span>
                  <span style={{
                    color: p.quantity < 5 ? "red" : "green"
                  }}>
                    {p.quantity < 5 ? "⚠️ Few Left" : "✅ In Stock"}
                  </span>
                </div>
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
    </div>
  );
}

export default UserDashboard;