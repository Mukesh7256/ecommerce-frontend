import { useState, useEffect } from "react";
import Navbar from "../../components/Navbar";
import ProductList from "./ProductList";
import AddProduct from "./AddProduct";
import EditProduct from "./EditProduct";
import { getAllProducts } from "../../services/productService";
import "../../styles/dashboard.css";
import "../../styles/products.css";

function AdminDashboard({ user, onLogout }) {
  const [view, setView] = useState("list");
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
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

  return (
    <div>
      {/* Navbar */}
      <Navbar
        user={user}
        isAdmin={true}
        cartCount={0}
        onLogout={onLogout}
      />

      <div className="dashboard-container">

        {/* Menu */}
        <div className="dashboard-menu">
          <button
            className={`btn-primary ${view === "list" ? "active" : ""}`}
            onClick={() => setView("list")}
          >
            📦 Products ({products.length})
          </button>
          <button
            className="btn-success"
            onClick={() => setView("add")}
          >
            ➕ Add Product
          </button>
        </div>

        {loading && <div className="loader">⏳ Loading...</div>}

        {/* Product List View */}
        {view === "list" && !loading && (
          <ProductList
            token={user.token}
            products={products}
            onRefresh={fetchProducts}
            onEdit={(p) => {
              setSelectedProduct(p);
              setView("edit");
            }}
            onView={(p) => {
              setSelectedProduct(p);
              setView("detail");
            }}
          />
        )}

        {/* Add Product View */}
        {view === "add" && (
          <AddProduct
            token={user.token}
            onBack={() => setView("list")}
            onSuccess={() => {
              setView("list");
              fetchProducts();
            }}
          />
        )}

        {/* Edit Product View */}
        {view === "edit" && selectedProduct && (
          <EditProduct
            token={user.token}
            product={selectedProduct}
            onBack={() => setView("list")}
            onSuccess={() => {
              setView("list");
              fetchProducts();
            }}
          />
        )}

        {/* Product Detail View */}
        {view === "detail" && selectedProduct && (
          <div className="detail-container">
            <button
              className="btn-secondary"
              onClick={() => setView("list")}
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
                    onClick={() => {
                      setView("edit");
                    }}
                  >
                    ✏️ Edit Product
                  </button>
                  <button
                    className="btn-danger"
                    style={{ padding: "12px" }}
                    onClick={async () => {
                      if (!window.confirm("Delete?")) return;
                      const { deleteProduct } = await import(
                        "../../services/productService"
                      );
                      await deleteProduct(
                        selectedProduct.id, user.token
                      );
                      setView("list");
                      fetchProducts();
                    }}
                  >
                    🗑️ Delete Product
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default AdminDashboard;