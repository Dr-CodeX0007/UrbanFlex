const isLocal =
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1";

const API_BASE_URL = isLocal
    ? "http://localhost:5000"
    : "https://urbanflex.onrender.com";

// Cloudinary (same account as HomeCart, separate upload preset)
const CLOUDINARY_CLOUD_NAME = "l4bt0ldi";
const CLOUDINARY_UPLOAD_PRESET = "urbanflex_uploads";