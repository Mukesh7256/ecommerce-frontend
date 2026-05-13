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

  // Calculate prices
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

  // Load Razorpay script
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Razorpay Payment Handler
  const handleRazorpayPayment = async () => {
    setLoading(true);
    const loaded = await loadRazorpayScript();

    if (!loaded) {
      setError("Payment gateway failed! Try COD.");
      setLoading(false);
      return;
    }

    const options = {
      // ✅ Replace with your Razorpay Test Key
      key: "rzp_test_SohNc8ajtoxvKi",
      amount: Math.round(finalPrice * 100), // paise mein
      currency: "INR",
      name: "ShopEasy",
      description: "Order Payment",
      image: "https://via.placeholder.com/150?text=ShopEasy",
      handler: async function (response) {
        // Payment successful!
        try {
          const res = await axios.post(
            "http://localhost:8080/api/orders/checkout",
            { ...form, paymentMethod: "ONLINE" },
            { headers: { Authorization: `Bearer ${token}` } }
          );
          onSuccess(res.data);
        } catch (err) {
          setError("Order save failed! Contact support.");
        }
      },
      prefill: {
        name: "Customer",
        contact: form.phone || "9999999999"
      },
      notes: {
        address: form.deliveryAddress
      },
      theme: {
        color: "#007bff"
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
          setError("Payment cancelled by user.");
        }
      }
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
    setLoading(false);
  };

  // Form Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate form
    if (!form.deliveryAddress.trim()) {
      setError("Please enter delivery address!");
      return;
    }
    if (!form.city.trim()) {
      setError("Please enter city!");
      return;
    }
    if (!form.state) {
      setError("Please select state!");
      return;
    }
    if (form.pincode.length !== 6) {
      setError("Please enter valid 6-digit pincode!");
      return;
    }
    if (form.phone.length !== 10) {
      setError("Please enter valid 10-digit phone!");
      return;
    }

    // Online Payment → Razorpay
    if (form.paymentMethod === "ONLINE") {
      handleRazorpayPayment();
      return;
    }

    // COD → Direct order
    setLoading(true);
    try {
      const res = await axios.post(
        "http://localhost:8080/api/orders/checkout",
        form,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onSuccess(res.data);
    } catch (err) {
      setError(err.response?.data || "Checkout failed! Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-container">

      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center",
        gap: "10px", marginBottom: "25px"
      }}>
        <button className="btn-secondary" onClick={onBack}>
          ← Back to Cart
        </button>
        <h2 style={{ margin: 0 }}>🛍️ Checkout</h2>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          backgroundColor: "#f8d7da", color: "#721c24",
          padding: "12px 16px", borderRadius: "6px",
          marginBottom: "15px", fontSize: "14px"
        }}>
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="checkout-grid">

          {/* LEFT SIDE */}
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
                  placeholder="House No., Street, Area, Landmark"
                  value={form.deliveryAddress}
                  onChange={handleChange}
                  rows={3}
                  required
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
                    <option>Andhra Pradesh</option>
                    <option>Delhi</option>
                    <option>Gujarat</option>
                    <option>Karnataka</option>
                    <option>Kerala</option>
                    <option>Madhya Pradesh</option>
                    <option>Maharashtra</option>
                    <option>Punjab</option>
                    <option>Rajasthan</option>
                    <option>Tamil Nadu</option>
                    <option>Telangana</option>
                    <option>Uttar Pradesh</option>
                    <option>West Bengal</option>
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
                    placeholder="6-digit pincode"
                    value={form.pincode}
                    onChange={(e) => {
                      if (e.target.value.length <= 6) {
                        handleChange(e);
                      }
                    }}
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
                    placeholder="10-digit mobile number"
                    value={form.phone}
                    onChange={(e) => {
                      if (e.target.value.length <= 10) {
                        handleChange(e);
                      }
                    }}
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

                {/* COD Option */}
                <div
                  className={`payment-option ${
                    form.paymentMethod === "COD" ? "selected" : ""
                  }`}
                  onClick={() => setForm({
                    ...form, paymentMethod: "COD"
                  })}
                >
                  <div className="payment-icon">💵</div>
                  <div className="payment-name">
                    Cash on Delivery
                  </div>
                  <div className="payment-desc">
                    Pay when order arrives
                  </div>
                </div>

                {/* Online Payment Option */}
                <div
                  className={`payment-option ${
                    form.paymentMethod === "ONLINE" ? "selected" : ""
                  }`}
                  onClick={() => setForm({
                    ...form, paymentMethod: "ONLINE"
                  })}
                >
                  <div className="payment-icon">💳</div>
                  <div className="payment-name">
                    Online Payment
                  </div>
                  <div className="payment-desc">
                    UPI / Card / NetBanking
                  </div>
                  <div style={{
                    marginTop: "5px",
                    fontSize: "10px",
                    backgroundColor: "#28a745",
                    color: "white",
                    padding: "2px 6px",
                    borderRadius: "3px"
                  }}>
                    Powered by Razorpay
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items Preview */}
            <div className="checkout-section">
              <h3>🛒 Items ({cartItems.length})</h3>
              {cartItems.map((item, i) => (
                <div key={i} style={{
                  display: "flex", gap: "12px",
                  alignItems: "center", padding: "10px 0",
                  borderBottom: "1px solid #f5f5f5"
                }}>
                  <img
                    src={item.product?.imageUrl}
                    alt={item.product?.name}
                    style={{
                      width: "55px", height: "55px",
                      objectFit: "contain",
                      backgroundColor: "#f8f9fa",
                      borderRadius: "5px", padding: "4px"
                    }}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/55?text=No";
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

          {/* RIGHT SIDE - Price Summary */}
          <div className="checkout-summary">
            <h3 style={{ margin: "0 0 15px" }}>
              📋 Price Details
            </h3>

            <div className="summary-row">
              <span>Price ({cartItems.length} items)</span>
              <span>₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className="summary-row"
              style={{ color: "#28a745" }}>
              <span>Discount (10%)</span>
              <span>− ₹{discount.toLocaleString()}</span>
            </div>
            <div className="summary-row">
              <span>Delivery Charges</span>
              <span style={{
                color: delivery === 0 ? "#28a745" : "#333"
              }}>
                {delivery === 0 ? "FREE 🎉" : `₹${delivery}`}
              </span>
            </div>
            <div className="summary-row total">
              <span>Total Amount</span>
              <span style={{ color: "#B12704" }}>
                ₹{finalPrice.toLocaleString()}
              </span>
            </div>

            {/* Savings */}
            <div style={{
              backgroundColor: "#d4edda", padding: "10px",
              borderRadius: "5px", textAlign: "center",
              margin: "10px 0"
            }}>
              <p style={{
                color: "#155724", margin: 0,
                fontWeight: "bold", fontSize: "14px"
              }}>
                🎉 You save ₹{discount.toLocaleString()}!
              </p>
            </div>

            {/* Payment Info */}
            <div style={{
              backgroundColor: "#e8f4fd", padding: "10px",
              borderRadius: "5px", marginBottom: "5px"
            }}>
              <p style={{
                margin: 0, fontSize: "13px", color: "#0c5460"
              }}>
                💳 {form.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : "Online Payment via Razorpay"
                }
              </p>
            </div>

            {/* Place Order Button */}
            <button
              type="submit"
              className="btn-place-order"
              disabled={loading}
              style={{
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer"
              }}
            >
              {loading
                ? "⏳ Processing..."
                : form.paymentMethod === "ONLINE"
                  ? "💳 Pay ₹" + finalPrice.toLocaleString()
                  : "🛍️ Place Order"
              }
            </button>

            {/* Trust Badges */}
            <div style={{
              textAlign: "center", marginTop: "15px",
              fontSize: "12px", color: "gray",
              lineHeight: "1.8"
            }}>
              <p style={{ margin: 0 }}>🔒 100% Secure Payments</p>
              <p style={{ margin: 0 }}>✅ Easy 7-Day Returns</p>
              <p style={{ margin: 0 }}>🚚 Fast Delivery</p>
            </div>
          </div>

        </div>
      </form>
    </div>
  );
}

export default Checkout;