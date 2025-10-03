import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SecureNote {
  id: string;
  user_id: string;
  title: string;
  encrypted_content: string;
  auto_delete_after_read: boolean;
  has_been_read: boolean;
  expires_at?: string;
  created_at: string;
}

export const useSecureNotes = () => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<SecureNote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = async () => {
    if (!user) {
      setNotes([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('secure_notes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [user]);

  const createNote = async (
    title: string,
    encryptedContent: string,
    autoDeleteAfterRead: boolean = false,
    expiresAt?: string
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('secure_notes')
        .insert({
          user_id: user.id,
          title,
          encrypted_content: encryptedContent,
          auto_delete_after_read: autoDeleteAfterRead,
          has_been_read: false,
          expires_at: expiresAt,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      await fetchNotes();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const getNote = async (noteId: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('secure_notes')
        .select('*')
        .eq('id', noteId)
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (data && data.auto_delete_after_read && !data.has_been_read) {
        await supabase
          .from('secure_notes')
          .update({ has_been_read: true })
          .eq('id', noteId);
      }

      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const deleteNote = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('secure_notes')
        .delete()
        .eq('id', noteId)
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchNotes();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { notes, loading, error, createNote, getNote, deleteNote, refetch: fetchNotes };
};
