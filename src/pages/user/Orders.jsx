import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/checkout.css";

function Orders({ token, onBack }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [trackingOrder, setTrackingOrder] = useState(null);
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
      setTrackingOrder(null);
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

  const getStatusStep = (status) => {
    const steps = {
      "PENDING": 0,
      "CONFIRMED": 1,
      "SHIPPED": 2,
      "DELIVERED": 3
    };
    return steps[status] ?? 0;
  };

  // ===== LOADING =====
  if (loading) {
    return (
      <div style={{
        textAlign: "center", padding: "80px", fontFamily: "Arial"
      }}>
        <div style={{ fontSize: "40px", marginBottom: "15px" }}>
          ⏳
        </div>
        <p style={{ fontSize: "18px", color: "gray" }}>
          Loading your orders...
        </p>
      </div>
    );
  }

  // ===== TRACKING PAGE =====
  // This shows when Track button is clicked
  if (trackingOrder !== null) {
    const order = trackingOrder;
    const currentStep = getStatusStep(order.status);
    const progressPercent = [0, 33, 66, 100][currentStep];

    const steps = [
      { label: "Order Placed", icon: "📋", desc: "Order received" },
      { label: "Confirmed", icon: "✅", desc: "Seller confirmed" },
      { label: "Shipped", icon: "🚚", desc: "Out for delivery" },
      { label: "Delivered", icon: "🎉", desc: "Delivered!" }
    ];

    return (
      <div style={{
        maxWidth: "750px", margin: "0 auto", fontFamily: "Arial"
      }}>

        {/* Back Button */}
        <button
          onClick={() => setTrackingOrder(null)}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white", border: "none",
            borderRadius: "5px", cursor: "pointer",
            fontSize: "15px", marginBottom: "20px"
          }}
        >
          ← Back to Orders
        </button>

        {/* Order Header Card */}
        <div style={{
          backgroundColor: "white", borderRadius: "10px",
          padding: "20px", marginBottom: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
          display: "flex", justifyContent: "space-between",
          alignItems: "center", flexWrap: "wrap", gap: "10px"
        }}>
          <div>
            <h2 style={{ margin: "0 0 5px", color: "#1a1a2e" }}>
              Order #{order.id}
            </h2>
            <p style={{ margin: 0, color: "gray", fontSize: "14px" }}>
              Placed on {formatDate(order.orderDate)}
            </p>
          </div>
          <div style={{
            padding: "8px 16px", borderRadius: "20px",
            fontWeight: "bold", fontSize: "14px",
            backgroundColor:
              order.status === "DELIVERED" ? "#d4edda" :
              order.status === "SHIPPED" ? "#d1ecf1" :
              order.status === "CONFIRMED" ? "#cce5ff" :
              order.status === "CANCELLED" ? "#f8d7da" : "#fff3cd",
            color:
              order.status === "DELIVERED" ? "#155724" :
              order.status === "SHIPPED" ? "#0c5460" :
              order.status === "CONFIRMED" ? "#004085" :
              order.status === "CANCELLED" ? "#721c24" : "#856404"
          }}>
            {order.status === "DELIVERED" && "🎉 "}
            {order.status === "SHIPPED" && "🚚 "}
            {order.status === "CONFIRMED" && "✅ "}
            {order.status === "CANCELLED" && "❌ "}
            {order.status === "PENDING" && "⏳ "}
            {order.status}
          </div>
        </div>

        {/* Tracking Steps */}
        {order.status !== "CANCELLED" ? (
          <div style={{
            backgroundColor: "white", borderRadius: "10px",
            padding: "30px", marginBottom: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
          }}>
            <h3 style={{ margin: "0 0 30px", color: "#1a1a2e" }}>
              📍 Live Order Tracking
            </h3>

            {/* Steps with Progress */}
            <div style={{ position: "relative" }}>

              {/* Progress Line Background */}
              <div style={{
                position: "absolute",
                top: "24px",
                left: "12%",
                right: "12%",
                height: "4px",
                backgroundColor: "#e9ecef",
                borderRadius: "2px",
                zIndex: 0
              }}>
                {/* Green Fill */}
                <div style={{
                  height: "100%",
                  width: `${progressPercent}%`,
                  backgroundColor: "#28a745",
                  borderRadius: "2px",
                  transition: "width 1s ease"
                }} />
              </div>

              {/* Step Icons */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                position: "relative", zIndex: 1
              }}>
                {steps.map((step, i) => {
                  const done = i <= currentStep;
                  const active = i === currentStep;
                  return (
                    <div key={i} style={{
                      textAlign: "center", flex: 1
                    }}>
                      {/* Circle */}
                      <div style={{
                        width: "50px", height: "50px",
                        borderRadius: "50%",
                        backgroundColor: done
                          ? "#28a745" : "#e9ecef",
                        margin: "0 auto 12px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "22px",
                        border: active
                          ? "4px solid #28a745" : "4px solid transparent",
                        boxShadow: active
                          ? "0 0 0 4px rgba(40,167,69,0.2)" : "none",
                        transition: "all 0.4s"
                      }}>
                        {done ? step.icon : "⬤"}
                      </div>

                      {/* Label */}
                      <p style={{
                        margin: "0 0 4px",
                        fontSize: "13px",
                        fontWeight: active ? "bold" : "500",
                        color: done ? "#28a745" : "#adb5bd"
                      }}>
                        {step.label}
                      </p>
                      <p style={{
                        margin: 0, fontSize: "11px",
                        color: done ? "#6c757d" : "#ced4da"
                      }}>
                        {done ? step.desc : "Waiting"}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Delivery Date Box */}
            <div style={{
              backgroundColor: "#f0fff4",
              border: "1px solid #c3e6cb",
              padding: "16px 20px", borderRadius: "8px",
              marginTop: "30px",
              display: "flex", alignItems: "center", gap: "15px"
            }}>
              <span style={{ fontSize: "30px" }}>🚚</span>
              <div>
                <p style={{
                  margin: 0, color: "#155724",
                  fontWeight: "bold", fontSize: "15px"
                }}>
                  {order.status === "DELIVERED"
                    ? "✅ Delivered Successfully!"
                    : "Expected Delivery Date"
                  }
                </p>
                <p style={{
                  margin: "4px 0 0",
                  color: "#155724", fontSize: "17px",
                  fontWeight: "bold"
                }}>
                  {formatDate(order.deliveryDate)}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: "#f8d7da",
            border: "1px solid #f5c6cb",
            padding: "20px", borderRadius: "10px",
            textAlign: "center", marginBottom: "20px"
          }}>
            <p style={{
              color: "#721c24", fontSize: "18px",
              fontWeight: "bold", margin: 0
            }}>
              ❌ This order was cancelled
            </p>
          </div>
        )}

        {/* Order Items */}
        <div style={{
          backgroundColor: "white", borderRadius: "10px",
          padding: "20px", marginBottom: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
        }}>
          <h3 style={{ margin: "0 0 15px" }}>🛍️ Items Ordered</h3>
          {order.orderItems?.length > 0 ? (
            order.orderItems.map((item, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "center",
                gap: "12px", padding: "12px 0",
                borderBottom: i < order.orderItems.length - 1
                  ? "1px solid #f5f5f5" : "none"
              }}>
                <img
                  src={item.product?.imageUrl}
                  alt={item.productName}
                  style={{
                    width: "65px", height: "65px",
                    objectFit: "contain",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "6px", padding: "5px"
                  }}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/65?text=No+Img";
                  }}
                />
                <div style={{ flex: 1 }}>
                  <p style={{
                    margin: "0 0 4px",
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
            ))
          ) : (
            <p style={{ color: "gray", textAlign: "center" }}>
              No items found
            </p>
          )}

          {/* Price Summary */}
          <div style={{
            marginTop: "15px", paddingTop: "12px",
            borderTop: "1px solid #eee"
          }}>
            {[
              {
                label: "Item Total",
                value: `₹${order.totalPrice?.toLocaleString()}`,
                color: "#333"
              },
              {
                label: "Discount (10%)",
                value: `− ₹${order.discountAmount?.toLocaleString()}`,
                color: "#28a745"
              },
              {
                label: "Delivery",
                value: "FREE 🎉",
                color: "#28a745"
              }
            ].map((row, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "6px 0",
                fontSize: "14px",
                color: "gray"
              }}>
                <span>{row.label}</span>
                <span style={{ color: row.color }}>
                  {row.value}
                </span>
              </div>
            ))}
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "12px 0 0",
              borderTop: "2px dashed #dee2e6",
              marginTop: "8px",
              fontWeight: "bold", fontSize: "18px"
            }}>
              <span>Total Paid</span>
              <span style={{ color: "#B12704" }}>
                ₹{order.finalPrice?.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Address + Payment Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "15px", marginBottom: "20px"
        }}>
          <div style={{
            backgroundColor: "white", borderRadius: "10px",
            padding: "18px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
          }}>
            <h4 style={{ margin: "0 0 12px", color: "#1a1a2e" }}>
              📍 Delivery Address
            </h4>
            <p style={{ margin: "4px 0", fontSize: "14px" }}>
              {order.deliveryAddress}
            </p>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "gray" }}>
              {order.city}, {order.state}
            </p>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "gray" }}>
              PIN: {order.pincode}
            </p>
            <p style={{ margin: "4px 0", fontSize: "14px", color: "gray" }}>
              📞 {order.phone}
            </p>
          </div>

          <div style={{
            backgroundColor: "white", borderRadius: "10px",
            padding: "18px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
          }}>
            <h4 style={{ margin: "0 0 12px", color: "#1a1a2e" }}>
              💳 Payment Info
            </h4>
            <p style={{ margin: "6px 0", fontSize: "14px" }}>
              Method:{" "}
              <strong>{order.paymentMethod}</strong>
            </p>
            <p style={{ margin: "6px 0", fontSize: "14px" }}>
              Status:{" "}
              <strong style={{
                color: order.paymentStatus === "PAID"
                  ? "#28a745" : "#ff9900"
              }}>
                {order.paymentStatus}
              </strong>
            </p>
            <p style={{
              margin: "6px 0", fontSize: "13px", color: "gray"
            }}>
              Order ID: #{order.id}
            </p>
            <p style={{
              margin: "6px 0", fontSize: "13px", color: "gray"
            }}>
              Date: {formatDate(order.orderDate)}
            </p>
          </div>
        </div>

        {/* Cancel Button */}
        {(order.status === "CONFIRMED" ||
          order.status === "PENDING") && (
          <button
            onClick={() => handleCancel(order.id)}
            style={{
              width: "100%", padding: "14px",
              backgroundColor: "#dc3545",
              color: "white", border: "none",
              borderRadius: "8px", cursor: "pointer",
              fontSize: "16px", fontWeight: "bold"
            }}
          >
            ❌ Cancel This Order
          </button>
        )}
      </div>
    );
  }

  // ===== ORDERS LIST PAGE =====
  return (
    <div style={{
      maxWidth: "900px", margin: "0 auto", fontFamily: "Arial"
    }}>

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        gap: "15px", marginBottom: "25px"
      }}>
        <button
          onClick={onBack}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white", border: "none",
            borderRadius: "5px", cursor: "pointer",
            fontSize: "15px"
          }}
        >
          ← Back
        </button>
        <h2 style={{ margin: 0, color: "#1a1a2e" }}>
          📦 My Orders ({orders.length})
        </h2>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          backgroundColor: "#f8d7da", color: "#721c24",
          padding: "15px", borderRadius: "8px",
          marginBottom: "15px", textAlign: "center"
        }}>
          {error}
          <button
            onClick={fetchOrders}
            style={{
              marginLeft: "10px", padding: "5px 12px",
              backgroundColor: "#dc3545", color: "white",
              border: "none", borderRadius: "4px", cursor: "pointer"
            }}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty */}
      {orders.length === 0 && !error && (
        <div style={{
          textAlign: "center", padding: "60px",
          backgroundColor: "white", borderRadius: "10px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.08)"
        }}>
          <div style={{ fontSize: "70px", marginBottom: "15px" }}>
            📦
          </div>
          <h3 style={{ marginBottom: "10px" }}>
            No orders yet!
          </h3>
          <p style={{ color: "gray", marginBottom: "20px" }}>
            Start shopping to see your orders here
          </p>
          <button
            onClick={onBack}
            style={{
              padding: "12px 30px",
              backgroundColor: "#007bff",
              color: "white", border: "none",
              borderRadius: "5px", cursor: "pointer",
              fontSize: "16px"
            }}
          >
            Start Shopping
          </button>
        </div>
      )}

      {/* Orders */}
      {orders.map((order) => (
        <div
          key={order.id}
          style={{
            backgroundColor: "white",
            borderRadius: "10px",
            padding: "20px",
            marginBottom: "15px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.08)",
            borderLeft: `5px solid ${
              order.status === "DELIVERED" ? "#28a745" :
              order.status === "SHIPPED" ? "#17a2b8" :
              order.status === "CONFIRMED" ? "#007bff" :
              order.status === "CANCELLED" ? "#dc3545" : "#ffc107"
            }`
          }}
        >
          {/* Order Header */}
          <div style={{
            display: "flex", justifyContent: "space-between",
            alignItems: "center", marginBottom: "15px",
            flexWrap: "wrap", gap: "10px"
          }}>
            <div>
              <span style={{
                fontWeight: "bold", color: "#007bff",
                fontSize: "16px"
              }}>
                Order #{order.id}
              </span>
              <span style={{
                color: "gray", fontSize: "13px",
                marginLeft: "10px"
              }}>
                {formatDate(order.orderDate)}
              </span>
            </div>
            <div style={{
              padding: "5px 14px", borderRadius: "15px",
              fontWeight: "bold", fontSize: "13px",
              backgroundColor:
                order.status === "DELIVERED" ? "#d4edda" :
                order.status === "SHIPPED" ? "#d1ecf1" :
                order.status === "CONFIRMED" ? "#cce5ff" :
                order.status === "CANCELLED" ? "#f8d7da" : "#fff3cd",
              color:
                order.status === "DELIVERED" ? "#155724" :
                order.status === "SHIPPED" ? "#0c5460" :
                order.status === "CONFIRMED" ? "#004085" :
                order.status === "CANCELLED" ? "#721c24" : "#856404"
            }}>
              {order.status === "DELIVERED" && "🎉 "}
              {order.status === "SHIPPED" && "🚚 "}
              {order.status === "CONFIRMED" && "✅ "}
              {order.status === "CANCELLED" && "❌ "}
              {order.status === "PENDING" && "⏳ "}
              {order.status}
            </div>
          </div>

          {/* Items Preview */}
          <div style={{ marginBottom: "15px" }}>
            {order.orderItems?.slice(0, 2).map((item, i) => (
              <div key={i} style={{
                display: "flex", gap: "12px",
                alignItems: "center", marginBottom: "8px"
              }}>
                <img
                  src={item.product?.imageUrl}
                  alt={item.productName}
                  style={{
                    width: "50px", height: "50px",
                    objectFit: "contain",
                    backgroundColor: "#f8f9fa",
                    borderRadius: "5px", padding: "3px"
                  }}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/50?text=No";
                  }}
                />
                <div>
                  <p style={{
                    margin: 0, fontWeight: "600",
                    fontSize: "14px"
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
            {(order.orderItems?.length ?? 0) > 2 && (
              <p style={{
                color: "#007bff", fontSize: "13px", margin: 0
              }}>
                +{order.orderItems.length - 2} more items
              </p>
            )}
          </div>

          {/* Footer */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #f0f0f0",
            paddingTop: "15px",
            flexWrap: "wrap", gap: "12px"
          }}>
            <div>
              <p style={{
                margin: 0, fontSize: "13px", color: "gray"
              }}>
                📍 {order.city}, {order.state}
              </p>
              <p style={{
                margin: "3px 0 0", fontSize: "13px", color: "gray"
              }}>
                🚚 By {formatDate(order.deliveryDate)}
              </p>
            </div>

            <div style={{
              display: "flex", gap: "10px",
              alignItems: "center"
            }}>
              <div style={{ textAlign: "right" }}>
                <p style={{
                  margin: 0, fontSize: "20px",
                  fontWeight: "bold", color: "#B12704"
                }}>
                  ₹{order.finalPrice?.toLocaleString()}
                </p>
                <p style={{
                  margin: 0, fontSize: "12px",
                  color: "#28a745"
                }}>
                  Saved ₹{order.discountAmount?.toLocaleString()}
                </p>
              </div>

              {/* TRACK BUTTON */}
              <button
                onClick={() => {
                  setTrackingOrder(order);
                  window.scrollTo(0, 0);
                }}
                style={{
                  padding: "10px 18px",
                  backgroundColor: "#007bff",
                  color: "white", border: "none",
                  borderRadius: "6px", cursor: "pointer",
                  fontSize: "14px", fontWeight: "bold",
                  whiteSpace: "nowrap"
                }}
              >
                📍 Track Order
              </button>

              {(order.status === "CONFIRMED" ||
                order.status === "PENDING") && (
                <button
                  onClick={() => handleCancel(order.id)}
                  style={{
                    padding: "10px 14px",
                    backgroundColor: "#dc3545",
                    color: "white", border: "none",
                    borderRadius: "6px", cursor: "pointer",
                    fontSize: "14px"
                  }}
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