# Portfolio Frontend

This is a standalone frontend application for the Rapidfire portfolio dashboard and landing page.

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Environment Variables

Create a `.env` file in this directory with the following variables:

```env
# Backend URL (shared with frontend)
REACT_APP_BACKEND_URL=http://localhost:3001

# Openfort Configuration
REACT_APP_OPENFORT_PUBLIC_KEY=your_openfort_public_key
REACT_APP_OPENFORT_ECOSYSTEM_ID=your_ecosystem_id
REACT_APP_SHIELD_PUBLIC_KEY=your_shield_public_key

# Port for portfolio app (different from frontend which uses 3000)
PORT=3002
```

### 3. Start Development Server

```bash
pnpm start
```

The app will run on `http://localhost:3002` by default.

### 4. Build for Production

```bash
pnpm build
```

## Architecture

This portfolio app:
- Shares hooks, lib, and utils with the `../frontend` folder
- Has its own components in `src/components/`
- Uses the same backend as the frontend
- Runs on a different port (3002) for development

## Structure

```
portfolio/
├── public/
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Dashboard.tsx    # Main dashboard view
│   │   ├── Landing.tsx      # Landing page for unauthenticated users
│   │   ├── GetModal.tsx     # Receive assets modal
│   │   ├── SendModal.tsx    # Send assets modal
│   │   ├── Modal.tsx        # Base modal component
│   │   ├── Loading.tsx      # Loading indicator
│   │   ├── LogoMark.tsx     # Logo component
│   │   ├── ShowMore.tsx     # Show more/less toggle
│   │   └── TruncatedAddress.tsx  # Address display
│   ├── App.tsx              # Main app with routing
│   ├── Home.tsx             # Home page component
│   ├── index.tsx            # Entry point with providers
│   └── index.css            # Tailwind imports
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── config-overrides.js
```

