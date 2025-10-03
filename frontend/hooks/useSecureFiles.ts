import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface SecureFile {
  id: string;
  user_id: string;
  filename: string;
  encrypted_file_url: string;
  file_size: number;
  password_protected: boolean;
  expires_at?: string;
  download_count: number;
  max_downloads?: number;
  watermark_enabled: boolean;
  created_at: string;
}

export const useSecureFiles = () => {
  const { user } = useAuth();
  const [files, setFiles] = useState<SecureFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFiles = async () => {
    if (!user) {
      setFiles([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('secure_files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [user]);

  const uploadFile = async (file: File, password?: string, expiresAt?: string, maxDownloads?: number) => {
    if (!user) return null;

    try {
      const filePath = `${user.id}/${Date.now()}_${file.name}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('secure-files')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('secure-files')
        .getPublicUrl(filePath);

      const { data, error } = await supabase
        .from('secure_files')
        .insert({
          user_id: user.id,
          filename: file.name,
          encrypted_file_url: urlData.publicUrl,
          file_size: file.size,
          password_protected: !!password,
          expires_at: expiresAt,
          max_downloads: maxDownloads,
          watermark_enabled: true,
          download_count: 0,
        })
        .select()
        .maybeSingle();

      if (error) throw error;
      await fetchFiles();
      return data;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const deleteFile = async (fileId: string) => {
    try {
      const { error } = await supabase
        .from('secure_files')
        .delete()
        .eq('id', fileId)
        .eq('user_id', user?.id);

      if (error) throw error;
      await fetchFiles();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return { files, loading, error, uploadFile, deleteFile, refetch: fetchFiles };
};
