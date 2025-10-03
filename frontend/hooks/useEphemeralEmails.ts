import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface EphemeralEmail {
  id: string;
  user_id: string;
  email_address: string;
  alias_name?: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
}

export const useEphemeralEmails = () => {
  const { user } = useAuth();
  const [emails, setEmails] = useState<EphemeralEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmails = async () => {
    if (!user) {
      setEmails([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('ephemeral_emails')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEmails(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, [user]);

  const createEmail = async (aliasName?: string) => {
    if (!user) return null;

    const emailAddress = `${Math.random().toString(36).substring(7)}@ephemeral.cocoinbox.app`;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();

    try {
      const { data, error } = await supabase
        .from('ephemeral_emails')
        .insert({
          user_id: user.id,
          email_address: emailAddress,
          alias_name: aliasName,
          expires_at: expiresAt,
          is_active: true,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      await fetchEmails();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const deactivateEmail = async (emailId: string) => {
    try {
      const { error } = await supabase
        .from('ephemeral_emails')
        .update({ is_active: false })
        .eq('id', emailId)
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchEmails();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { emails, loading, error, createEmail, deactivateEmail, refetch: fetchEmails };
};
