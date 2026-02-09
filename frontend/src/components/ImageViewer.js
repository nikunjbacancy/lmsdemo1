import './ImageViewer.css';

const ImageViewer = ({ noteId, onClose }) => {
  return (
    <div className="image-viewer-overlay" onClick={onClose}>
      <div className="image-viewer-container" onClick={(e) => e.stopPropagation()}>
        <button className="image-viewer-close" onClick={onClose} aria-label="Close image viewer">
          ✕
        </button>
        <img
          src={`http://localhost:5000/notes/${noteId}/image`}
          alt="Note"
          className="image-viewer-img"
        />
      </div>
    </div>
  );
};

export default ImageViewer;
