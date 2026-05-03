function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return (
      <div style={{
        textAlign: "center", marginTop: "100px", fontFamily: "Arial"
      }}>
        <h2>🔒 Access Denied!</h2>
        <p>Please login first.</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            padding: "10px 25px", backgroundColor: "#007bff",
            color: "white", border: "none", borderRadius: "5px",
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