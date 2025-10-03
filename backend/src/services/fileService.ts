import { supabase } from '../config/supabase';
import { SecureFile } from '../types';
import * as bcrypt from 'bcrypt';

export class FileService {
  async createFile(
    userId: string,
    filename: string,
    encryptedFileUrl: string,
    fileSize: number,
    passwordProtected: boolean,
    password?: string,
    expiresAt?: string,
    maxDownloads?: number,
    watermarkEnabled: boolean = true
  ): Promise<SecureFile | null> {
    let passwordHash: string | undefined;

    if (passwordProtected && password) {
      passwordHash = await bcrypt.hash(password, 10);
    }

    const { data, error } = await supabase
      .from('secure_files')
      .insert({
        user_id: userId,
        filename,
        encrypted_file_url: encryptedFileUrl,
        file_size: fileSize,
        password_protected: passwordProtected,
        password_hash: passwordHash,
        expires_at: expiresAt,
        max_downloads: maxDownloads,
        watermark_enabled: watermarkEnabled,
        download_count: 0
      })
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error creating file:', error);
      return null;
    }

    return data;
  }

  async getUserFiles(userId: string): Promise<SecureFile[]> {
    const { data, error } = await supabase
      .from('secure_files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user files:', error);
      return [];
    }

    return data || [];
  }

  async getFile(fileId: string, password?: string): Promise<SecureFile | null> {
    const { data, error } = await supabase
      .from('secure_files')
      .select('*')
      .eq('id', fileId)
      .maybeSingle();

    if (error || !data) {
      console.error('Error fetching file:', error);
      return null;
    }

    if (data.password_protected && data.password_hash && password) {
      const isValid = await bcrypt.compare(password, data.password_hash);
      if (!isValid) {
        return null;
      }
    } else if (data.password_protected && !password) {
      return null;
    }

    return data;
  }

  async incrementDownloadCount(fileId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('secure_files')
      .select('download_count, max_downloads')
      .eq('id', fileId)
      .maybeSingle();

    if (error || !data) {
      return false;
    }

    const newCount = data.download_count + 1;

    const { error: updateError } = await supabase
      .from('secure_files')
      .update({ download_count: newCount })
      .eq('id', fileId);

    return !updateError;
  }

  async deleteFile(fileId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('secure_files')
      .delete()
      .eq('id', fileId)
      .eq('user_id', userId);

    return !error;
  }
}
