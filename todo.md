# AI Competition Voting Platform - Implementation Plan

## MVP Implementation (8 files max)

### Core Files to Create/Modify:
1. **src/pages/Index.tsx** - Main homepage with featured works and navigation
2. **src/pages/Works.tsx** - Works gallery with search/filter functionality  
3. **src/pages/WorkDetail.tsx** - Individual work detail page with voting
4. **src/pages/Upload.tsx** - Work upload page for participants
5. **src/pages/Admin.tsx** - Admin dashboard for management
6. **src/components/VotingCard.tsx** - Reusable work card component with voting
7. **src/components/MediaPlayer.tsx** - Universal media player component
8. **src/lib/supabase.ts** - Supabase client configuration

### Key Features (MVP):
- ✅ Dark theme UI with gradient effects
- ✅ Responsive design for all devices
- ✅ User authentication (Supabase Auth)
- ✅ Work upload with multimedia support
- ✅ Real-time voting system
- ✅ Search and filtering
- ✅ Admin panel for management
- ✅ Comments system
- ✅ Real-time updates via Supabase Realtime

### Database Schema (Supabase):
- users (handled by Supabase Auth)
- works (id, title, description, author_id, category, file_url, vote_count, created_at)
- votes (id, user_id, work_id, created_at)
- comments (id, work_id, user_id, content, created_at)
- categories (id, name, description)

### Tech Stack:
- Frontend: React + TypeScript + Shadcn-ui + Tailwind CSS
- Backend: Supabase (Auth, Database, Storage, Realtime)
- Styling: Dark theme with neon gradients
- State Management: React Query + Zustand