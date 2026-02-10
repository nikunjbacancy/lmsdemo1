import { AVAILABLE_TAGS } from '../constants';
import RichTextEditor from './RichTextEditor';
import './EditNoteModal.css';
const API_URL = process.env.REACT_APP_API_URL;
const EditNoteModal = ({ note, onSave, onCancel, editText, setEditText, editTag, setEditTag }) => {

  const handleSave = () => {
    if (editText.trim()) {
      onSave();
    }
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Note</h3>
          <button className="modal-close" onClick={onCancel} aria-label="Close modal">
            ✕
          </button>
        </div>

        <div className="modal-body">
          {note.hasImage && (
            <div className="modal-image-container">
              <img
                src={`${API_URL}/notes/${note.id}/image`}
                alt="Note"
                className="modal-image"
              />
            </div>
          )}
          <RichTextEditor
            value={editText}
            onChange={setEditText}
            placeholder="Edit your note..."
            className="modal-rich-text-editor"
          />
          <div className="modal-controls">
            <label htmlFor="modal-tag-select">Category:</label>
            <select
              id="modal-tag-select"
              className="modal-tag-select"
              value={editTag}
              onChange={(e) => setEditTag(e.target.value)}
            >
              {AVAILABLE_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="modal-footer">
          <button className="modal-cancel-btn" onClick={onCancel}>
            ✕ Cancel
          </button>
          <button className="modal-save-btn" onClick={handleSave}>
            ✓ Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditNoteModal;
