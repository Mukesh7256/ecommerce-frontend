function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div style={{
        textAlign: "center", marginTop: "100px", fontFamily: "Arial"
      }}>
        <h2>🔒 Access Denied!</h2>
        <p>Please login to access this page.</p>
        <button
          onClick={() => window.location.href = "/"}
          style={{
            padding: "10px 20px", backgroundColor: "#007bff",
            color: "white", border: "none", borderRadius: "4px",
            cursor: "pointer", fontSize: "16px"
          }}
        >
          Go to Login
        </button>
      </div>
    );
  }

  return children;
}

export default ProtectedRoute;