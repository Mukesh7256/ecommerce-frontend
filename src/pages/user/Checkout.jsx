import { useState } from "react";
import axios from "axios";
import "../../styles/checkout.css";

function Checkout({ token, cartItems, onSuccess, onBack }) {
  const [form, setForm] = useState({
    deliveryAddress: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
    paymentMethod: "COD"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPrice = cartItems.reduce(
    (sum, item) =>
      sum + (item.product?.price * item.quantity), 0
  );
  const discount = Math.round(totalPrice * 0.10);
  const delivery = totalPrice > 499 ? 0 : 49;
  const finalPrice = totalPrice - discount + delivery;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8080/api/orders/checkout",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess(res.data);
    } catch (err) {
      setError(
        err.response?.data || "Checkout failed! Try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <div style={{
        display: "flex", alignItems: "center",
        gap: "10px", marginBottom: "25px"
      }}>
        <button className="btn-secondary" onClick={onBack}>
          ← Back to Cart
        </button>
        <h2 style={{ margin: 0 }}>🛍️ Checkout</h2>
      </div>

      {error && (
        <div style={{
          backgroundColor: "#f8d7da", color: "#721c24",
          padding: "12px", borderRadius: "5px",
          marginBottom: "15px"
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="checkout-grid">

          {/* LEFT - Delivery + Payment */}
          <div>

            {/* Delivery Address */}
            <div className="checkout-section">
              <h3>📍 Delivery Address</h3>

              <div className="form-group-checkout">
                <label className="checkout-label">
                  Full Address *
                </label>
                <textarea
                  name="deliveryAddress"
                  className="checkout-input"
                  placeholder="House/Flat No., Building, Street, Area"
                  value={form.deliveryAddress}
                  onChange={handleChange}
                  rows={3} required
                />
              </div>

              <div className="form-row-2">
                <div className="form-group-checkout">
                  <label className="checkout-label">City *</label>
                  <input
                    name="city"
                    className="checkout-input"
                    placeholder="e.g. Mumbai"
                    value={form.city}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group-checkout">
                  <label className="checkout-label">State *</label>
                  <select
                    name="state"
                    className="checkout-input"
                    value={form.state}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select State</option>
                    <option>Maharashtra</option>
                    <option>Delhi</option>
                    <option>Karnataka</option>
                    <option>Tamil Nadu</option>
                    <option>Gujarat</option>
                    <option>Rajasthan</option>
                    <option>Uttar Pradesh</option>
                    <option>West Bengal</option>
                    <option>Telangana</option>
                    <option>Kerala</option>
                  </select>
                </div>
              </div>

              <div className="form-row-2">
                <div className="form-group-checkout">
                  <label className="checkout-label">
                    Pincode *
                  </label>
                  <input
                    name="pincode"
                    className="checkout-input"
                    placeholder="e.g. 400001"
                    value={form.pincode}
                    onChange={handleChange}
                    maxLength={6}
                    required
                  />
                </div>
                <div className="form-group-checkout">
                  <label className="checkout-label">
                    Phone Number *
                  </label>
                  <input
                    name="phone"
                    className="checkout-input"
                    placeholder="e.g. 9876543210"
                    value={form.phone}
                    onChange={handleChange}
                    maxLength={10}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="checkout-section">
              <h3>💳 Payment Method</h3>
              <div className="payment-options">

                <div
                  className={`payment-option ${
                    form.paymentMethod === "COD" ? "selected" : ""
                  }`}
                  onClick={() => setForm({
                    ...form, paymentMethod: "COD"
                  })}
                >
                  <div className="payment-icon">💵</div>
                  <div className="payment-name">Cash on Delivery</div>
                  <div className="payment-desc">Pay when delivered</div>
                </div>

                <div
                  className={`payment-option ${
                    form.paymentMethod === "ONLINE" ? "selected" : ""
                  }`}
                  onClick={() => setForm({
                    ...form, paymentMethod: "ONLINE"
                  })}
                >
                  <div className="payment-icon">💳</div>
                  <div className="payment-name">Online Payment</div>
                  <div className="payment-desc">
                    UPI / Cards / NetBanking
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="checkout-section">
              <h3>🛍️ Order Items ({cartItems.length})</h3>
              {cartItems.map(item => (
                <div key={item.id} style={{
                  display: "flex", gap: "12px",
                  padding: "10px 0",
                  borderBottom: "1px solid #f0f0f0"
                }}>
                  <img
                    src={item.product?.imageUrl}
                    alt={item.product?.name}
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
                      margin: 0, fontWeight: "bold",
                      fontSize: "14px"
                    }}>
                      {item.product?.name}
                    </p>
                    <p style={{
                      margin: 0, color: "gray", fontSize: "13px"
                    }}>
                      Qty: {item.quantity}
                    </p>
                  </div>
                  <p style={{
                    margin: 0, fontWeight: "bold",
                    color: "#28a745"
                  }}>
                    ₹{(item.product?.price * item.quantity)
                      .toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT - Order Summary */}
          <div className="checkout-summary">
            <h3 style={{ marginBottom: "15px" }}>
              📋 Price Details
            </h3>

            <div className="summary-row">
              <span>Price ({cartItems.length} items)</span>
              <span>₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className="summary-row" style={{ color: "#28a745" }}>
              <span>Discount (10%)</span>
              <span>− ₹{discount.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery</span>
              <span style={{
                color: delivery === 0 ? "#28a745" : "#333"
              }}>
                {delivery === 0 ? "FREE" : `₹${delivery}`}
              </span>
            </div>
            <div className="summary-row total">
              <span>Total Amount</span>
              <span style={{ color: "#B12704" }}>
                ₹{finalPrice.toLocaleString()}
              </span>
            </div>

            <div style={{
              backgroundColor: "#d4edda", padding: "10px",
              borderRadius: "5px", textAlign: "center",
              margin: "10px 0"
            }}>
              <p style={{
                color: "#155724", margin: 0,
                fontSize: "14px", fontWeight: "bold"
              }}>
                🎉 You save ₹{discount.toLocaleString()}!
              </p>
            </div>

            <div style={{
              backgroundColor: "#e8f4fd", padding: "10px",
              borderRadius: "5px", marginBottom: "10px"
            }}>
              <p style={{
                margin: 0, fontSize: "13px", color: "#0c5460"
              }}>
                💳 Payment: {
                  form.paymentMethod === "COD"
                    ? "Cash on Delivery"
                    : "Online Payment"
                }
              </p>
            </div>

            <button
              type="submit"
              className="btn-place-order"
              disabled={loading}
            >
              {loading
                ? "⏳ Placing Order..."
                : "🛍️ Place Order"
              }
            </button>

            <div style={{
              textAlign: "center", marginTop: "15px",
              fontSize: "12px", color: "gray"
            }}>
              🔒 Safe and Secure Payments
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Checkout;