import { supabase } from '../config/supabase';
import { SecureNote } from '../types';

export class NoteService {
  async createNote(
    userId: string,
    title: string,
    encryptedContent: string,
    autoDeleteAfterRead: boolean,
    expiresAt?: string
  ): Promise<SecureNote | null> {
    const { data, error } = await supabase
      .from('secure_notes')
      .insert({
        user_id: userId,
        title,
        encrypted_content: encryptedContent,
        auto_delete_after_read: autoDeleteAfterRead,
        has_been_read: false,
        expires_at: expiresAt
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating note:', error);
      return null;
    }

    return data;
  }

  async getUserNotes(userId: string): Promise<SecureNote[]> {
    const { data, error } = await supabase
      .from('secure_notes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user notes:', error);
      return [];
    }

    return data || [];
  }

  async getNote(noteId: string, userId: string): Promise<SecureNote | null> {
    const { data, error } = await supabase
      .from('secure_notes')
      .select('*')
      .eq('id', noteId)
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching note:', error);
      return null;
    }

    if (data && data.auto_delete_after_read && !data.has_been_read) {
      await supabase
        .from('secure_notes')
        .update({ has_been_read: true })
        .eq('id', noteId);
    }

    return data;
  }

  async deleteNote(noteId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('secure_notes')
      .delete()
      .eq('id', noteId)
      .eq('user_id', userId);

    return !error;
  }
}
