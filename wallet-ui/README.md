# Ecosystem Wallet

The Ecosystem Wallet is a comprehensive solution for managing digital assets within the ecosystem. It consists of a frontend user interface and a backend server.

## Project Structure

```
wallet-ui/
├── frontend/
└── backend/
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

Also, for the Stripe [fiat-to-crypto onramp](https://docs.stripe.com/crypto/onramp/standalone-onramp-guide#mint-session-redirect-url) capability, a backend is required. It must implement an endpoint to create a new onramp session for every user visit. Optionally, a [webhook](https://docs.stripe.com/webhooks) can be added to keep the frontend reactive to session status changes. For example, when a user completes the purchase of the cryptocurrencies.

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
STRIPE_WEBHOOK_SECRET=
PORT=
WEBSOCKET_PORT= 
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

> [!IMPORTANT]  
> If the backend uses a webhook to manage the Stripe onramp events, it must be callable from the Stripe servers. Use tools like `ngrok` to expose a `POST` endpoint in the backend. However, **do not expose the webhook itself**, there's an example at `usage-examples/wagmi-nextjs`.
>
>  You can also trigger events for testing purposes from the Stripe CLI. Either way, you will need to set up a listener and project keys, get more detalis about this in the [Stripe documentation](https://docs.stripe.com/webhooks). 
