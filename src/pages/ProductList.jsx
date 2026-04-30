import { useState, useEffect } from "react";
import axios from "axios";

function ProductList() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // T030: Fetch products dynamically on load
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        "http://localhost:8080/api/products"
      );
      setProducts(res.data);
    } catch (err) {
      setError("Failed to load products!");
    } finally {
      setLoading(false);
    }
  };

  // T030: Search dynamically
  const handleSearch = async () => {
    setLoading(true);
    try {
      let url = "http://localhost:8080/api/products";
      if (search) {
        url = `http://localhost:8080/api/products/search?keyword=${search}`;
      } else if (category) {
        url = `http://localhost:8080/api/products/category/${category}`;
      }
      const res = await axios.get(url);
      setProducts(res.data);
    } catch (err) {
      setError("Search failed!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete?")) return;
    try {
      await axios.delete(
        `http://localhost:8080/api/products/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchProducts();
    } catch (err) {
      alert("Delete failed! Please login again.");
    }
  };

  return (
    <div style={{ fontFamily: "Arial", padding: "20px" }}>

      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between",
        alignItems: "center", marginBottom: "20px"
      }}>
        <h2>🛒 Product Management</h2>
        <button
          onClick={() => window.location.href = "/add-product"}
          style={{
            padding: "10px 20px", backgroundColor: "#28a745",
            color: "white", border: "none", borderRadius: "4px",
            cursor: "pointer", fontSize: "16px"
          }}
        >
          + Add New Product
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        display: "flex", gap: "10px",
        marginBottom: "20px", flexWrap: "wrap"
      }}>
        <input
          placeholder="🔍 Search by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          style={{
            flex: 1, minWidth: "200px", padding: "10px",
            fontSize: "15px", borderRadius: "4px",
            border: "1px solid #ddd"
          }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            padding: "10px", fontSize: "15px",
            borderRadius: "4px", border: "1px solid #ddd"
          }}
        >
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Clothing">Clothing</option>
          <option value="Footwear">Footwear</option>
          <option value="Books">Books</option>
          <option value="Furniture">Furniture</option>
        </select>
        <button onClick={handleSearch} style={searchBtnStyle}>
          Search
        </button>
        <button
          onClick={() => {
            setSearch(""); setCategory("");
            fetchProducts();
          }}
          style={{ ...searchBtnStyle, backgroundColor: "#6c757d" }}
        >
          Reset
        </button>
      </div>

      {/* Error */}
      {error && (
        <p style={{ color: "red", textAlign: "center" }}>{error}</p>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ textAlign: "center", padding: "40px" }}>
          <p style={{ fontSize: "18px", color: "gray" }}>
            Loading products...
          </p>
        </div>
      )}

      {/* T030: Products Count */}
      {!loading && (
        <p style={{ color: "gray", marginBottom: "15px" }}>
          Showing <strong>{products.length}</strong> products
        </p>
      )}

      {/* T030: No Products */}
      {!loading && products.length === 0 && (
        <div style={{
          textAlign: "center", padding: "60px",
          backgroundColor: "#f8f9fa", borderRadius: "8px"
        }}>
          <h3>😕 No products found!</h3>
          <p style={{ color: "gray" }}>
            Add products using the button above.
          </p>
        </div>
      )}

      {/* T029 + T030: Product Table */}
      {!loading && products.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table style={{
            width: "100%", borderCollapse: "collapse",
            backgroundColor: "white",
            boxShadow: "0 0 10px rgba(0,0,0,0.1)",
            borderRadius: "8px", overflow: "hidden"
          }}>
            <thead>
              <tr style={{ backgroundColor: "#007bff", color: "white" }}>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Category</th>
                <th style={thStyle}>Price</th>
                <th style={thStyle}>Stock</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => (
                <tr
                  key={product.id}
                  style={{
                    backgroundColor: index % 2 === 0 ? "#f8f9fa" : "white",
                    transition: "background 0.2s"
                  }}
                >
                  <td style={tdStyle}>{product.id}</td>
                  <td style={tdStyle}>
                    <strong>{product.name}</strong>
                    <br />
                    <span style={{ color: "gray", fontSize: "12px" }}>
                      {product.description?.substring(0, 40)}...
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      backgroundColor: "#e3f2fd",
                      color: "#1565c0", padding: "3px 8px",
                      borderRadius: "12px", fontSize: "13px"
                    }}>
                      {product.category}
                    </span>
                  </td>
                  <td style={{ ...tdStyle, color: "#28a745", fontWeight: "bold" }}>
                    ₹{product.price?.toLocaleString()}
                  </td>
                  <td style={tdStyle}>
                    <span style={{
                      color: product.quantity < 5 ? "red" : "#28a745",
                      fontWeight: "bold"
                    }}>
                      {product.quantity}
                      {product.quantity < 5 && " ⚠️ Low"}
                    </span>
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => alert(`Edit product ${product.id} - Coming soon!`)}
                      style={{
                        padding: "5px 12px", backgroundColor: "#ffc107",
                        border: "none", borderRadius: "4px",
                        cursor: "pointer", marginRight: "5px",
                        fontSize: "13px"
                      }}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      style={{
                        padding: "5px 12px", backgroundColor: "#dc3545",
                        color: "white", border: "none",
                        borderRadius: "4px", cursor: "pointer",
                        fontSize: "13px"
                      }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* T030: Summary Cards */}
      {!loading && products.length > 0 && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
          gap: "15px", marginTop: "30px"
        }}>
          <div style={cardStyle("#007bff")}>
            <h3 style={{ margin: 0, fontSize: "28px" }}>
              {products.length}
            </h3>
            <p style={{ margin: 0 }}>Total Products</p>
          </div>
          <div style={cardStyle("#28a745")}>
            <h3 style={{ margin: 0, fontSize: "28px" }}>
              ₹{Math.max(...products.map(p => p.price)).toLocaleString()}
            </h3>
            <p style={{ margin: 0 }}>Highest Price</p>
          </div>
          <div style={cardStyle("#dc3545")}>
            <h3 style={{ margin: 0, fontSize: "28px" }}>
              {products.filter(p => p.quantity < 5).length}
            </h3>
            <p style={{ margin: 0 }}>Low Stock Items</p>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle = {
  padding: "12px 15px", textAlign: "left",
  fontWeight: "bold", fontSize: "14px"
};

const tdStyle = {
  padding: "12px 15px", borderBottom: "1px solid #eee",
  fontSize: "14px"
};

const searchBtnStyle = {
  padding: "10px 20px", backgroundColor: "#007bff",
  color: "white", border: "none", borderRadius: "4px",
  cursor: "pointer", fontSize: "15px"
};

const cardStyle = (color) => ({
  backgroundColor: color, color: "white",
  padding: "20px", borderRadius: "8px",
  textAlign: "center"
});

export default ProductList;