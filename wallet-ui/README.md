# Ecosystem Wallet

The Ecosystem Wallet is a comprehensive solution for managing digital assets within the ecosystem. It consists of a frontend user interface and a backend server.

## Project Structure

```
wallet-ui/
├── frontend/
└── backend/
```

### Frontend

The `frontend` directory contains the user interface for the Wallet. It includes all necessary pages and components for a complete wallet experience. It comes with non-custodial signer management with [Openfort](https://www.openfort.xyz/) but supports other signer solutions too.

**Customization**
You can edit fonts, colors, and other styling via the theme and customTheme props. For detail, see the [ConnectKit docs](https://docs.family.co/connectkit/customization).

**Key features:**
- Transaction simulation
- Transaction decoding
- Creating session keys
- Batched transactions
- Signing typed messages

and more ...

### Backend (optional)

When using [Openfort](https://www.openfort.xyz/) as embedded signer provider with [**AUTOMATIC recovery**](https://www.openfort.xyz/docs/guides/react/wallets/embedded-signer#automatic-recovery), a backend is required to manage encryption sessions.

## Getting Started

### Prerequisites

#### Frontend
```.env
REACT_APP_APP_NAME=
REACT_APP_OPENFORT_PUBLIC_KEY=
REACT_APP_SHIELD_PUBLIC_KEY=
REACT_APP_BACKEND_URL=
REACT_APP_OPENFORT_ECOSYSTEM_ID=
```

#### Backend
```.env
OPENFORT_SECRET_KEY=
OPENFORT_PUBLIC_KEY=
SHIELD_PUBLIC_KEY=
```

### Installation

#### Frontend
```bash
cd frontend
yarn install
```

#### Backend
```bash
cd backend
yarn install
```

### Running the Application

#### Frontend
```bash
cd frontend
yarn start
```

#### Backend
```bash
cd backend
yarn dev
```