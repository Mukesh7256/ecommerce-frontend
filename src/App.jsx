import { useState, useEffect } from "react";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/user/UserDashboard";

// Admin emails list
const ADMIN_EMAILS = ["admin@ecommerce.com", "ajay@123gmail.com"];

function App() {
  const [page, setPage] = useState("register");
  const [user, setUser] = useState(null);

  // Auto login on refresh
  useEffect(() => {
    const token = localStorage.getItem("token");
    const name = localStorage.getItem("name");
    const email = localStorage.getItem("email");
    if (token) {
      setUser({ token, name, email });
      setPage("dashboard");
    }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem("token", userData.token);
    localStorage.setItem("name", userData.name);
    localStorage.setItem("email", userData.email);
    setUser(userData);
    setPage("dashboard");
  };

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setPage("login");
  };

  // Check if user is admin
  const isAdmin = user && ADMIN_EMAILS.includes(user.email);

  if (page === "dashboard" && user) {
    return isAdmin ? (
      <AdminDashboard user={user} onLogout={handleLogout} />
    ) : (
      <UserDashboard user={user} onLogout={handleLogout} />
    );
  }

  if (page === "login") {
    return (
      <Login
        onLogin={handleLogin}
        onSwitchToRegister={() => setPage("register")}
      />
    );
  }

  return (
    <Register onSwitchToLogin={() => setPage("login")} />
  );
}

export default App;