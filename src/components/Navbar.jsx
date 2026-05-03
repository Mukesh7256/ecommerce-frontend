import "../styles/navbar.css";

function Navbar({ user, isAdmin, cartCount, onCartClick, onLogout }) {
  return (
    <div className="navbar">

      {/* Left - Brand */}
      <span className="navbar-brand">
        📦 {isAdmin ? "Admin Panel" : "E-Commerce"}
      </span>

      {/* Right - User Info + Buttons */}
      <div className="navbar-right">

        {/* Active Users - shown always */}
        <span className="active-users">
          🟢 Active Users: 1
        </span>

        {/* User Info */}
        <span className="navbar-user">
          👤 {user?.name}
        </span>

        {/* Role Badge */}
        <span className={`navbar-role ${isAdmin ? "admin" : ""}`}>
          {isAdmin ? "ADMIN" : "USER"}
        </span>

        {/* Cart - only for users */}
        {!isAdmin && (
          <button className="btn-cart" onClick={onCartClick}>
            🛒 Cart ({cartCount})
          </button>
        )}

        {/* Logout */}
        <button className="btn-logout" onClick={onLogout}>
          Logout
        </button>

      </div>
    </div>
  );
}

export default Navbar;