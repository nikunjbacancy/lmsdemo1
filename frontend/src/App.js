import { useState } from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useNotes } from './hooks/useNotes';
import { DEFAULT_TAG } from './constants';
import Login from './components/Login';
import Header from './components/Header';
import NoteInput from './components/NoteInput';
import NoteList from './components/NoteList';
import EditNoteModal from './components/EditNoteModal';
import ImageViewer from './components/ImageViewer';

function AppContent() {
  const { isAuthenticated, userId, loading } = useAuth();
  const { notes, addNote, updateNote, deleteNote, reorderNotes } = useNotes(userId);
  
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editText, setEditText] = useState('');
  const [editTag, setEditTag] = useState(DEFAULT_TAG);
  const [viewingImageNoteId, setViewingImageNoteId] = useState(null);

  const handleAddNote = async (text, tag, imageFile = null) => {
    await addNote(text, tag, imageFile);
  };

  const handleEditNote = (note) => {
    setEditingNoteId(note.id);
    setEditText(note.text);
    setEditTag(note.tag);
  };

  const handleSaveEdit = async () => {
    if (!editText.trim()) return;
    
    await updateNote(editingNoteId, editText, editTag);
    setEditingNoteId(null);
    setEditText('');
    setEditTag(DEFAULT_TAG);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditText('');
    setEditTag(DEFAULT_TAG);
  };

  const handleDeleteNote = async (noteId) => {
    await deleteNote(noteId);
  };

  const handleReorder = (fromIndex, toIndex) => {
    reorderNotes(fromIndex, toIndex);
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="App">
        <Login />
      </div>
    );
  }

  return (
    <div className="App">
      <div className="container">
        <Header />
        <NoteInput onAddNote={handleAddNote} />
        <NoteList
          notes={notes}
          onEdit={handleEditNote}
          onDelete={handleDeleteNote}
          onReorder={handleReorder}
          onImageView={setViewingImageNoteId}
        />
        
        {editingNoteId && (
          <EditNoteModal
            note={notes.find(n => n.id === editingNoteId)}
            onSave={handleSaveEdit}
            onCancel={handleCancelEdit}
            editText={editText}
            setEditText={setEditText}
            editTag={editTag}
            setEditTag={setEditTag}
          />
        )}
        
        {viewingImageNoteId && (
          <ImageViewer
            noteId={viewingImageNoteId}
            onClose={() => setViewingImageNoteId(null)}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
