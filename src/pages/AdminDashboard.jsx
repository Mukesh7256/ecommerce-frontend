import ProductList from "./ProductList";
import AddProduct from "./AddProduct";
import { useState } from "react";

function AdminDashboard({ user }) {
  const [view, setView] = useState("list");

  return (
    <div>

      {/* NAV BUTTONS */}
      <div style={{ marginBottom: "20px" }}>
        <button className="search-btn" onClick={() => setView("list")}>
          📦 Products
        </button>
        <button className="reset-btn" onClick={() => setView("add")}>
          ➕ Add Product
        </button>
      </div>

      {/* SWITCH VIEW */}
      {view === "list" && <ProductList user={user} />}
      {view === "add" && <AddProduct user={user} />}

    </div>
  );
}

export default AdminDashboard;