import { supabase } from '../config/supabase';
import { EphemeralEmail } from '../types';

export class EmailService {
  async createEphemeralEmail(userId: string, aliasName?: string): Promise<EphemeralEmail | null> {
    const emailAddress = `${Math.random().toString(36).substring(7)}@ephemeral.cocoinbox.app`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('ephemeral_emails')
      .insert({
        user_id: userId,
        email_address: emailAddress,
        alias_name: aliasName,
        expires_at: expiresAt,
        is_active: true
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating ephemeral email:', error);
      return null;
    }

    return data;
  }

  async getUserEmails(userId: string): Promise<EphemeralEmail[]> {
    const { data, error } = await supabase
      .from('ephemeral_emails')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user emails:', error);
      return [];
    }

    return data || [];
  }

  async deactivateEmail(emailId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('ephemeral_emails')
      .update({ is_active: false })
      .eq('id', emailId)
      .eq('user_id', userId);

    return !error;
  }

  async deleteExpiredEmails(): Promise<void> {
    const now = new Date().toISOString();

    await supabase
      .from('ephemeral_emails')
      .update({ is_active: false })
      .lt('expires_at', now);
  }
}
