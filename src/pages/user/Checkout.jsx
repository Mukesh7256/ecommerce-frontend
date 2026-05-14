import { useState } from "react";
import { placeOrder } from "../../services/orderService";
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
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

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
    // Clear error when typing
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  // T052: Frontend validation
  const validateForm = () => {
    const newErrors = {};

    if (!form.deliveryAddress.trim() ||
        form.deliveryAddress.trim().length < 10) {
      newErrors.deliveryAddress =
        "Enter complete address (min 10 chars)";
    }
    if (!form.city.trim()) {
      newErrors.city = "City is required";
    }
    if (!form.state) {
      newErrors.state = "Please select state";
    }
    if (!/^[1-9][0-9]{5}$/.test(form.pincode)) {
      newErrors.pincode = "Enter valid 6-digit pincode";
    }
    if (!/^[6-9][0-9]{9}$/.test(form.phone)) {
      newErrors.phone = "Enter valid 10-digit mobile number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Load Razorpay
  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) { resolve(true); return; }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Razorpay Payment
  const handleRazorpayPayment = async () => {
    setLoading(true);
    const loaded = await loadRazorpay();

    if (!loaded) {
      setApiError("Payment gateway unavailable! Try COD.");
      setLoading(false);
      return;
    }

    const options = {
      key: "rzp_test_YOUR_KEY_HERE", // ← Add your key
      amount: Math.round(finalPrice * 100),
      currency: "INR",
      name: "ShopEasy",
      description: "Order Payment",
      handler: async (response) => {
        try {
          // T051: Place order after payment
          const order = await placeOrder(
            { ...form, paymentMethod: "ONLINE" },
            token
          );
          onSuccess(order);
        } catch (err) {
          setApiError("Order save failed after payment!");
        }
      },
      prefill: {
        contact: form.phone
      },
      theme: { color: "#007bff" },
      modal: {
        ondismiss: () => {
          setLoading(false);
          setApiError("Payment cancelled!");
        }
      }
    };

    const razor = new window.Razorpay(options);
    razor.open();
    setLoading(false);
  };

  // T051: Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    // T052: Validate first
    if (!validateForm()) {
      window.scrollTo(0, 0);
      return;
    }

    // Online payment
    if (form.paymentMethod === "ONLINE") {
      handleRazorpayPayment();
      return;
    }

    // T051: COD - Place order directly
    setLoading(true);
    try {
      const order = await placeOrder(form, token);
      onSuccess(order);
    } catch (err) {
      setApiError(
        err.response?.data || "Checkout failed! Try again."
      );
      window.scrollTo(0, 0);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (fieldName) => ({
    width: "100%", padding: "12px",
    border: `1px solid ${errors[fieldName] ? "#dc3545" : "#ddd"}`,
    borderRadius: "5px", fontSize: "15px",
    boxSizing: "border-box",
    outline: "none",
    transition: "border-color 0.2s"
  });

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

      {/* API Error */}
      {apiError && (
        <div style={{
          backgroundColor: "#f8d7da", color: "#721c24",
          padding: "12px 16px", borderRadius: "6px",
          marginBottom: "15px", fontSize: "14px"
        }}>
          ⚠️ {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="checkout-grid">

          {/* LEFT */}
          <div>

            {/* Delivery Section */}
            <div className="checkout-section">
              <h3>📍 Delivery Address</h3>

              {/* Full Address */}
              <div className="form-group-checkout">
                <label className="checkout-label">
                  Full Address *
                </label>
                <textarea
                  name="deliveryAddress"
                  style={{
                    ...inputStyle("deliveryAddress"),
                    resize: "vertical"
                  }}
                  placeholder="House No., Street, Area, Landmark"
                  value={form.deliveryAddress}
                  onChange={handleChange}
                  rows={3}
                />
                {errors.deliveryAddress && (
                  <p style={{
                    color: "#dc3545", fontSize: "12px",
                    margin: "4px 0 0"
                  }}>
                    ⚠️ {errors.deliveryAddress}
                  </p>
                )}
              </div>

              <div className="form-row-2">
                {/* City */}
                <div className="form-group-checkout">
                  <label className="checkout-label">City *</label>
                  <input
                    name="city"
                    style={inputStyle("city")}
                    placeholder="e.g. Mumbai"
                    value={form.city}
                    onChange={handleChange}
                  />
                  {errors.city && (
                    <p style={{
                      color: "#dc3545", fontSize: "12px",
                      margin: "4px 0 0"
                    }}>
                      ⚠️ {errors.city}
                    </p>
                  )}
                </div>

                {/* State */}
                <div className="form-group-checkout">
                  <label className="checkout-label">State *</label>
                  <select
                    name="state"
                    style={inputStyle("state")}
                    value={form.state}
                    onChange={handleChange}
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
                  {errors.state && (
                    <p style={{
                      color: "#dc3545", fontSize: "12px",
                      margin: "4px 0 0"
                    }}>
                      ⚠️ {errors.state}
                    </p>
                  )}
                </div>
              </div>

              <div className="form-row-2">
                {/* Pincode */}
                <div className="form-group-checkout">
                  <label className="checkout-label">
                    Pincode *
                  </label>
                  <input
                    name="pincode"
                    style={inputStyle("pincode")}
                    placeholder="6-digit pincode"
                    value={form.pincode}
                    onChange={(e) => {
                      if (/^\d{0,6}$/.test(e.target.value)) {
                        handleChange(e);
                      }
                    }}
                    maxLength={6}
                  />
                  {errors.pincode && (
                    <p style={{
                      color: "#dc3545", fontSize: "12px",
                      margin: "4px 0 0"
                    }}>
                      ⚠️ {errors.pincode}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div className="form-group-checkout">
                  <label className="checkout-label">
                    Phone Number *
                  </label>
                  <input
                    name="phone"
                    style={inputStyle("phone")}
                    placeholder="10-digit mobile"
                    value={form.phone}
                    onChange={(e) => {
                      if (/^\d{0,10}$/.test(e.target.value)) {
                        handleChange(e);
                      }
                    }}
                    maxLength={10}
                  />
                  {errors.phone && (
                    <p style={{
                      color: "#dc3545", fontSize: "12px",
                      margin: "4px 0 0"
                    }}>
                      ⚠️ {errors.phone}
                    </p>
                  )}
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
                  <div className="payment-name">
                    Cash on Delivery
                  </div>
                  <div className="payment-desc">
                    Pay when order arrives
                  </div>
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
                  <div className="payment-name">
                    Online Payment
                  </div>
                  <div className="payment-desc">
                    UPI / Card / NetBanking
                  </div>
                  <div style={{
                    marginTop: "5px", fontSize: "10px",
                    backgroundColor: "#28a745",
                    color: "white", padding: "2px 6px",
                    borderRadius: "3px", display: "inline-block"
                  }}>
                    Razorpay
                  </div>
                </div>
              </div>
            </div>

            {/* Order Items */}
            <div className="checkout-section">
              <h3>🛒 Order Items ({cartItems.length})</h3>
              {cartItems.map((item, i) => (
                <div key={i} style={{
                  display: "flex", gap: "12px",
                  alignItems: "center",
                  padding: "10px 0",
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
                      margin: 0, color: "gray",
                      fontSize: "13px"
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

          {/* RIGHT - Summary */}
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
              <span>Delivery</span>
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

            <div style={{
              backgroundColor: "#d4edda",
              padding: "10px", borderRadius: "5px",
              textAlign: "center", margin: "10px 0"
            }}>
              <p style={{
                color: "#155724", margin: 0,
                fontWeight: "bold", fontSize: "14px"
              }}>
                🎉 You save ₹{discount.toLocaleString()}!
              </p>
            </div>

            <div style={{
              backgroundColor: "#e8f4fd", padding: "10px",
              borderRadius: "5px", marginBottom: "5px"
            }}>
              <p style={{
                margin: 0, fontSize: "13px", color: "#0c5460"
              }}>
                💳 {form.paymentMethod === "COD"
                  ? "Cash on Delivery"
                  : "Online via Razorpay"
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
                  ? `💳 Pay ₹${finalPrice.toLocaleString()}`
                  : "🛍️ Place Order"
              }
            </button>

            <div style={{
              textAlign: "center", marginTop: "15px",
              fontSize: "12px", color: "gray", lineHeight: "1.8"
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