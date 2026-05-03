import { useState } from "react";
import "../styles/gallery.css";

function ImageGallery({ imageUrls, productName }) {

  const images = imageUrls
    ? imageUrls.split(",").filter(url => url.trim() !== "")
    : [];

  const [selectedIndex, setSelectedIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="gallery-placeholder">
        <img
          src="https://via.placeholder.com/400x400?text=No+Image"
          alt="No Image"
          style={{ width: "100%", borderRadius: "8px" }}
        />
      </div>
    );
  }

  return (
    <div className="gallery-container">

      {/* Main Large Image */}
      <div className="gallery-main">
        <img
          src={images[selectedIndex]}
          alt={`${productName} - View ${selectedIndex + 1}`}
          className="gallery-main-img"
          onError={(e) => {
            e.target.src =
              "https://via.placeholder.com/400x400?text=No+Image";
          }}
        />
        {/* Image Counter */}
        <span className="gallery-counter">
          {selectedIndex + 1} / {images.length}
        </span>
      </div>

      {/* Thumbnail Strip - Like Amazon */}
      {images.length > 1 && (
        <div className="gallery-thumbnails">
          {images.map((url, index) => (
            <div
              key={index}
              className={`gallery-thumb ${
                index === selectedIndex ? "active" : ""
              }`}
              onClick={() => setSelectedIndex(index)}
            >
              <img
                src={url}
                alt={`View ${index + 1}`}
                onError={(e) =>
                  e.target.style.display = "none"
                }
              />
              <span className="thumb-label">
                {index === 0 ? "Front" :
                 index === 1 ? "Back" :
                 index === 2 ? "Side" : "Detail"}
              </span>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}

export default ImageGallery;