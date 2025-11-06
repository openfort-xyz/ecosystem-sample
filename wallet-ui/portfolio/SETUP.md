# Portfolio App Setup Guide

## Quick Start

### 1. Install Dependencies

From the `portfolio` directory:

```bash
pnpm install
```

### 2. Configure Environment Variables

Create a `.env` file in the portfolio directory:

```bash
cp ../frontend/.env ./env  # If you have frontend env file
# OR create it manually with the following variables:
```

Required environment variables:
```env
REACT_APP_BACKEND_URL=http://localhost:3001
REACT_APP_OPENFORT_PUBLIC_KEY=<your_key>
REACT_APP_OPENFORT_ECOSYSTEM_ID=<your_id>
REACT_APP_SHIELD_PUBLIC_KEY=<your_key>
PORT=3002
```

### 3. Start the Backend

The portfolio app requires the backend to be running. From the root of `wallet-ui`:

```bash
cd backend
pnpm install  # if not already installed
pnpm start
```

The backend should be running on `http://localhost:3001`.

### 4. Start the Portfolio App

From the `portfolio` directory:

```bash
pnpm start
```

The app will open at `http://localhost:3002`.

## Development Workflow

### Running Both Apps Simultaneously

You can run both the portfolio app and the frontend app at the same time:

1. **Backend** (Terminal 1):
   ```bash
   cd backend
   pnpm start
   ```

2. **Frontend** (Terminal 2):
   ```bash
   cd frontend
   pnpm start  # Runs on port 3000
   ```

3. **Portfolio** (Terminal 3):
   ```bash
   cd portfolio
   pnpm start  # Runs on port 3002
   ```

### Architecture

```
wallet-ui/
├── backend/           # Shared backend (port 3001)
├── frontend/          # Sign/auth flows (port 3000)
│   ├── src/
│   │   ├── hooks/     # Shared with portfolio
│   │   ├── lib/       # Shared with portfolio
│   │   └── utils.ts   # Shared with portfolio
└── portfolio/         # Dashboard & landing (port 3002)
    └── src/
        ├── components/
        └── Home.tsx
```

### Shared Dependencies

The portfolio app shares the following with frontend:
- **Hooks**: `useBlockscoutApi`, `useSwapAssets`, `useTokenInfo`
- **Lib**: `Wagmi`, `Query`, `Constants`
- **Utils**: Formatters and utilities

These are referenced via relative imports: `../../../frontend/src/...`

## Building for Production

```bash
pnpm build
```

The build output will be in the `build/` directory.

## Troubleshooting

### Port Already in Use

If port 3002 is already in use, you can change it in your `.env` file:

```env
PORT=3003  # or any other available port
```

### Missing Dependencies

If you encounter import errors:

```bash
# From portfolio directory
pnpm install

# If issues persist, install from root
cd ..
pnpm install
```

### Environment Variables Not Loading

Make sure:
1. The `.env` file is in the `portfolio/` directory
2. All required variables are set
3. You've restarted the dev server after adding/changing variables

## Features

### Landing Page
- OAuth login (Google, Twitter, etc.)
- Wallet recovery with password
- Automatic wallet recovery

### Dashboard
- View account balance
- Transaction history
- Asset list with prices
- Send assets modal
- Receive assets modal (QR code)
- Logout functionality

## Next Steps

- Customize the logo and branding in `src/components/LogoMark.tsx`
- Update the app name in `src/index.tsx` (currently "Rapidfire Portfolio")
- Modify the theme in the `EcosystemProvider` configuration
- Add additional routes to `src/App.tsx` as needed

