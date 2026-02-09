import { useState } from 'react';
import { STRINGS, AVAILABLE_TAGS, DEFAULT_TAG } from '../constants';
import RichTextEditor from './RichTextEditor';
import './NoteInput.css';

const NoteInput = ({ onAddNote }) => {
  const [text, setText] = useState('');
  const [selectedTag, setSelectedTag] = useState(DEFAULT_TAG);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleAdd = () => {
    const strippedText = text.replace(/<[^>]*>/g, '').trim();
    if (!strippedText) return;

    onAddNote(text, selectedTag, selectedImage);
    setText('');
    setSelectedTag(DEFAULT_TAG);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleImageSelect = (file) => {
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
  };

  return (
    <div className="input-section-rich">
      <RichTextEditor
        value={text}
        onChange={setText}
        placeholder={STRINGS.INPUT_PLACEHOLDER}
        className="rich-text-editor"
        onImageSelect={handleImageSelect}
      />
      
      {imagePreview && (
        <div className="image-preview-container">
          <img src={imagePreview} alt="Preview" className="image-preview" />
          <button 
            type="button"
            className="remove-preview-btn"
            onClick={handleRemoveImage}
            title="Remove image"
          >
            ✕
          </button>
        </div>
      )}
      
      <div className="input-controls">
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
          className="tag-dropdown"
          aria-label="Select note category"
        >
          {AVAILABLE_TAGS.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
        <button onClick={handleAdd} className="add-btn">
          {STRINGS.ADD_NOTE_BUTTON}
        </button>
      </div>
    </div>
  );
};

export default NoteInput;
