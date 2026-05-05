import { useEffect, useState } from "react";
import {
  getCartItems,
  updateCartQuantity,
  removeFromCart,
  clearCart
} from "../../services/cartService";
import "../../styles/cart.css";

function Cart({ token, onBack, onCartCountChange }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    fetchCart();
  }, []);

  // ===== T036: Fetch Cart =====
  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCartItems(token);
      setItems(data);
    } catch (err) {
      console.log("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };

  // ===== T037: Update Quantity =====
  const handleQuantityChange = async (cartId, newQuantity) => {
    if (newQuantity < 1) return; // Don't allow 0
    try {
      setUpdatingId(cartId); // Show loading on this item
      await updateCartQuantity(cartId, newQuantity, token);
      // Update locally without refetching
      setItems(items.map(item =>
        item.id === cartId
          ? { ...item, quantity: newQuantity }
          : item
      ));
      if (onCartCountChange) onCartCountChange();
    } catch (err) {
      alert("Failed to update quantity!");
    } finally {
      setUpdatingId(null);
    }
  };

  // ===== T038: Remove Item =====
  const handleRemove = async (cartId) => {
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

  // Clear entire cart
  const handleClearCart = async () => {
    if (!window.confirm(
      "Are you sure you want to clear entire cart?"
    )) return;
    try {
      await clearCart(token);
      setItems([]);
      if (onCartCountChange) onCartCountChange();
    } catch (err) {
      alert("Failed to clear cart!");
    }
  };

  // Calculate totals
  const totalItems = items.reduce(
    (sum, item) => sum + item.quantity, 0
  );
  const totalPrice = items.reduce(
    (sum, item) => sum + (item.product?.price * item.quantity), 0
  );
  const originalTotal = Math.round(totalPrice * 1.1);
  const savedAmount = originalTotal - totalPrice;

  // ===== LOADING =====
  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px" }}>
        <p style={{ fontSize: "18px", color: "gray" }}>
          ⏳ Loading your cart...
        </p>
      </div>
    );
  }

  return (
    <div className="cart-container">

      {/* ===== CART HEADER ===== */}
      <div className="cart-header">
        <div>
          <h2>🛒 Shopping Cart</h2>
          <p style={{ color: "gray", fontSize: "14px", margin: 0 }}>
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

      {/* ===== EMPTY CART ===== */}
      {items.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: "60px", marginBottom: "15px" }}>
            🛒
          </div>
          <h3>Your cart is empty!</h3>
          <p style={{ color: "gray", marginBottom: "20px" }}>
            Add items to get started
          </p>
          <button className="btn-primary" onClick={onBack}>
            Browse Products
          </button>
        </div>
      )}

      {/* ===== CART ITEMS ===== */}
      {items.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 350px",
          gap: "20px",
          alignItems: "start"
        }}>

          {/* LEFT - Cart Items List */}
          <div>
            {items.map((item) => (
              <div
                key={item.id}
                className="cart-item"
                style={{
                  opacity: updatingId === item.id ? 0.6 : 1,
                  transition: "opacity 0.2s"
                }}
              >
                {/* Product Image */}
                <img
                  src={item.product?.imageUrl}
                  alt={item.product?.name}
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/100?text=No+Image";
                  }}
                />

                {/* Product Info */}
                <div className="cart-item-info">
                  <h4>{item.product?.name}</h4>
                  <p style={{ color: "gray", fontSize: "13px" }}>
                    {item.product?.category}
                  </p>
                  <p style={{
                    color: "#28a745", fontSize: "13px"
                  }}>
                    Unit Price: ₹{item.product?.price?.toLocaleString()}
                  </p>

                  {/* ===== T037: QUANTITY CONTROL ===== */}
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0",
                    marginTop: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "5px",
                    width: "fit-content"
                  }}>
                    {/* Minus Button */}
                    <button
                      onClick={() => handleQuantityChange(
                        item.id, item.quantity - 1
                      )}
                      disabled={
                        item.quantity <= 1 || updatingId === item.id
                      }
                      style={{
                        width: "36px", height: "36px",
                        border: "none",
                        backgroundColor: item.quantity <= 1
                          ? "#f5f5f5" : "#f8f9fa",
                        cursor: item.quantity <= 1
                          ? "not-allowed" : "pointer",
                        fontSize: "18px", fontWeight: "bold",
                        borderRadius: "5px 0 0 5px",
                        color: item.quantity <= 1 ? "#ccc" : "#333"
                      }}
                    >
                      −
                    </button>

                    {/* Quantity Display */}
                    <span style={{
                      width: "45px", textAlign: "center",
                      fontSize: "16px", fontWeight: "bold",
                      padding: "6px 0",
                      borderLeft: "1px solid #ddd",
                      borderRight: "1px solid #ddd"
                    }}>
                      {updatingId === item.id ? "..." : item.quantity}
                    </span>

                    {/* Plus Button */}
                    <button
                      onClick={() => handleQuantityChange(
                        item.id, item.quantity + 1
                      )}
                      disabled={updatingId === item.id}
                      style={{
                        width: "36px", height: "36px",
                        border: "none",
                        backgroundColor: "#f8f9fa",
                        cursor: "pointer",
                        fontSize: "18px", fontWeight: "bold",
                        borderRadius: "0 5px 5px 0",
                        color: "#333"
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* ===== T038: REMOVE BUTTON ===== */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    disabled={updatingId === item.id}
                    style={{
                      marginTop: "10px",
                      background: "none",
                      border: "none",
                      color: "#dc3545",
                      cursor: "pointer",
                      fontSize: "14px",
                      padding: 0,
                      textDecoration: "underline"
                    }}
                  >
                    🗑️ Remove
                  </button>
                </div>

                {/* Item Total Price */}
                <div style={{
                  textAlign: "right", minWidth: "120px"
                }}>
                  <p style={{
                    color: "#28a745", fontWeight: "bold",
                    fontSize: "18px", margin: 0
                  }}>
                    ₹{(item.product?.price * item.quantity)
                      .toLocaleString()}
                  </p>
                  {item.quantity > 1 && (
                    <p style={{
                      color: "gray", fontSize: "12px", margin: 0
                    }}>
                      {item.quantity} × ₹{item.product?.price?.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT - Order Summary */}
          <div style={{
            backgroundColor: "white",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            position: "sticky",
            top: "80px"
          }}>
            <h3 style={{ marginBottom: "20px" }}>
              📋 Order Summary
            </h3>

            {/* Price Breakdown */}
            <div style={{
              display: "flex", flexDirection: "column", gap: "12px"
            }}>
              <div style={{
                display: "flex", justifyContent: "space-between"
              }}>
                <span style={{ color: "gray" }}>
                  Price ({totalItems} items)
                </span>
                <span>₹{originalTotal.toLocaleString()}</span>
              </div>

              <div style={{
                display: "flex", justifyContent: "space-between",
                color: "#28a745"
              }}>
                <span>Discount (10%)</span>
                <span>− ₹{savedAmount.toLocaleString()}</span>
              </div>

              <div style={{
                display: "flex", justifyContent: "space-between"
              }}>
                <span style={{ color: "gray" }}>
                  Delivery Charges
                </span>
                <span style={{ color: "#28a745" }}>
                  {totalPrice > 499 ? "FREE 🎉" : "₹49"}
                </span>
              </div>

              <div style={{
                borderTop: "2px dashed #eee",
                paddingTop: "12px",
                display: "flex",
                justifyContent: "space-between",
                fontWeight: "bold",
                fontSize: "18px"
              }}>
                <span>Total Amount</span>
                <span style={{ color: "#B12704" }}>
                  ₹{totalPrice.toLocaleString()}
                </span>
              </div>

              <p style={{
                color: "#28a745", fontSize: "14px",
                fontWeight: "bold", margin: 0
              }}>
                🎉 You save ₹{savedAmount.toLocaleString()} on this order!
              </p>
            </div>

            {/* Checkout Button */}
            <button
              style={{
                width: "100%", padding: "14px",
                backgroundColor: "#ff9900",
                color: "#111", border: "none",
                borderRadius: "5px", fontSize: "16px",
                fontWeight: "bold", cursor: "pointer",
                marginTop: "20px"
              }}
            >
              ⚡ Proceed to Checkout
            </button>

            <button
              className="btn-primary"
              style={{
                width: "100%", padding: "12px",
                marginTop: "10px", fontSize: "15px"
              }}
              onClick={onBack}
            >
              🛒 Continue Shopping
            </button>

            {/* Safe Payment */}
            <div style={{
              textAlign: "center", marginTop: "15px",
              padding: "10px",
              backgroundColor: "#f8f9fa",
              borderRadius: "5px"
            }}>
              <p style={{
                fontSize: "12px", color: "gray", margin: 0
              }}>
                🔒 Safe and Secure Payments
              </p>
              <p style={{
                fontSize: "12px", color: "gray", margin: 0
              }}>
                100% Authentic Products
              </p>
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

export default Cart;