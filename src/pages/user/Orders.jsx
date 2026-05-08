import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/checkout.css";

function Orders({ token, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8080/api/orders/my-orders",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if (!window.confirm("Cancel this order?")) return;
    try {
      await axios.put(
        `http://localhost:8080/api/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOrders();
      alert("✅ Order cancelled successfully!");
    } catch (err) {
      alert(err.response?.data || "Cancel failed!");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric"
    });
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px" }}>
        <p style={{ fontSize: "20px", color: "gray" }}>
          ⏳ Loading orders...
        </p>
      </div>
    );
  }

  return (
    <div className="orders-list">

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        gap: "15px", marginBottom: "25px"
      }}>
        <button className="btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>📦 My Orders</h2>
      </div>

      {/* No Orders */}
      {orders.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: "60px", marginBottom: "15px" }}>
            📦
          </div>
          <h3>No orders yet!</h3>
          <p style={{ color: "gray", marginBottom: "20px" }}>
            You haven't placed any orders.
          </p>
          <button className="btn-primary" onClick={onBack}>
            Start Shopping
          </button>
        </div>
      )}

      {/* Orders List */}
      {orders.map((order) => (
        <div
          key={order.id}
          className={`order-card ${order.status}`}
        >
          {/* Order Header */}
          <div className="order-header">
            <div>
              <span className="order-id">
                Order #{order.id}
              </span>
              <span style={{
                color: "gray", fontSize: "13px",
                marginLeft: "10px"
              }}>
                Placed on {formatDate(order.orderDate)}
              </span>
            </div>
            <span className={`status-badge status-${order.status}`}>
              {order.status}
            </span>
          </div>

          {/* Order Items */}
          <div style={{ marginBottom: "15px" }}>
            {order.orderItems?.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center",
                gap: "10px", marginBottom: "8px"
              }}>
                <img
                  src={item.product?.imageUrl}
                  alt={item.productName}
                  style={{
                    width: "50px", height: "50px",
                    objectFit: "contain",
                    borderRadius: "5px",
                    backgroundColor: "#f8f9fa"
                  }}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/50?text=No";
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: 0, fontWeight: "bold",
                    fontSize: "14px"
                  }}>
                    {item.productName}
                  </p>
                  <p style={{
                    margin: 0, color: "gray", fontSize: "13px"
                  }}>
                    Qty: {item.quantity} × ₹{item.productPrice?.toLocaleString()}
                  </p>
                </div>
                <p style={{
                  margin: 0, fontWeight: "bold",
                  color: "#28a745"
                }}>
                  ₹{item.itemTotal?.toLocaleString()}
                </p>
              </div>
            ))}
          </div>

          {/* Order Footer */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap", gap: "10px",
            borderTop: "1px solid #eee",
            paddingTop: "12px"
          }}>
            <div>
              <p style={{ margin: 0, fontSize: "14px" }}>
                📍 {order.deliveryAddress}, {order.city}
              </p>
              <p style={{
                margin: 0, fontSize: "13px", color: "gray"
              }}>
                💳 {order.paymentMethod} |
                Expected by {formatDate(order.deliveryDate)}
              </p>
            </div>
            <div style={{
              textAlign: "right",
              display: "flex",
              alignItems: "center",
              gap: "15px"
            }}>
              <div>
                <p style={{
                  margin: 0, fontSize: "13px", color: "gray"
                }}>
                  Total Amount
                </p>
                <p style={{
                  margin: 0, fontSize: "20px",
                  fontWeight: "bold", color: "#B12704"
                }}>
                  ₹{order.finalPrice?.toLocaleString()}
                </p>
              </div>
              {(order.status === "PENDING" ||
                order.status === "CONFIRMED") && (
                <button
                  className="btn-danger"
                  style={{ padding: "8px 16px" }}
                  onClick={() => handleCancel(order.id)}
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Orders;