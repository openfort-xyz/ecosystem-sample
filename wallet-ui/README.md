# Ecosystem Wallet

The Ecosystem Wallet is a comprehensive solution for managing digital assets within the ecosystem. It consists of a frontend user interface and a backend server.

## Project Structure

```
wallet-ui/
├── frontend/
├── backend/
└── portfolio/
```

### Frontend

The `frontend` directory contains the user interface for the Wallet. It includes all necessary pages and components for a complete wallet experience. It comes with non-custodial signer management with [Openfort](https://www.openfort.io/) but supports other signer solutions too.

**Customization**
You can edit fonts, colors, and other styling via the theme and customTheme props. For detail, see the [ConnectKit docs](https://docs.family.co/connectkit/customization).

**Key features:**
- Transaction simulation
- Transaction decoding
- Creating session keys
- Batched transactions
- Signing typed messages
- Fiat-to-crypto onramp

and more ...

### Backend

When using [Openfort](https://www.openfort.io/) as embedded signer provider with [**AUTOMATIC recovery**](https://www.openfort.io/docs/products/embedded-wallet/javascript/signer/recovery#automatic-recovery), a backend is required to manage encryption sessions.

For the onramp functionality, such as using [Stripe](https://docs.stripe.com/crypto/onramp/standalone-onramp-guide#mint-session-redirect-url) or [Coinbase](https://docs.cdp.coinbase.com/onramp-&-offramp/onramp-apis/onramp-overview), a backend is required. It must implement an endpoint to create a new onramp session for each user visit and another one to list all the implemented providers.

### Portfolio

The `portfolio` directory contains a standalone application that demonstrates the Rapidfire ecosystem wallet integration. It serves as a reference implementation showing how to integrate the wallet into your own applications.

**Key features:**
- View token balances across multiple chains
- Send and receive assets
- Transaction history
- **Transaction sponsorship** - sponsor your users' gas fees by setting a policy ID

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
SHIELD_SECRET_KEY=
ENCRYPTION_SHARE=
STRIPE_SECRET_KEY=
COINBASE_KEY_ID=
COINBASE_KEY_SECRET=
PORT=
```

#### Portfolio
```.env
REACT_APP_BACKEND_URL=
REACT_APP_OPENFORT_PUBLIC_KEY=
REACT_APP_OPENFORT_ECOSYSTEM_ID=
REACT_APP_SHIELD_PUBLIC_KEY=
REACT_APP_POLICY_ID=  # Optional: Set this to sponsor transaction gas fees
PORT=
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

#### Portfolio
```bash
cd portfolio
pnpm install
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

#### Portfolio
```bash
cd portfolio
pnpm start
```

## Transaction Sponsorship

The portfolio app supports transaction sponsorship, allowing you to pay for your users' gas fees. To enable this feature:

1. Create a gas policy in your [Openfort Dashboard](https://dashboard.openfort.io/policies)
2. Set the `REACT_APP_POLICY_ID` environment variable in your `.env` file with your policy ID (e.g., `pol_...`)
3. When set, all transactions made through the portfolio app will be sponsored using this policy

For more information on gas policies and sponsorship, see the [Openfort documentation on gas sponsorship](https://www.openfort.io/docs/configuration/gas-sponsorship).