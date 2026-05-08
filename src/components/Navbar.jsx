import { useState } from "react";
import "../styles/navbar.css";
import "../styles/home.css";

function Navbar({
  user, isAdmin, cartCount,
  onCartClick, onLogout,
  onSearch, onHomeClick,
  onOrdersClick
}) {
  const [searchText, setSearchText] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchText);
  };

  return (
    <div>
      {/* Top Navbar */}
      <div style={{
        backgroundColor: "#1a1a2e",
        color: "white",
        padding: "12px 25px",
        display: "flex",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap"
      }}>

        {/* Brand */}
        <div
          onClick={onHomeClick}
          style={{
            cursor: "pointer",
            display: "flex",
            flexDirection: "column"
          }}
        >
          <span style={{
            fontSize: "22px",
            fontWeight: "900",
            color: "#ff9900",
            lineHeight: "1"
          }}>
            ShopEasy
          </span>
          <span style={{ fontSize: "10px", color: "#90caf9" }}>
            {isAdmin ? "Admin Panel" : "India's Best Shop"}
          </span>
        </div>

        {/* Search Bar - User only */}
        {!isAdmin && (
          <form
            className="navbar-search"
            onSubmit={handleSearch}
          >
            <input
              type="text"
              placeholder="Search products, brands and more..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <button type="submit">🔍</button>
          </form>
        )}

        {/* Right Side */}
        <div style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          flexWrap: "wrap"
        }}>

          {/* User Info */}
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "11px", color: "#90caf9" }}>
              Hello, {user?.name?.split(" ")[0]}
            </div>
            <div style={{ fontSize: "13px", fontWeight: "bold" }}>
              Account
            </div>
          </div>

          {/* Role Badge */}
          {isAdmin && (
            <span style={{
              backgroundColor: "#dc3545",
              color: "white",
              padding: "3px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              fontWeight: "bold"
            }}>
              ADMIN
            </span>
          )}

          {/* Orders - User only */}
          {!isAdmin && (
            <button
              onClick={onOrdersClick}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                textAlign: "center",
                fontSize: "13px"
              }}
            >
              <div style={{ fontSize: "18px" }}>📦</div>
              <div>Orders</div>
            </button>
          )}

          {/* Cart - User only */}
          {!isAdmin && (
            <button
              onClick={onCartClick}
              style={{
                background: "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                textAlign: "center",
                fontSize: "13px",
                position: "relative"
              }}
            >
              <div style={{ fontSize: "22px" }}>🛒</div>
              <div>Cart</div>
              {cartCount > 0 && (
                <span style={{
                  position: "absolute",
                  top: "-5px",
                  right: "-5px",
                  backgroundColor: "#ff9900",
                  color: "white",
                  borderRadius: "50%",
                  width: "20px",
                  height: "20px",
                  fontSize: "11px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: "bold"
                }}>
                  {cartCount}
                </span>
              )}
            </button>
          )}

          {/* Logout */}
          <button
            onClick={onLogout}
            style={{
              padding: "8px 16px",
              backgroundColor: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontSize: "14px"
            }}
          >
            Logout
          </button>
        </div>
      </div>

      {/* Features Bar */}
      <div className="features-bar">
        {[
          { icon: "🚚", text: "Free Delivery above ₹499" },
          { icon: "🔄", text: "7-Day Easy Returns" },
          { icon: "🔒", text: "Secure Payments" },
          { icon: "⭐", text: "Genuine Products" },
          { icon: "🎯", text: "Best Prices" }
        ].map((item, i) => (
          <div key={i} className="feature-item">
            <span className="feature-icon">{item.icon}</span>
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Navbar;