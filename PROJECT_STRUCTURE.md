# Cocoinbox Project Structure

## Overview
Cocoinbox is a privacy-focused super-application built with a modern monorepo architecture. The application provides ephemeral emails, secure notes, and encrypted file sharing.

## Technology Stack

### Frontend
- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: CSS-in-JS (styled-jsx)
- **State Management**: React Context API
- **Authentication**: Supabase Auth
- **Database Client**: Supabase JavaScript Client

### Backend
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **API Style**: REST
- **Security**: Row Level Security (RLS)

## Project Structure

```
cocoinbox/
├── frontend/                    # Next.js frontend application
│   ├── components/             # Reusable UI components
│   │   ├── Layout.tsx          # Main layout wrapper
│   │   ├── Navbar.tsx          # Top navigation bar
│   │   └── Sidebar.tsx         # Side navigation menu
│   ├── contexts/               # React context providers
│   │   └── AuthContext.tsx    # Authentication state management
│   ├── hooks/                  # Custom React hooks
│   │   ├── useEphemeralEmails.ts
│   │   ├── useSecureNotes.ts
│   │   └── useSecureFiles.ts
│   ├── lib/                    # Utility libraries
│   │   └── supabase.ts        # Supabase client configuration
│   ├── pages/                  # Next.js pages (routes)
│   │   ├── _app.tsx           # App wrapper with providers
│   │   ├── index.tsx          # Landing page
│   │   ├── login.tsx          # Login page
│   │   ├── signup.tsx         # Sign up page
│   │   ├── dashboard.tsx      # Main dashboard
│   │   ├── emails.tsx         # Ephemeral emails management
│   │   ├── notes.tsx          # Secure notes management
│   │   └── files.tsx          # Secure files management
│   ├── styles/                 # Global styles
│   │   └── globals.css        # Global CSS
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.js
│
├── backend/                     # Express.js backend API
│   ├── src/
│   │   ├── config/             # Configuration files
│   │   │   └── supabase.ts    # Supabase client setup
│   │   ├── middleware/         # Express middleware
│   │   │   └── auth.ts        # Authentication middleware
│   │   ├── routes/             # API route handlers
│   │   │   ├── emailRoutes.ts
│   │   │   ├── noteRoutes.ts
│   │   │   └── fileRoutes.ts
│   │   ├── services/           # Business logic services
│   │   │   ├── emailService.ts
│   │   │   ├── noteService.ts
│   │   │   └── fileService.ts
│   │   ├── types/              # TypeScript type definitions
│   │   │   └── index.ts
│   │   └── index.ts            # Express app entry point
│   ├── package.json
│   └── tsconfig.json
│
├── .env                         # Environment variables
└── README.md                    # Project documentation
```

## Features

### 1. Ephemeral Email Addresses
- Generate temporary email addresses
- Automatic expiration after 24 hours
- Optional alias naming
- User dashboard management

### 2. Secure Notes
- AES-256 encrypted note storage
- Auto-delete after first read option
- Optional expiration dates
- Full CRUD operations

### 3. Secure File Sharing
- Encrypted file uploads
- Password protection support
- Watermarking enabled
- Download tracking
- Maximum download limits
- Expiration dates

## Database Schema

### Tables

#### `ephemeral_emails`
- Stores temporary email addresses
- Auto-expiration after 24 hours
- User-owned with RLS policies

#### `secure_notes`
- Encrypted note storage
- Auto-delete and expiration options
- User-owned with RLS policies

#### `secure_files`
- File metadata and URLs
- Password protection
- Download tracking
- User-owned with RLS policies

## Security Features

- **Authentication**: Email/password via Supabase Auth
- **Row Level Security**: All tables have RLS enabled
- **Data Encryption**: AES-256 for sensitive content
- **Password Hashing**: Bcrypt for file passwords
- **CORS Protection**: Configured for frontend domain
- **JWT Tokens**: Secure session management

## Development

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase account

### Environment Variables
Required in `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Setup

1. Install dependencies:
```bash
cd frontend && npm install
cd ../backend && npm install
```

2. Run development servers:
```bash
# Frontend (port 3000)
cd frontend && npm run dev

# Backend (port 4000)
cd backend && npm run dev
```

3. Build for production:
```bash
cd frontend && npm run build
cd backend && npm run build
```

## API Endpoints

### Email Routes
- `POST /api/emails/create` - Create ephemeral email
- `GET /api/emails/user/:userId` - Get user's emails
- `DELETE /api/emails/:emailId` - Deactivate email

### Note Routes
- `POST /api/notes/create` - Create secure note
- `GET /api/notes/user/:userId` - Get user's notes
- `GET /api/notes/:noteId` - Get specific note
- `DELETE /api/notes/:noteId` - Delete note

### File Routes
- `POST /api/files/create` - Upload secure file
- `GET /api/files/user/:userId` - Get user's files
- `GET /api/files/:fileId` - Get file details
- `POST /api/files/:fileId/download` - Track download
- `DELETE /api/files/:fileId` - Delete file

## Future Enhancements

### Phase 2
- Temporary phone numbers
- AI-powered email summarization
- Content-based auto-replies
- Mobile apps (iOS/Android)

### Phase 3
- Team collaboration features
- Advanced encryption options
- Custom retention policies
- Analytics dashboard

## License
See LICENSE file for details.
