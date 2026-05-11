import { useEffect, useState } from "react";
import {
  getCartItems,
  updateCartQuantity,
  removeFromCart,
  clearCart
} from "../../services/cartService";
import "../../styles/cart.css";

function Cart({ token, onBack, onCartCountChange, onCheckout }) {

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchCart();
  }, []);

  // ===== Fetch Cart =====
  const fetchCart = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await getCartItems(token);
      setItems(data);
    } catch (err) {
      setError("Failed to load cart! Please try again.");
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ===== Update Quantity =====
  const handleQuantityChange = async (cartId, newQuantity) => {
    if (newQuantity < 1) {
      alert("Minimum quantity is 1!");
      return;
    }
    if (newQuantity > 10) {
      alert("Maximum 10 items allowed!");
      return;
    }
    try {
      setUpdatingId(cartId);
      await updateCartQuantity(cartId, newQuantity, token);
      setItems(items.map(item =>
        item.id === cartId
          ? { ...item, quantity: newQuantity }
          : item
      ));
      if (onCartCountChange) onCartCountChange();
    } catch (err) {
      alert(err.response?.data || "Failed to update!");
    } finally {
      setUpdatingId(null);
    }
  };

  // ===== Remove Item =====
  const handleRemove = async (cartId, productName) => {
    if (!window.confirm(`Remove "${productName}" from cart?`)) return;
    try {
      setUpdatingId(cartId);
      await removeFromCart(cartId, token);
      setItems(items.filter(item => item.id !== cartId));
      if (onCartCountChange) onCartCountChange();
    } catch (err) {
      alert("Failed to remove item!");
    } finally {
      setUpdatingId(null);
    }
  };

  // ===== Clear Cart =====
  const handleClearCart = async () => {
    if (items.length === 0) {
      alert("Cart is already empty!");
      return;
    }
    if (!window.confirm("Clear entire cart?")) return;
    try {
      await clearCart(token);
      setItems([]);
      if (onCartCountChange) onCartCountChange();
    } catch (err) {
      alert("Failed to clear cart!");
    }
  };

  // ===== CHECKOUT BUTTON HANDLER =====
  const handleCheckout = () => {
    if (items.length === 0) {
      alert("Your cart is empty! Add items first.");
      return;
    }
    // Pass items to parent (UserDashboard)
    if (onCheckout) {
      onCheckout(items);
    } else {
      alert("Checkout not available!");
    }
  };

  // ===== Calculate totals =====
  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity, 0
  );
  const totalPrice = items.reduce(
    (sum, item) =>
      sum + (item.product?.price * item.quantity), 0
  );
  const originalTotal = Math.round(totalPrice * 1.1);
  const savedAmount = originalTotal - totalPrice;
  const delivery = totalPrice > 499 ? 0 : 49;
  const finalPrice = totalPrice - (totalPrice * 0.10) + delivery;

  // ===== LOADING =====
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "80px" }}>
        <p style={{ fontSize: "20px", color: "gray" }}>
          ⏳ Loading your cart...
        </p>
      </div>
    );
  }

  return (
    <div className="cart-container">

      {/* ===== HEADER ===== */}
      <div className="cart-header">
        <div>
          <h2>🛒 Shopping Cart</h2>
          <p style={{
            color: "gray", fontSize: "14px", margin: 0
          }}>
            {totalItems} item{totalItems !== 1 ? "s" : ""} in cart
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {items.length > 0 && (
            <button
              className="btn-danger"
              onClick={handleClearCart}
            >
              🗑️ Clear All
            </button>
          )}
          <button className="btn-secondary" onClick={onBack}>
            ← Continue Shopping
          </button>
        </div>
      </div>

      {/* ===== ERROR ===== */}
      {error && (
        <div style={{
          backgroundColor: "#f8d7da", color: "#721c24",
          padding: "12px", borderRadius: "5px",
          marginBottom: "15px"
        }}>
          ⚠️ {error}
        </div>
      )}

      {/* ===== EMPTY CART ===== */}
      {items.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: "70px", marginBottom: "15px" }}>
            🛒
          </div>
          <h3 style={{ marginBottom: "10px" }}>
            Your cart is empty!
          </h3>
          <p style={{ color: "gray", marginBottom: "20px" }}>
            Add items to get started
          </p>
          <button
            className="btn-primary"
            style={{ padding: "12px 30px" }}
            onClick={onBack}
          >
            Browse Products
          </button>
        </div>
      )}

      {/* ===== CART CONTENT ===== */}
      {items.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 340px",
          gap: "20px",
          alignItems: "start"
        }}>

          {/* LEFT - Items List */}
          <div>
            {items.map((item) => (
              <div
                key={item.id}
                className="cart-item"
                style={{
                  opacity: updatingId === item.id ? 0.5 : 1,
                  transition: "opacity 0.2s",
                  pointerEvents: updatingId === item.id
                    ? "none" : "auto"
                }}
              >
                {/* Image */}
                <img
                  src={item.product?.imageUrl}
                  alt={item.product?.name}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/100?text=No+Image";
                  }}
                />

                {/* Info */}
                <div className="cart-item-info">
                  <h4>{item.product?.name}</h4>
                  <p style={{
                    color: "gray", fontSize: "13px", margin: "3px 0"
                  }}>
                    {item.product?.category}
                  </p>
                  <p style={{
                    color: "#28a745", fontSize: "14px", margin: "3px 0"
                  }}>
                    Unit Price:
                    ₹{item.product?.price?.toLocaleString()}
                  </p>

                  {/* Quantity Controls */}
                  <div style={{ marginTop: "12px" }}>
                    <span style={{
                      fontSize: "13px", fontWeight: "bold",
                      marginRight: "8px"
                    }}>
                      Qty:
                    </span>
                    <div style={{
                      display: "inline-flex",
                      alignItems: "center",
                      border: "1px solid #ddd",
                      borderRadius: "5px",
                      overflow: "hidden"
                    }}>
                      {/* Minus */}
                      <button
                        onClick={() => handleQuantityChange(
                          item.id, item.quantity - 1
                        )}
                        disabled={item.quantity <= 1}
                        style={{
                          width: "36px", height: "36px",
                          border: "none",
                          backgroundColor: item.quantity <= 1
                            ? "#f5f5f5" : "#f8f9fa",
                          cursor: item.quantity <= 1
                            ? "not-allowed" : "pointer",
                          fontSize: "20px", fontWeight: "bold",
                          color: item.quantity <= 1 ? "#ccc" : "#333"
                        }}
                      >
                        −
                      </button>

                      {/* Count */}
                      <span style={{
                        width: "44px", textAlign: "center",
                        fontSize: "16px", fontWeight: "bold",
                        padding: "6px 0",
                        borderLeft: "1px solid #ddd",
                        borderRight: "1px solid #ddd",
                        backgroundColor: "white"
                      }}>
                        {updatingId === item.id
                          ? "..." : item.quantity}
                      </span>

                      {/* Plus */}
                      <button
                        onClick={() => handleQuantityChange(
                          item.id, item.quantity + 1
                        )}
                        disabled={item.quantity >= 10}
                        style={{
                          width: "36px", height: "36px",
                          border: "none",
                          backgroundColor: item.quantity >= 10
                            ? "#f5f5f5" : "#f8f9fa",
                          cursor: item.quantity >= 10
                            ? "not-allowed" : "pointer",
                          fontSize: "20px", fontWeight: "bold",
                          color: item.quantity >= 10 ? "#ccc" : "#333"
                        }}
                      >
                        +
                      </button>
                    </div>

                    {item.quantity >= 10 && (
                      <span style={{
                        fontSize: "12px", color: "orange",
                        marginLeft: "8px"
                      }}>
                        ⚠️ Max limit
                      </span>
                    )}
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(
                      item.id, item.product?.name
                    )}
                    style={{
                      marginTop: "10px",
                      background: "none", border: "none",
                      color: "#dc3545", cursor: "pointer",
                      fontSize: "14px", padding: 0,
                      textDecoration: "underline"
                    }}
                  >
                    🗑️ Remove
                  </button>
                </div>

                {/* Item Total */}
                <div style={{
                  textAlign: "right", minWidth: "130px"
                }}>
                  <p style={{
                    color: "#B12704", fontWeight: "bold",
                    fontSize: "20px", margin: 0
                  }}>
                    ₹{(item.product?.price * item.quantity)
                      .toLocaleString()}
                  </p>
                  {item.quantity > 1 && (
                    <p style={{
                      color: "gray", fontSize: "12px",
                      margin: "4px 0 0"
                    }}>
                      {item.quantity} ×
                      ₹{item.product?.price?.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT - Order Summary */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px", padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            position: "sticky", top: "80px"
          }}>
            <h3 style={{
              marginBottom: "20px", paddingBottom: "10px",
              borderBottom: "1px solid #eee"
            }}>
              📋 Order Summary
            </h3>

            <div style={{
              display: "flex", flexDirection: "column",
              gap: "14px"
            }}>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "15px"
              }}>
                <span style={{ color: "gray" }}>
                  Price ({totalItems} items)
                </span>
                <span>₹{originalTotal.toLocaleString()}</span>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "15px", color: "#28a745"
              }}>
                <span>Discount (10%)</span>
                <span>
                  − ₹{savedAmount.toLocaleString()}
                </span>
              </div>

              <div style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "15px"
              }}>
                <span style={{ color: "gray" }}>Delivery</span>
                <span style={{
                  color: delivery === 0 ? "#28a745" : "#333"
                }}>
                  {delivery === 0 ? "FREE 🎉" : `₹${delivery}`}
                </span>
              </div>

              <div style={{
                borderTop: "2px dashed #eee",
                paddingTop: "14px",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold", fontSize: "18px"
              }}>
                <span>Total</span>
                <span style={{ color: "#B12704" }}>
                  ₹{Math.round(finalPrice).toLocaleString()}
                </span>
              </div>

              <div style={{
                backgroundColor: "#d4edda",
                padding: "10px", borderRadius: "5px",
                textAlign: "center"
              }}>
                <p style={{
                  color: "#155724", fontWeight: "bold",
                  margin: 0, fontSize: "14px"
                }}>
                  🎉 You save ₹{savedAmount.toLocaleString()}!
                </p>
              </div>
            </div>

            {/* ===== CHECKOUT BUTTON ===== */}
            <button
              onClick={handleCheckout}
              style={{
                width: "100%", padding: "14px",
                backgroundColor: "#ff9900",
                color: "#111", border: "none",
                borderRadius: "8px", fontSize: "18px",
                fontWeight: "bold", cursor: "pointer",
                marginTop: "20px",
                transition: "transform 0.2s, box-shadow 0.2s"
              }}
              onMouseOver={(e) => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow =
                  "0 5px 15px rgba(255,153,0,0.4)";
              }}
              onMouseOut={(e) => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }}
            >
              ⚡ Proceed to Checkout
            </button>

            <button
              className="btn-primary"
              style={{
                width: "100%", padding: "12px",
                marginTop: "10px", fontSize: "14px"
              }}
              onClick={onBack}
            >
              🛒 Continue Shopping
            </button>

            {/* Trust Badges */}
            <div style={{
              marginTop: "15px", padding: "12px",
              backgroundColor: "#f8f9fa",
              borderRadius: "5px", textAlign: "center"
            }}>
              <p style={{
                fontSize: "12px", color: "gray", margin: "3px 0"
              }}>
                🔒 Safe & Secure Payments
              </p>
              <p style={{
                fontSize: "12px", color: "gray", margin: "3px 0"
              }}>
                ✅ 100% Authentic Products
              </p>
              <p style={{
                fontSize: "12px", color: "gray", margin: "3px 0"
              }}>
                🔄 Easy 7-Day Returns
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;