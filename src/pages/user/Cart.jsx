import { useEffect, useState } from "react";
import {
  getCartItems, removeFromCart, clearCart
} from "../../services/cartService";
import "../../styles/cart.css";
import "../../styles/dashboard.css";

function Cart({ token, onBack }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      setLoading(true);
      const data = await getCartItems(token);
      setItems(data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (cartId) => {
    try {
      await removeFromCart(cartId, token);
      fetchCart();
    } catch (err) {
      alert("Remove failed!");
    }
  };

  const handleClear = async () => {
    if (!window.confirm("Clear entire cart?")) return;
    try {
      await clearCart(token);
      fetchCart();
    } catch (err) {
      alert("Clear failed!");
    }
  };

  const total = items.reduce(
    (sum, item) => sum + (item.product?.price * item.quantity), 0
  );

  return (
    <div className="cart-container">
      <div className="cart-header">
        <h2>🛒 My Cart ({items.length} items)</h2>
        <div style={{ display: "flex", gap: "10px" }}>
          {items.length > 0 && (
            <button className="btn-danger" onClick={handleClear}>
              Clear All
            </button>
          )}
          <button className="btn-secondary" onClick={onBack}>
            ← Continue Shopping
          </button>
        </div>
      </div>

      {loading && <div className="loader">Loading cart...</div>}

      {!loading && items.length === 0 && (
        <div className="empty-state">
          <h3>🛒 Your cart is empty!</h3>
          <button className="btn-primary" onClick={onBack}>
            Browse Products
          </button>
        </div>
      )}

      {!loading && items.map((item) => (
        <div key={item.id} className="cart-item">
          <img
            src={item.product?.imageUrl}
            alt={item.product?.name}
            onError={(e) => {
              e.target.src =
                "https://via.placeholder.com/85?text=No";
            }}
          />
          <div className="cart-item-info">
            <h4>{item.product?.name}</h4>
            <p>{item.product?.category}</p>
            <p className="cart-item-price">
              ₹{item.product?.price?.toLocaleString()}
              {" × "}{item.quantity}
              {" = "}
              <strong>
                ₹{(item.product?.price * item.quantity)
                  .toLocaleString()}
              </strong>
            </p>
          </div>
          <button
            className="btn-danger"
            onClick={() => handleRemove(item.id)}
          >
            Remove
          </button>
        </div>
      ))}

      {!loading && items.length > 0 && (
        <div className="cart-total">
          <h3>Total: ₹{total.toLocaleString()}</h3>
          <button className="btn-checkout">
            Checkout →
          </button>
        </div>
      )}
    </div>
  );
}

export default Cart;