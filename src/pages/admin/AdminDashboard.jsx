import { useState, useEffect } from "react";
import ProductDetail from "../../components/ProductDetail";
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
  <ProductDetail
    product={selectedProduct}
    token={user.token}
    onBack={() => setView("list")}
    isAdmin={true}
    onEdit={() => setView("edit")}
  />
)}

      </div>
    </div>
  );
}

export default AdminDashboard;