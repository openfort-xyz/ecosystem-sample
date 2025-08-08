import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Openfort from '@openfort/openfort-node';
import bodyParser from 'body-parser';
import Stripe from 'stripe';
import WebSocket, { WebSocketServer } from 'ws';

const app = express();
dotenv.config();
app.use(cors());
app.use('/webhook', bodyParser.raw({ type: 'application/json' }));
app.use(express.static("public"));

const PORT = process.env.PORT ?? 3001;
const WEBSOCKET_PORT = process.env.WEBSOCKET_PORT ?? 3002;

if (!process.env.OPENFORT_SECRET_KEY || !process.env.SHIELD_PUBLIC_KEY || !process.env.SHIELD_SECRET_KEY || !process.env.ENCRYPTION_SHARE || !process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    throw new Error(
        `Unable to load the .env file. Please copy .env.example to .env and fill in the required environment variables.`
    );
}

const openfort = new Openfort(process.env.OPENFORT_SECRET_KEY);
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const wss = new WebSocketServer({ port: Number(WEBSOCKET_PORT) });
const sessionClients = new Map<string, WebSocket>();

// WebSocket: client connects and sends sessionId
wss.on('connection', (ws) => {
    ws.on('message', (msg) => {
        const { sessionId } = JSON.parse(msg.toString());
        console.log("WebSocket connection established with: ", sessionId);
        if (sessionId) {
            sessionClients.set(sessionId, ws);
        }
    });

    ws.on('close', () => {
        for (const [key, value] of sessionClients.entries()) {
            if (value === ws) sessionClients.delete(key);
        }
    });
});

// Webhook: handle onramp session updates
app.post('/webhook', async (req, res) => {
    const sig = req.headers['stripe-signature'];
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig!,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err);
        return res.status(400).send(`Webhook Error: ${err}`);
    }

    if (event.type === 'crypto.onramp_session.updated') {
        const session = event.data.object;
        const ws = sessionClients.get(session.id);
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                status: session.status,
                transactionDetails: session.transaction_details
            }));
        }
    }
    res.status(200).send('Received');
});

app.use(express.json());

app.post("/api/create-onramp-session", async (req, res) => {
    try {
        const transaction_details = req.body;

        const params = new URLSearchParams();
        params.append('source_currency', 'usd');
        // params.append('source_currency', 'eur');
        params.append('source_amount', transaction_details["amount"]);
        params.append('wallet_address', transaction_details["address"]);
        params.append('lock_wallet_address', 'true');
        params.append('destination_networks[]', 'ethereum');
        params.append('destination_network', 'ethereum');

        // params.append('destination_currency', 'usdc');
        params.append('destination_currency', transaction_details["currency"].toLowerCase());

        const onrampSession = await fetch("https://api.stripe.com/v1/crypto/onramp_sessions", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`
            },
            body: params
        });
        res.send(await onrampSession.json());
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.post("/api/protected-create-encryption-session", async (req, res) => {
    try {
        const accessToken = req.headers.authorization?.split(' ')[1];
        if (!accessToken) {
            return res.status(401).send({
                error: 'You must be signed in to view the protected content on this page.',
            });
        }
        await openfort.iam.verifyAuthToken(accessToken);
        const session = await openfort.registerRecoverySession(process.env.SHIELD_PUBLIC_KEY!, process.env.SHIELD_SECRET_KEY!, process.env.ENCRYPTION_SHARE!)
        res.json({ session });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get("/api/healthz", (req, res) => {
    res.send("OK");
});

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});
