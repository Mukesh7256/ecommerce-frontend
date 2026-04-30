import axios from "axios";

function ProductCard({ product, user, refresh }) {

  const deleteProduct = async () => {
    try {
      await axios.delete(
        `http://localhost:8080/api/products/${product.id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`
          }
        }
      );

      alert("Deleted successfully");
      refresh(); // reload list
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="card">

      <img src={product.imageUrl} className="product-img" />

      <h4>{product.name}</h4>
      <p>{product.description}</p>

      <p className="price">₹{product.price}</p>

      <p>{product.category}</p>

      <div style={{ display: "flex", gap: "10px" }}>
        <button className="search-btn">Edit</button>
        <button className="reset-btn" onClick={deleteProduct}>
          Delete
        </button>
      </div>

    </div>
  );
}

export default ProductCard;