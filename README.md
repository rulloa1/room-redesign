# RoomRevive - AI-Powered Interior Design

Transform your space in seconds with AI-powered room redesigns and customizations.

## Features

### Core Redesign Features
- **13 Design Styles**: Modern, Scandinavian, Industrial, Bohemian, Minimalist, Traditional, Mid-Century, Coastal, Farmhouse, Art Deco, Japanese, Mediterranean, and Modern Spa
- **AI-Powered Transformations**: Upload any room photo and get professional redesigns instantly
- **Credit System**: Free tier with 3 credits, Basic and Pro subscription tiers

### NEW: Advanced Customization Features
- **Post-Redesign Customization**: Fine-tune your redesigns after generation
  - **Wall Colors**: Choose from 10+ preset colors or specify custom colors
  - **Trim & Molding**: Select from 8 different trim styles (crown molding, wainscoting, shiplap, board and batten, etc.)
  - **Trim Colors**: Match wall color, contrasting dark, natural wood, or custom
  - **Additional Details**: Add specific requests like lighting, built-ins, or layout changes

### NEW: Redesign Management
- **History Tracking**: All redesigns are automatically saved to your personal history
- **Favorites System**: Mark your favorite designs for easy access
- **Download Images**: Save any redesign to your device
- **Share Functionality**: Share your redesigns via native sharing or copy link

### User Experience
- **Before/After Comparison**: Interactive slider to compare original and redesigned images
- **Real-time Credits Display**: Always know how many credits you have remaining
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile devices
- **Loading States**: Beautiful loading animations with contextual messages

## Technologies

This project is built with:
- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions)
- **Authentication**: Supabase Auth
- **AI**: Lovable AI Gateway with Gemini 2.5 Flash Image Preview
- **State Management**: React Query + Custom Hooks

## Database Schema

### Tables
- `user_credits`: Manages user subscription tiers and credit balance
- `projects`: User's saved design projects
- `project_rooms`: Individual room designs within projects
- `redesign_history`: Complete history of all redesigns with customization options
- `user_roles`: Role-based access control

### Security
- Row Level Security (RLS) enabled on all tables
- Authenticated users can only access their own data
- Secure credit deduction with database functions

## Code Architecture

### Key Components
- `PostRedesignCustomization`: UI for customizing wall colors and trim after redesign
- `RedesignHistory`: Gallery view of user's redesign history with favorites
- `RoomCustomizations`: Reusable form for wall and trim customization options
- `BeforeAfter`: Interactive before/after image comparison slider
- `LoadingOverlay`: Contextual loading states with custom messages

### Custom Hooks
- `useAuth`: Authentication state and user management
- `useCredits`: Credit balance and subscription tier management
- `useRedesignHistory`: CRUD operations for redesign history

### Edge Functions
- `redesign-room`: Handles AI redesign requests with validation, credit management, and customization support

### Utilities
- `downloadImage`: Client-side image download functionality
- `getEdgeFunctionErrorMessage`: Error parsing for edge function responses

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/REPLACE_WITH_PROJECT_ID) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
