import { useState } from 'react';
import { STRINGS, AVAILABLE_TAGS, DELETE_ANIMATION_DURATION } from '../constants';
import NoteItem from './NoteItem';
import './NoteList.css';

const NoteList = ({ notes, onEdit, onDelete, onReorder, onImageView }) => {
  const [draggedIndex, setDraggedIndex] = useState(null);
  const [deletingNotes, setDeletingNotes] = useState([]);
  const [activeFilter, setActiveFilter] = useState(STRINGS.FILTER_ALL);
  const [searchQuery, setSearchQuery] = useState('');

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) return;
    
    onReorder(draggedIndex, dropIndex);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleDelete = async (noteId) => {
    const confirmed = window.confirm(STRINGS.DELETE_CONFIRMATION);
    if (!confirmed) return;

    setDeletingNotes([...deletingNotes, noteId]);

    setTimeout(async () => {
      await onDelete(noteId);
      setDeletingNotes(deletingNotes.filter((id) => id !== noteId));
    }, DELETE_ANIMATION_DURATION);
  };

  const getFilteredNotes = () => {
    let filtered = notes;

    if (activeFilter !== STRINGS.FILTER_ALL) {
      filtered = filtered.filter((note) => note.tag === activeFilter);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.text.toLowerCase().includes(query) ||
          note.tag.toLowerCase().includes(query)
      );
    }

    return filtered;
  };

  const filteredNotes = getFilteredNotes();

  return (
    <div className="notes-list">
      <div className="notes-header">
        <h2>
          {STRINGS.NOTES_HEADER} ({filteredNotes.length})
        </h2>
        <div className="search-container">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Search notes..."
            className="search-input"
            aria-label="Search notes"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="clear-search-btn"
              title="Clear search"
              aria-label="Clear search"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      <div className="filters-section">
        <button
          onClick={() => setActiveFilter(STRINGS.FILTER_ALL)}
          className={`filter-btn ${activeFilter === STRINGS.FILTER_ALL ? 'active' : ''}`}
        >
          {STRINGS.FILTER_ALL}
        </button>
        {AVAILABLE_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => setActiveFilter(tag)}
            className={`filter-btn filter-${tag.toLowerCase()} ${
              activeFilter === tag ? 'active' : ''
            }`}
          >
            {tag}
          </button>
        ))}
      </div>

      {filteredNotes.length === 0 ? (
        <p className="empty-state">
          {activeFilter === STRINGS.FILTER_ALL
            ? STRINGS.EMPTY_STATE_ALL
            : STRINGS.EMPTY_STATE_FILTERED(activeFilter)}
        </p>
      ) : (
        <ul className="notes-ul">
          {filteredNotes.map((note, index) => (
            <NoteItem
              key={note.id}
              note={note}
              index={index}
              onEdit={onEdit}
              onDelete={handleDelete}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDragEnd={handleDragEnd}
              isDragging={draggedIndex === index}
              isDeleting={deletingNotes.includes(note.id)}
              onImageView={onImageView}
            />
          ))}
        </ul>
      )}
    </div>
  );
};

export default NoteList;
