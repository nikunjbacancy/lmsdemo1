import { useState } from 'react';
import { STRINGS, DEFAULT_TAG } from '../constants';
import './NoteItem.css';
const API_URL = process.env.REACT_APP_API_URL;
const NoteItem = ({ 
  note, 
  index,
  onEdit, 
  onDelete, 
  onDragStart, 
  onDragOver, 
  onDrop, 
  onDragEnd,
  isDragging,
  isDeleting,
  onImageView
}) => {
  const [isPrivateVisible, setIsPrivateVisible] = useState(false);
  

  const isPrivate = note.tag === 'Private';
  const displayText = isPrivate && !isPrivateVisible 
    ? STRINGS.PRIVATE_HIDDEN_TEXT 
    : note.text;
  
  const shouldRenderAsHTML = !isPrivate || isPrivateVisible;

  const className = [
    'note-item',
    isDragging && 'dragging',
    isDeleting && 'deleting'
  ].filter(Boolean).join(' ');

  return (
    <li
      className={className}
      draggable
      onDragStart={() => onDragStart(index)}
      onDragOver={onDragOver}
      onDrop={(e) => onDrop(e, index)}
      onDragEnd={onDragEnd}
    >
      <span className="drag-handle" title="Drag to reorder">☰</span>

      <div className="note-image-container">
        {note.hasImage ? (
          <img 
            src={`${API_URL}/notes/${note.id}/image`}
            alt="Note attachment"
            className="note-image"
            onClick={() => onImageView(note.id)}
          />
        ) : (
          <div className="note-image-placeholder" />
        )}
      </div>

      <div className="note-main">
        <div className="note-text-wrapper">
          {shouldRenderAsHTML ? (
            <div
              className="note-text"
              dangerouslySetInnerHTML={{ __html: displayText }}
            />
          ) : (
            <div className="note-text blurred">
              {displayText}
            </div>
          )}
        </div>
      </div>

      <div className="note-footer">
        <span className={`note-tag tag-${note.tag?.toLowerCase()}`}>
          {note.tag || DEFAULT_TAG}
        </span>

        <div className="note-actions">
          {isPrivate && (
            <button
              className="eye-btn"
              onClick={() => setIsPrivateVisible(!isPrivateVisible)}
              title={isPrivateVisible ? STRINGS.PRIVATE_HIDE_TITLE : STRINGS.PRIVATE_SHOW_TITLE}
              aria-label={isPrivateVisible ? 'Hide private note' : 'Show private note'}
            >
              {isPrivateVisible ? '👁' : '👁‍🗨'}
            </button>
          )}
          <button
            className="edit-btn"
            onClick={() => onEdit(note)}
            title="Edit note"
            aria-label="Edit note"
          >
            ✎
          </button>
          <button
            className="delete-btn"
            onClick={() => onDelete(note.id)}
            title={STRINGS.DELETE_BUTTON_TITLE}
            aria-label="Delete note"
          >
            ✕
          </button>
        </div>
      </div>
    </li>
  );
};

export default NoteItem;
