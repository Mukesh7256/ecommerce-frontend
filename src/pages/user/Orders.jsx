import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/checkout.css";

function Orders({ token, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [view, setView] = useState("list");

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
      alert("✅ Order cancelled!");
      fetchOrders();
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

  // ===== ORDER TRACKING VIEW =====
  if (view === "tracking" && selectedOrder) {
    const steps = [
      {
        label: "Order Placed",
        icon: "📋",
        status: "CONFIRMED",
        desc: "Your order has been placed"
      },
      {
        label: "Confirmed",
        icon: "✅",
        status: "CONFIRMED",
        desc: "Order confirmed by seller"
      },
      {
        label: "Shipped",
        icon: "🚚",
        status: "SHIPPED",
        desc: "Order is on the way"
      },
      {
        label: "Delivered",
        icon: "🎉",
        status: "DELIVERED",
        desc: "Order delivered successfully"
      }
    ];

    const statusOrder = [
      "PENDING", "CONFIRMED", "SHIPPED", "DELIVERED"
    ];
    const currentIndex = statusOrder.indexOf(
      selectedOrder.status
    );

    return (
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>

        {/* Back Button */}
        <button
          className="btn-secondary"
          onClick={() => setView("list")}
          style={{ marginBottom: "20px" }}
        >
          ← Back to Orders
        </button>

        {/* Order Info Card */}
        <div style={{
          backgroundColor: "white", borderRadius: "8px",
          padding: "20px", marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", flexWrap: "wrap", gap: "10px"
          }}>
            <div>
              <h3 style={{ margin: 0 }}>
                Order #{selectedOrder.id}
              </h3>
              <p style={{
                color: "gray", fontSize: "14px", margin: "5px 0 0"
              }}>
                Placed on {formatDate(selectedOrder.orderDate)}
              </p>
            </div>
            <span className={`status-badge status-${selectedOrder.status}`}>
              {selectedOrder.status}
            </span>
          </div>
        </div>

        {/* ===== TRACKING STEPS ===== */}
        <div style={{
          backgroundColor: "white", borderRadius: "8px",
          padding: "30px", marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <h3 style={{ marginBottom: "30px" }}>
            📍 Track Your Order
          </h3>

          <div style={{ position: "relative" }}>

            {/* Progress Line */}
            <div style={{
              position: "absolute",
              top: "25px",
              left: "25px",
              right: "25px",
              height: "3px",
              backgroundColor: "#e0e0e0",
              zIndex: 0
            }}>
              <div style={{
                height: "100%",
                backgroundColor: "#28a745",
                width: currentIndex === 0 ? "0%" :
                       currentIndex === 1 ? "33%" :
                       currentIndex === 2 ? "66%" : "100%",
                transition: "width 0.5s ease"
              }} />
            </div>

            {/* Steps */}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              position: "relative", zIndex: 1
            }}>
              {steps.map((step, index) => {
                const isDone = index <= currentIndex;
                const isCurrent = index === currentIndex;

                return (
                  <div key={index} style={{
                    textAlign: "center",
                    flex: 1
                  }}>
                    {/* Circle */}
                    <div style={{
                      width: "50px", height: "50px",
                      borderRadius: "50%",
                      backgroundColor: isDone ? "#28a745" : "#e0e0e0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      margin: "0 auto 10px",
                      fontSize: "20px",
                      border: isCurrent
                        ? "3px solid #28a745" : "none",
                      boxShadow: isCurrent
                        ? "0 0 0 4px rgba(40,167,69,0.2)" : "none",
                      transition: "all 0.3s"
                    }}>
                      {isDone ? step.icon : "⏳"}
                    </div>

                    {/* Label */}
                    <p style={{
                      margin: 0,
                      fontWeight: isCurrent ? "bold" : "normal",
                      color: isDone ? "#28a745" : "gray",
                      fontSize: "13px"
                    }}>
                      {step.label}
                    </p>
                    <p style={{
                      margin: "3px 0 0",
                      fontSize: "11px",
                      color: "gray"
                    }}>
                      {isDone ? step.desc : "Pending"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Expected Delivery */}
          <div style={{
            backgroundColor: "#f0fff4", padding: "15px",
            borderRadius: "8px", marginTop: "25px",
            display: "flex", alignItems: "center", gap: "10px"
          }}>
            <span style={{ fontSize: "24px" }}>🚚</span>
            <div>
              <p style={{
                margin: 0, fontWeight: "bold", color: "#155724"
              }}>
                Expected Delivery
              </p>
              <p style={{
                margin: 0, color: "#155724", fontSize: "16px"
              }}>
                {formatDate(selectedOrder.deliveryDate)}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div style={{
          backgroundColor: "white", borderRadius: "8px",
          padding: "20px", marginBottom: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <h3 style={{ marginBottom: "15px" }}>
            🛍️ Order Items
          </h3>
          {selectedOrder.orderItems?.map((item, i) => (
            <div key={i} style={{
              display: "flex", alignItems: "center",
              gap: "12px", padding: "10px 0",
              borderBottom: "1px solid #f0f0f0"
            }}>
              <img
                src={item.product?.imageUrl}
                alt={item.productName}
                style={{
                  width: "60px", height: "60px",
                  objectFit: "contain",
                  borderRadius: "5px",
                  backgroundColor: "#f8f9fa"
                }}
                onError={(e) => {
                  e.target.src =
                    "https://via.placeholder.com/60?text=No";
                }}
              />
              <div style={{ flex: 1 }}>
                <p style={{
                  margin: 0, fontWeight: "bold"
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
                color: "#28a745"
              }}>
                ₹{item.itemTotal?.toLocaleString()}
              </p>
            </div>
          ))}

          {/* Price Summary */}
          <div style={{ marginTop: "15px" }}>
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "8px 0", color: "gray"
            }}>
              <span>Subtotal</span>
              <span>
                ₹{selectedOrder.totalPrice?.toLocaleString()}
              </span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "8px 0", color: "#28a745"
            }}>
              <span>Discount</span>
              <span>
                − ₹{selectedOrder.discountAmount?.toLocaleString()}
              </span>
            </div>
            <div style={{
              display: "flex", justifyContent: "space-between",
              padding: "10px 0", fontWeight: "bold",
              fontSize: "18px",
              borderTop: "2px dashed #eee", marginTop: "5px"
            }}>
              <span>Total Paid</span>
              <span style={{ color: "#B12704" }}>
                ₹{selectedOrder.finalPrice?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Address */}
        <div style={{
          backgroundColor: "white", borderRadius: "8px",
          padding: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.08)"
        }}>
          <h3 style={{ marginBottom: "15px" }}>
            📍 Delivery Address
          </h3>
          <p style={{ margin: "5px 0" }}>
            {selectedOrder.deliveryAddress}
          </p>
          <p style={{ margin: "5px 0", color: "gray" }}>
            {selectedOrder.city}, {selectedOrder.state} -
            {selectedOrder.pincode}
          </p>
          <p style={{ margin: "5px 0", color: "gray" }}>
            📞 {selectedOrder.phone}
          </p>
          <p style={{ margin: "10px 0 0", color: "#007bff" }}>
            💳 Payment: {selectedOrder.paymentMethod} |
            Status: {selectedOrder.paymentStatus}
          </p>
        </div>

        {/* Cancel Button */}
        {(selectedOrder.status === "CONFIRMED" ||
          selectedOrder.status === "PENDING") && (
          <button
            className="btn-danger"
            style={{
              width: "100%", padding: "12px",
              marginTop: "15px", fontSize: "16px"
            }}
            onClick={() => handleCancel(selectedOrder.id)}
          >
            ❌ Cancel Order
          </button>
        )}
      </div>
    );
  }

  // ===== ORDERS LIST VIEW =====
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
        <h2 style={{ margin: 0 }}>
          📦 My Orders ({orders.length})
        </h2>
      </div>

      {/* No Orders */}
      {orders.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: "60px", marginBottom: "15px" }}>
            📦
          </div>
          <h3>No orders yet!</h3>
          <p style={{ color: "gray", marginBottom: "20px" }}>
            Start shopping to see orders here
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

          {/* Items Preview */}
          <div style={{ marginBottom: "15px" }}>
            {order.orderItems?.slice(0, 2).map((item, i) => (
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
                <div>
                  <p style={{
                    margin: 0, fontWeight: "bold",
                    fontSize: "14px"
                  }}>
                    {item.productName}
                  </p>
                  <p style={{
                    margin: 0, color: "gray", fontSize: "13px"
                  }}>
                    Qty: {item.quantity} |
                    ₹{item.itemTotal?.toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {order.orderItems?.length > 2 && (
              <p style={{ color: "gray", fontSize: "13px" }}>
                +{order.orderItems.length - 2} more items
              </p>
            )}
          </div>

          {/* Footer */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #eee",
            paddingTop: "12px", flexWrap: "wrap", gap: "10px"
          }}>
            <div>
              <p style={{ margin: 0, fontSize: "13px", color: "gray" }}>
                📍 {order.city}, {order.state}
              </p>
              <p style={{ margin: 0, fontSize: "13px", color: "gray" }}>
                Expected: {formatDate(order.deliveryDate)}
              </p>
            </div>

            <div style={{
              display: "flex", alignItems: "center", gap: "10px"
            }}>
              <div style={{ textAlign: "right" }}>
                <p style={{
                  margin: 0, fontSize: "20px",
                  fontWeight: "bold", color: "#B12704"
                }}>
                  ₹{order.finalPrice?.toLocaleString()}
                </p>
                <p style={{
                  margin: 0, fontSize: "12px", color: "#28a745"
                }}>
                  Saved ₹{order.discountAmount?.toLocaleString()}
                </p>
              </div>

              {/* Track Order Button */}
              <button
                className="btn-primary"
                style={{ padding: "8px 16px" }}
                onClick={() => {
                  setSelectedOrder(order);
                  setView("tracking");
                }}
              >
                📍 Track Order
              </button>

              {(order.status === "CONFIRMED" ||
                order.status === "PENDING") && (
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