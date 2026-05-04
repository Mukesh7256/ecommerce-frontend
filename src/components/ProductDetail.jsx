import { useState } from "react";
import ImageGallery from "./ImageGallery";
import "../styles/products.css";

function ProductDetail({ product, token, onBack, onAddToCart, isAdmin, onEdit }) {

  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  // Parse specifications
  // Format: "Brand:Samsung,RAM:12GB,Storage:256GB"
  const parseSpecs = (specsString) => {
    if (!specsString) return [];
    return specsString.split(",").map(spec => {
      const [key, value] = spec.split(":");
      return { key: key?.trim(), value: value?.trim() };
    }).filter(s => s.key && s.value);
  };

  // Parse highlights
  // Format: "Built-in Privacy Display|Knox Security|5G Ready"
  const parseHighlights = (highlightsString) => {
    if (!highlightsString) return [];
    return highlightsString.split("|").filter(h => h.trim() !== "");
  };

  const specs = parseSpecs(product.specifications);
  const highlights = parseHighlights(product.highlights);

  // Calculate discount (show 10% off always for demo)
  const originalPrice = Math.round(product.price * 1.1);
  const discountPercent = 10;
  const savedAmount = originalPrice - product.price;

  // Star rating
  const rating = product.rating || 4.2;
  const reviewCount = product.reviewCount || 128;

  const renderStars = (rating) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    let stars = "★".repeat(full);
    if (half) stars += "½";
    stars += "☆".repeat(5 - full - (half ? 1 : 0));
    return stars;
  };

  const handleAddToCart = async () => {
    if (onAddToCart) {
      await onAddToCart(product.id, quantity);
      setAddedToCart(true);
      setTimeout(() => setAddedToCart(false), 2000);
    }
  };

  return (
    <div className="detail-page">

      {/* Back Button */}
      <button
        className="btn-secondary"
        onClick={onBack}
        style={{ marginBottom: "20px" }}
      >
        ← Back to Products
      </button>

      {/* ===== TOP SECTION ===== */}
      <div className="detail-top">

        {/* LEFT — Image Gallery */}
        <div>
          <ImageGallery
            imageUrls={product.imageUrls || product.imageUrl}
            productName={product.name}
          />
        </div>

        {/* RIGHT — Product Info */}
        <div>

          {/* Category Badge */}
          <span className="category-badge">
            {product.category}
          </span>

          {/* Product Name */}
          <h2 style={{ margin: "10px 0 5px", fontSize: "22px" }}>
            {product.name}
          </h2>

          {/* Brand */}
          {product.brand && (
            <p style={{ color: "gray", fontSize: "14px", marginBottom: "8px" }}>
              by <strong style={{ color: "#007bff" }}>
                {product.brand}
              </strong>
            </p>
          )}

          {/* Rating */}
          <div className="rating-row">
            <span className="stars">{renderStars(rating)}</span>
            <span style={{ color: "#ff9500", fontWeight: "bold" }}>
              {rating}
            </span>
            <span className="rating-count">
              ({reviewCount} ratings)
            </span>
          </div>

          {/* Price Section */}
          <div className="price-section">
            <div style={{
              display: "flex", alignItems: "center",
              gap: "10px", marginBottom: "5px"
            }}>
              <span className="discount-badge">
                -{discountPercent}%
              </span>
              <span className="discount-price">
                ₹{product.price?.toLocaleString()}
              </span>
            </div>
            <div style={{ display: "flex", gap: "10px" }}>
              <span className="original-price">
                M.R.P: ₹{originalPrice.toLocaleString()}
              </span>
              <span className="saving-text">
                You save: ₹{savedAmount.toLocaleString()}
              </span>
            </div>
            <p style={{
              fontSize: "12px", color: "gray", marginTop: "5px"
            }}>
              Inclusive of all taxes
            </p>
          </div>

          {/* Stock Status */}
          {product.quantity > 0 ? (
            <p className="in-stock">✅ In Stock</p>
          ) : (
            <p className="out-of-stock">❌ Out of Stock</p>
          )}

          {/* Quantity Selector */}
          {!isAdmin && product.quantity > 0 && (
            <div style={{
              display: "flex", alignItems: "center",
              gap: "10px", marginBottom: "15px"
            }}>
              <span style={{ fontWeight: "bold" }}>Qty:</span>
              <select
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{
                  padding: "8px", borderRadius: "5px",
                  border: "1px solid #ddd", fontSize: "15px"
                }}
              >
                {[1,2,3,4,5].map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
          )}

          {/* Buttons */}
          {!isAdmin ? (
            <>
              <button
                className="btn-add-cart-amazon"
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
              >
                {addedToCart ? "✅ Added to Cart!" : "🛒 Add to Cart"}
              </button>
              <button
                className="btn-buy-now"
                disabled={product.quantity === 0}
              >
                ⚡ Buy Now
              </button>
            </>
          ) : (
            <>
              <button
                className="btn-success"
                style={{ width: "100%", padding: "12px", marginBottom: "10px" }}
                onClick={onEdit}
              >
                ✏️ Edit Product
              </button>
            </>
          )}

          {/* Delivery Info */}
          <div className="delivery-section" style={{ marginTop: "15px" }}>
            <div className="delivery-item">
              <span className="delivery-icon">🚚</span>
              <div>
                <strong>FREE Delivery</strong>
                <p style={{ color: "gray", fontSize: "13px", margin: 0 }}>
                  On orders above ₹499
                </p>
              </div>
            </div>
            <div className="delivery-item">
              <span className="delivery-icon">🔄</span>
              <div>
                <strong>7 Days Return</strong>
                <p style={{ color: "gray", fontSize: "13px", margin: 0 }}>
                  Easy return policy
                </p>
              </div>
            </div>
            <div className="delivery-item">
              <span className="delivery-icon">🔒</span>
              <div>
                <strong>Secure Payment</strong>
                <p style={{ color: "gray", fontSize: "13px", margin: 0 }}>
                  100% safe & secure
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ===== HIGHLIGHTS SECTION ===== */}
      {highlights.length > 0 && (
        <div className="highlights-section">
          <h3>⭐ Top Highlights</h3>
          {highlights.map((highlight, index) => (
            <div key={index} className="highlight-item">
              <div className="highlight-dot"></div>
              <p style={{ margin: 0, lineHeight: "1.6" }}>
                {highlight}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* ===== SPECIFICATIONS TABLE ===== */}
      {specs.length > 0 && (
        <div className="specs-section">
          <h3>📋 Product Details</h3>
          <table className="specs-table">
            <tbody>
              {specs.map((spec, index) => (
                <tr key={index}>
                  <td>{spec.key}</td>
                  <td>{spec.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ===== DESCRIPTION ===== */}
      <div className="highlights-section">
        <h3>📝 About this item</h3>
        <p style={{ lineHeight: "1.8", color: "#555", whiteSpace: "pre-line" }}>
          {product.description}
        </p>
      </div>

    </div>
  );
}

export default ProductDetail;