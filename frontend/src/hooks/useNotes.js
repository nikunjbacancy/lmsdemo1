import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useNotes = (userId) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchNotes = useCallback(async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.fetchNotes(userId);
      setNotes(data);
    } catch (err) {
      setError('Failed to fetch notes');
      console.error('Error fetching notes:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchNotes();
  }, [fetchNotes]);

  const addNote = async (text, tag, imageFile = null) => {
    try {
      const newNote = await apiService.createNote(text, tag, userId, imageFile);
      if (newNote) {
        setNotes(prevNotes => [...prevNotes, newNote]);
        return { success: true };
      }
      return { success: false, message: 'Failed to create note' };
    } catch (err) {
      console.error('Error adding note:', err);
      return { success: false, message: 'Failed to create note' };
    }
  };

  const updateNote = async (noteId, text, tag) => {
    try {
      const updatedNote = await apiService.updateNote(noteId, text, tag);
      if (updatedNote) {
        setNotes(prevNotes =>
          prevNotes.map(note => (note.id === noteId ? updatedNote : note))
        );
        return { success: true };
      }
      return { success: false, message: 'Failed to update note' };
    } catch (err) {
      console.error('Error updating note:', err);
      return { success: false, message: 'Failed to update note' };
    }
  };

  const deleteNote = async (noteId) => {
    try {
      const success = await apiService.deleteNote(noteId);
      if (success) {
        setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
        return { success: true };
      }
      return { success: false, message: 'Failed to delete note' };
    } catch (err) {
      console.error('Error deleting note:', err);
      return { success: false, message: 'Failed to delete note' };
    }
  };

  const reorderNotes = (fromIndex, toIndex) => {
    const reorderedNotes = [...notes];
    const [draggedNote] = reorderedNotes.splice(fromIndex, 1);
    reorderedNotes.splice(toIndex, 0, draggedNote);
    setNotes(reorderedNotes);
  };

  return {
    notes,
    loading,
    error,
    addNote,
    updateNote,
    deleteNote,
    reorderNotes,
    refreshNotes: fetchNotes
  };
};
