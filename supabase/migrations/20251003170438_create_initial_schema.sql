/*
  # Create Initial Cocoinbox Schema

  ## Overview
  This migration creates the foundational database schema for Cocoinbox, a privacy-focused super-application.
  It includes tables for ephemeral emails, secure notes, and secure file sharing.

  ## New Tables

  ### 1. `ephemeral_emails`
  Stores temporary email addresses with automatic expiration
  - `id` (uuid, primary key): Unique identifier
  - `user_id` (uuid, foreign key): Reference to auth.users
  - `email_address` (text): The generated ephemeral email address
  - `alias_name` (text, optional): User-friendly alias for the email
  - `expires_at` (timestamptz): When the email expires
  - `is_active` (boolean): Whether the email is currently active
  - `created_at` (timestamptz): Creation timestamp

  ### 2. `secure_notes`
  Stores encrypted notes with auto-delete capabilities
  - `id` (uuid, primary key): Unique identifier
  - `user_id` (uuid, foreign key): Reference to auth.users
  - `title` (text): Note title
  - `encrypted_content` (text): AES-256 encrypted note content
  - `auto_delete_after_read` (boolean): Flag for auto-deletion after first read
  - `has_been_read` (boolean): Track if note has been accessed
  - `expires_at` (timestamptz, optional): Optional expiration date
  - `created_at` (timestamptz): Creation timestamp

  ### 3. `secure_files`
  Stores metadata for encrypted file uploads with password protection
  - `id` (uuid, primary key): Unique identifier
  - `user_id` (uuid, foreign key): Reference to auth.users
  - `filename` (text): Original filename
  - `encrypted_file_url` (text): URL to encrypted file in storage
  - `file_size` (bigint): File size in bytes
  - `password_protected` (boolean): Whether file requires password
  - `password_hash` (text, optional): Bcrypt hash if password protected
  - `expires_at` (timestamptz, optional): Optional expiration date
  - `download_count` (integer): Number of times downloaded
  - `max_downloads` (integer, optional): Maximum allowed downloads
  - `watermark_enabled` (boolean): Whether watermarking is enabled
  - `created_at` (timestamptz): Creation timestamp

  ## Security
  - All tables have Row Level Security (RLS) enabled
  - Users can only access their own data
  - Policies ensure authenticated access only
  - Separate policies for SELECT, INSERT, UPDATE, and DELETE operations

  ## Indexes
  - Optimized indexes on user_id columns for fast lookups
  - Indexes on expires_at for efficient cleanup operations
*/

-- Create ephemeral_emails table
CREATE TABLE IF NOT EXISTS ephemeral_emails (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_address text NOT NULL UNIQUE,
  alias_name text,
  expires_at timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create secure_notes table
CREATE TABLE IF NOT EXISTS secure_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  encrypted_content text NOT NULL,
  auto_delete_after_read boolean DEFAULT false,
  has_been_read boolean DEFAULT false,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Create secure_files table
CREATE TABLE IF NOT EXISTS secure_files (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename text NOT NULL,
  encrypted_file_url text NOT NULL,
  file_size bigint NOT NULL,
  password_protected boolean DEFAULT false,
  password_hash text,
  expires_at timestamptz,
  download_count integer DEFAULT 0,
  max_downloads integer,
  watermark_enabled boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ephemeral_emails_user_id ON ephemeral_emails(user_id);
CREATE INDEX IF NOT EXISTS idx_ephemeral_emails_expires_at ON ephemeral_emails(expires_at);
CREATE INDEX IF NOT EXISTS idx_ephemeral_emails_is_active ON ephemeral_emails(is_active);

CREATE INDEX IF NOT EXISTS idx_secure_notes_user_id ON secure_notes(user_id);
CREATE INDEX IF NOT EXISTS idx_secure_notes_expires_at ON secure_notes(expires_at);

CREATE INDEX IF NOT EXISTS idx_secure_files_user_id ON secure_files(user_id);
CREATE INDEX IF NOT EXISTS idx_secure_files_expires_at ON secure_files(expires_at);

-- Enable Row Level Security
ALTER TABLE ephemeral_emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE secure_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE secure_files ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ephemeral_emails
CREATE POLICY "Users can view own ephemeral emails"
  ON ephemeral_emails FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own ephemeral emails"
  ON ephemeral_emails FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ephemeral emails"
  ON ephemeral_emails FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own ephemeral emails"
  ON ephemeral_emails FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for secure_notes
CREATE POLICY "Users can view own secure notes"
  ON secure_notes FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own secure notes"
  ON secure_notes FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own secure notes"
  ON secure_notes FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own secure notes"
  ON secure_notes FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- RLS Policies for secure_files
CREATE POLICY "Users can view own secure files"
  ON secure_files FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own secure files"
  ON secure_files FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own secure files"
  ON secure_files FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own secure files"
  ON secure_files FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);