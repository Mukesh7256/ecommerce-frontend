import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/checkout.css";

function Orders({ token, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [view, setView] = useState("list");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        "http://localhost:8080/api/orders/my-orders",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOrders(res.data);
    } catch (err) {
      setError("Failed to load orders!");
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
      alert("✅ Order cancelled!");
      if (view === "tracking") {
        setView("list");
      }
      fetchOrders();
    } catch (err) {
      alert(err.response?.data || "Cancel failed!");
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric"
      });
    } catch {
      return "N/A";
    }
  };

  // ===== LOADING =====
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px" }}>
        <p style={{ fontSize: "20px", color: "gray" }}>
          ⏳ Loading orders...
        </p>
      </div>
    );
  }

  // ===== ERROR =====
  if (error) {
    return (
      <div style={{ textAlign: "center", padding: "80px" }}>
        <p style={{ color: "red", fontSize: "16px" }}>{error}</p>
        <button className="btn-primary" onClick={fetchOrders}>
          Retry
        </button>
      </div>
    );
  }

  // ===== TRACKING VIEW =====
  if (view === "tracking" && selectedOrder) {

    const allSteps = [
      {
        label: "Order Placed",
        icon: "📋",
        desc: "Your order has been received",
        statuses: ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"]
      },
      {
        label: "Confirmed",
        icon: "✅",
        desc: "Seller confirmed your order",
        statuses: ["CONFIRMED", "SHIPPED", "DELIVERED"]
      },
      {
        label: "Shipped",
        icon: "🚚",
        desc: "Order is out for delivery",
        statuses: ["SHIPPED", "DELIVERED"]
      },
      {
        label: "Delivered",
        icon: "🎉",
        desc: "Order delivered successfully",
        statuses: ["DELIVERED"]
      }
    ];

    const getStepProgress = () => {
      const status = selectedOrder.status;
      if (status === "PENDING") return 0;
      if (status === "CONFIRMED") return 1;
      if (status === "SHIPPED") return 2;
      if (status === "DELIVERED") return 3;
      return 0;
    };

    const currentStep = getStepProgress();
    const progressWidth = ["0%", "33%", "66%", "100%"][currentStep];

    return (
      <div style={{ maxWidth: "750px", margin: "0 auto" }}>

        {/* Back */}
        <button
          className="btn-secondary"
          onClick={() => {
            setView("list");
            setSelectedOrder(null);
          }}
          style={{ marginBottom: "20px" }}
        >
          ← Back to Orders
        </button>

        {/* Order Header */}
        <div style={{
          backgroundColor: "white", borderRadius: "8px",
          padding: "20px", marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: "10px"
        }}>
          <div>
            <h3 style={{ margin: "0 0 5px" }}>
              📦 Order #{selectedOrder.id}
            </h3>
            <p style={{ margin: 0, color: "gray", fontSize: "14px" }}>
              Placed on {formatDate(selectedOrder.orderDate)}
            </p>
          </div>
          <span className={`status-badge status-${selectedOrder.status}`}
            style={{ fontSize: "15px", padding: "6px 14px" }}>
            {selectedOrder.status === "CONFIRMED" && "✅ "}
            {selectedOrder.status === "SHIPPED" && "🚚 "}
            {selectedOrder.status === "DELIVERED" && "🎉 "}
            {selectedOrder.status === "CANCELLED" && "❌ "}
            {selectedOrder.status === "PENDING" && "⏳ "}
            {selectedOrder.status}
          </span>
        </div>

        {/* Tracking Steps */}
        {selectedOrder.status !== "CANCELLED" ? (
          <div style={{
            backgroundColor: "white", borderRadius: "8px",
            padding: "30px 25px", marginBottom: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <h3 style={{ margin: "0 0 35px" }}>
              📍 Live Tracking
            </h3>

            {/* Progress Bar + Steps */}
            <div style={{ position: "relative", padding: "0 20px" }}>

              {/* Background Line */}
              <div style={{
                position: "absolute",
                top: "24px",
                left: "calc(20px + 24px)",
                right: "calc(20px + 24px)",
                height: "4px",
                backgroundColor: "#e0e0e0",
                borderRadius: "2px"
              }}>
                {/* Progress Fill */}
                <div style={{
                  height: "100%",
                  width: progressWidth,
                  backgroundColor: "#28a745",
                  borderRadius: "2px",
                  transition: "width 1s ease"
                }} />
              </div>

              {/* Step Circles */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                position: "relative"
              }}>
                {allSteps.map((step, index) => {
                  const done = index <= currentStep;
                  const current = index === currentStep;
                  return (
                    <div key={index} style={{
                      textAlign: "center", flex: 1
                    }}>
                      <div style={{
                        width: "48px", height: "48px",
                        borderRadius: "50%",
                        backgroundColor: done ? "#28a745" : "#e9ecef",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 12px",
                        fontSize: "20px",
                        border: current
                          ? "3px solid #28a745" : "3px solid transparent",
                        boxShadow: current
                          ? "0 0 0 4px rgba(40,167,69,0.2)" : "none",
                        transition: "all 0.3s"
                      }}>
                        {done ? step.icon : "○"}
                      </div>
                      <p style={{
                        margin: 0, fontSize: "13px",
                        fontWeight: current ? "bold" : "normal",
                        color: done ? "#28a745" : "#aaa"
                      }}>
                        {step.label}
                      </p>
                      <p style={{
                        margin: "3px 0 0",
                        fontSize: "11px",
                        color: done ? "gray" : "#ccc"
                      }}>
                        {done ? step.desc : "Pending"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Info */}
            <div style={{
              backgroundColor: "#f0fff4", padding: "15px 20px",
              borderRadius: "8px", marginTop: "30px",
              display: "flex", alignItems: "center", gap: "12px"
            }}>
              <span style={{ fontSize: "28px" }}>🚚</span>
              <div>
                <p style={{
                  margin: 0, fontWeight: "bold",
                  color: "#155724", fontSize: "15px"
                }}>
                  {selectedOrder.status === "DELIVERED"
                    ? "Order Delivered! 🎉"
                    : "Expected Delivery"
                  }
                </p>
                <p style={{
                  margin: "3px 0 0", color: "#155724",
                  fontSize: "16px", fontWeight: "bold"
                }}>
                  {formatDate(selectedOrder.deliveryDate)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: "#f8d7da", padding: "20px",
            borderRadius: "8px", marginBottom: "20px",
            textAlign: "center"
          }}>
            <p style={{
              color: "#721c24", fontSize: "18px",
              fontWeight: "bold", margin: 0
            }}>
              ❌ This order has been cancelled
            </p>
          </div>
        )}

        {/* Order Items */}
        <div style={{
          backgroundColor: "white", borderRadius: "8px",
          padding: "20px", marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <h3 style={{ margin: "0 0 15px" }}>🛍️ Items Ordered</h3>
          {selectedOrder.orderItems?.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center",
              gap: "12px", padding: "12px 0",
              borderBottom: "1px solid #f5f5f5"
            }}>
              <img
                src={item.product?.imageUrl}
                alt={item.productName}
                style={{
                  width: "65px", height: "65px",
                  objectFit: "contain",
                  borderRadius: "6px",
                  backgroundColor: "#f8f9fa",
                  padding: "4px"
                }}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/65?text=No+Img";
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: "0 0 3px",
                  fontWeight: "bold", fontSize: "15px"
                }}>
                  {item.productName}
                </p>
                <p style={{
                  margin: 0, color: "gray", fontSize: "13px"
                }}>
                  Qty: {item.quantity} ×
                  ₹{item.productPrice?.toLocaleString()}
                </p>
              </div>
              <p style={{
                margin: 0, fontWeight: "bold",
                color: "#28a745", fontSize: "16px"
              }}>
                ₹{item.itemTotal?.toLocaleString()}
              </p>
            </div>
          ))}

          {/* Price Breakdown */}
          <div style={{ marginTop: "15px", paddingTop: "10px" }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "6px 0", color: "gray", fontSize: "14px"
            }}>
              <span>Item Total</span>
              <span>₹{selectedOrder.totalPrice?.toLocaleString()}</span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "6px 0", color: "#28a745", fontSize: "14px"
            }}>
              <span>Discount (10%)</span>
              <span>
                − ₹{selectedOrder.discountAmount?.toLocaleString()}
              </span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "6px 0", color: "gray", fontSize: "14px"
            }}>
              <span>Delivery</span>
              <span style={{ color: "#28a745" }}>FREE</span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "12px 0 0",
              borderTop: "2px dashed #eee",
              marginTop: "6px",
              fontWeight: "bold", fontSize: "18px"
            }}>
              <span>Amount Paid</span>
              <span style={{ color: "#B12704" }}>
                ₹{selectedOrder.finalPrice?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Address + Payment */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px", marginBottom: "20px"
        }}>
          <div style={{
            backgroundColor: "white", borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <h4 style={{ margin: "0 0 10px" }}>📍 Delivery Address</h4>
            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              {selectedOrder.deliveryAddress}
            </p>
            <p style={{ margin: "4px 0", color: "gray", fontSize: "14px" }}>
              {selectedOrder.city}, {selectedOrder.state}
            </p>
            <p style={{ margin: "4px 0", color: "gray", fontSize: "14px" }}>
              PIN: {selectedOrder.pincode}
            </p>
            <p style={{ margin: "4px 0", color: "gray", fontSize: "14px" }}>
              📞 {selectedOrder.phone}
            </p>
          </div>

          <div style={{
            backgroundColor: "white", borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
          }}>
            <h4 style={{ margin: "0 0 10px" }}>💳 Payment Info</h4>
            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              Method: <strong>{selectedOrder.paymentMethod}</strong>
            </p>
            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              Status:{" "}
              <strong style={{
                color: selectedOrder.paymentStatus === "PAID"
                  ? "#28a745" : "#ff9900"
              }}>
                {selectedOrder.paymentStatus}
              </strong>
            </p>
            <p style={{ margin: "4px 0", color: "gray", fontSize: "13px" }}>
              Order Date: {formatDate(selectedOrder.orderDate)}
            </p>
          </div>
        </div>

        {/* Cancel Button */}
        {(selectedOrder.status === "CONFIRMED" ||
          selectedOrder.status === "PENDING") && (
          <button
            className="btn-danger"
            style={{
              width: "100%", padding: "13px",
              fontSize: "16px"
            }}
            onClick={() => handleCancel(selectedOrder.id)}
          >
            ❌ Cancel This Order
          </button>
        )}
      </div>
    );
  }

  // ===== ORDERS LIST =====
  return (
    <div className="orders-list">
      <div style={{
        display: "flex", alignItems: "center",
        gap: "15px", marginBottom: "25px"
      }}>
        <button className="btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <h2 style={{ margin: 0 }}>
          📦 My Orders ({orders.length})
        </h2>
      </div>

      {orders.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: "60px", marginBottom: "15px" }}>
            📦
          </div>
          <h3>No orders yet!</h3>
          <p style={{ color: "gray", marginBottom: "20px" }}>
            Shop now to see your orders here
          </p>
          <button className="btn-primary" onClick={onBack}>
            Start Shopping
          </button>
        </div>
      )}

      {orders.map((order) => (
        <div
          key={order.id}
          className={`order-card ${order.status}`}
        >
          <div className="order-header">
            <div>
              <span className="order-id">Order #{order.id}</span>
              <span style={{
                color: "gray", fontSize: "13px", marginLeft: "10px"
              }}>
                {formatDate(order.orderDate)}
              </span>
            </div>
            <span className={`status-badge status-${order.status}`}>
              {order.status === "CONFIRMED" && "✅ "}
              {order.status === "SHIPPED" && "🚚 "}
              {order.status === "DELIVERED" && "🎉 "}
              {order.status === "CANCELLED" && "❌ "}
              {order.status === "PENDING" && "⏳ "}
              {order.status}
            </span>
          </div>

          {/* Items preview */}
          <div style={{ marginBottom: "12px" }}>
            {order.orderItems?.slice(0, 2).map((item, i) => (
              <div key={i} style={{
                display: "flex", gap: "10px",
                marginBottom: "8px", alignItems: "center"
              }}>
                <img
                  src={item.product?.imageUrl}
                  alt={item.productName}
                  style={{
                    width: "45px", height: "45px",
                    objectFit: "contain",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "4px"
                  }}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/45?text=No";
                  }}
                />
                <div>
                  <p style={{
                    margin: 0, fontWeight: "bold", fontSize: "14px"
                  }}>
                    {item.productName}
                  </p>
                  <p style={{
                    margin: 0, color: "gray", fontSize: "12px"
                  }}>
                    Qty: {item.quantity} |
                    ₹{item.itemTotal?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {order.orderItems?.length > 2 && (
              <p style={{ color: "#007bff", fontSize: "13px", margin: 0 }}>
                +{order.orderItems.length - 2} more items
              </p>
            )}
          </div>

          {/* Footer */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #eee", paddingTop: "12px",
            flexWrap: "wrap", gap: "10px"
          }}>
            <div>
              <p style={{ margin: 0, fontSize: "13px", color: "gray" }}>
                📍 {order.city} | 🚚 By {formatDate(order.deliveryDate)}
              </p>
              <p style={{ margin: "3px 0 0", fontSize: "13px" }}>
                💳 {order.paymentMethod} |
                <span style={{
                  color: order.paymentStatus === "PAID"
                    ? "#28a745" : "#ff9900",
                  fontWeight: "bold"
                }}>
                  {" "}{order.paymentStatus}
                </span>
              </p>
            </div>

            <div style={{
              display: "flex", gap: "10px",
              alignItems: "center"
            }}>
              <div style={{ textAlign: "right" }}>
                <p style={{
                  margin: 0, fontWeight: "bold",
                  fontSize: "18px", color: "#B12704"
                }}>
                  ₹{order.finalPrice?.toLocaleString()}
                </p>
                <p style={{
                  margin: 0, fontSize: "12px", color: "#28a745"
                }}>
                  Saved ₹{order.discountAmount?.toLocaleString()}
                </p>
              </div>

              <button
                className="btn-primary"
                onClick={() => {
                  setSelectedOrder(order);
                  setView("tracking");
                }}
              >
                📍 Track
              </button>

              {(order.status === "CONFIRMED" ||
                order.status === "PENDING") && (
                <button
                  className="btn-danger"
                  style={{ padding: "8px 14px" }}
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