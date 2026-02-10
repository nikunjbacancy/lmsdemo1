import './ImageViewer.css';
const API_URL = process.env.REACT_APP_API_URL;
const ImageViewer = ({ noteId, onClose }) => {
  
  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <div className="image-viewer-container" onClick={(e) => e.stopPropagation()}>
        <button className="image-viewer-close" onClick={onClose} aria-label="Close image viewer">
          ✕
        </button>
        <img
          src={`${API_URL}/notes/${noteId}/image`}
          alt="Note"
          className="image-viewer-img"
        />
      </div>
    </div>
  );
};

export default ImageViewer;
