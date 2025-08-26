import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import Openfort from '@openfort/openfort-node';
import { generateJwt } from "@coinbase/cdp-sdk/auth";

const app = express();
dotenv.config();

const PORT = process.env.PORT ?? 3001;

if (!process.env.OPENFORT_SECRET_KEY || !process.env.SHIELD_PUBLIC_KEY || !process.env.SHIELD_SECRET_KEY || !process.env.ENCRYPTION_SHARE || !process.env.STRIPE_SECRET_KEY || !process.env.COINBASE_KEY_ID || !process.env.COINBASE_KEY_SECRET) {
    throw new Error(
        `Unable to load the .env file. Please copy .env.example to .env and fill in the required environment variables.`
    );
}

if (!process.env.OPENFORT_PROD_SECRET_KEY || !process.env.SHIELD_PROD_PUBLIC_KEY || !process.env.SHIELD_PROD_SECRET_KEY || !process.env.ENCRYPTION_PROD_SHARE) {
    console.warn(
        `Unable to load the .env file for production. Please copy .env.example to .env and fill in the required environment variables for production.`
    );
}

// Use the cors middleware to disable CORS
app.use(cors());

app.use(express.json());

app.get("/api/onramp-providers", async (req, res) => {
    const providers = [
        {
            name: 'coinbase',
            logo_url: 'https://cdn.iconscout.com/icon/free/png-256/free-coinbase-logo-icon-svg-png-download-7651204.png',
            display_name: 'Coinbase'
        },
        {
            name: 'stripe',
            logo_url: 'https://cdn.iconscout.com/icon/free/png-256/free-stripe-logo-icon-svg-png-download-498440.png',
            display_name: 'Stripe'
        }
    ];

    let coinbaseQuote = null;
    let stripeQuote = null;

    // Fetch Coinbase quote
    try {
        const coinbaseResponse = await fetch("https://api.coinbase.com/v2/prices/ETH-USD/buy");
        if (coinbaseResponse.ok) {
            const coinbaseData = await coinbaseResponse.json();
            coinbaseQuote = {
                price: `$${(Number((coinbaseData as any).data.amount) * 0.01).toFixed(2)}`,
                amount: "0.01 ETH"
            };
        }
    } catch (error) {
        console.error("Error fetching Coinbase quote:", error);
    }

    // Fetch Stripe quote
    try {
        const stripeResponse = await fetch("https://api.stripe.com/v1/crypto/onramp/quotes", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`
            },
        });
        if (stripeResponse.ok) {
            const stripeData = await stripeResponse.json();
            const ethQuote = (stripeData as any).destination_network_quotes?.ethereum?.find((q: any) => q.destination_currency === 'eth');
            if (ethQuote) {
                const ethPerDollar = Number(ethQuote.destination_amount) / 100;
                const costFor001Eth = 0.01 / ethPerDollar;
                stripeQuote = {
                    price: `$${costFor001Eth.toFixed(2)}`,
                    amount: "0.01 ETH"
                };
            }
        }
    } catch (error) {
        console.error("Error fetching Stripe quote:", error);
    }

    // Add quotes to providers
    const providersWithQuotes = providers.map(provider => ({
        ...provider,
        quote: provider.name === 'coinbase' ? coinbaseQuote : stripeQuote
    }));
    res.json({ providers: providersWithQuotes });
});

app.post("/api/create-onramp-session", async (req, res) => {
    try {
        const { provider, address } = req.body;

        if (!provider || !address) {
            return res.status(400).json({ 
                error: 'Missing required parameters', 
                required: ['provider', 'address'] 
            });
        }

        if (provider === 'stripe') {
            const params = new URLSearchParams({
                source_currency: 'usd',
                wallet_address: address,
                lock_wallet_address: 'true',
                'destination_networks[]': 'ethereum',
                destination_network: 'ethereum',
                destination_currency: 'usdc'
            });

            const response = await fetch("https://api.stripe.com/v1/crypto/onramp_sessions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "Authorization": `Bearer ${process.env.STRIPE_SECRET_KEY}`
                },
                body: params
            });

            if (!response.ok) {
                const errorData = await response.json();
                return res.status(response.status).json({ 
                    error: 'Stripe API error', 
                    details: errorData 
                });
            }

            const data = await response.json();
            return res.json(data);
        }

        if (provider === 'coinbase') {
            const jwt = await generateJwt({
                apiKeyId: process.env.COINBASE_KEY_ID!,
                apiKeySecret: process.env.COINBASE_KEY_SECRET!,
                requestMethod: "POST",
                requestHost: "api.developer.coinbase.com",
                requestPath: "/onramp/v1/buy/quote"
            });

            const response = await fetch("https://api.developer.coinbase.com/onramp/v1/buy/quote", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${jwt}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    purchase_currency: "BTC",
                    payment_amount: "100.00",
                    payment_currency: "USD",
                    payment_method: "CARD",
                    country: "US",
                    destination_address: address
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                return res.status(response.status).json({ 
                    error: 'Coinbase API error', 
                    details: errorData 
                });
            }

            const data = await response.json();
            return res.json({ redirect_url: (data as any).onramp_url });
        }

        return res.status(400).json({ 
            error: 'Invalid provider', 
            supported: ['stripe', 'coinbase'] 
        });

    } catch (error) {
        console.error('Onramp session creation error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            message: 'Failed to create onramp session'
        });
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

        const { isProd } = req.body;

        let openfortKey, shieldPublicKey, shieldSecretKey, encryptionShare;

        if (isProd) {
            if (!process.env.OPENFORT_PROD_SECRET_KEY || !process.env.SHIELD_PROD_PUBLIC_KEY ||
                !process.env.SHIELD_PROD_SECRET_KEY || !process.env.ENCRYPTION_PROD_SHARE) {
                return res.status(500).send({
                    error: 'Production environment variables are not configured properly.',
                });
            }
            openfortKey = process.env.OPENFORT_PROD_SECRET_KEY;
            shieldPublicKey = process.env.SHIELD_PROD_PUBLIC_KEY;
            shieldSecretKey = process.env.SHIELD_PROD_SECRET_KEY;
            encryptionShare = process.env.ENCRYPTION_PROD_SHARE;
        } else {
            openfortKey = process.env.OPENFORT_SECRET_KEY!;
            shieldPublicKey = process.env.SHIELD_PUBLIC_KEY!;
            shieldSecretKey = process.env.SHIELD_SECRET_KEY!;
            encryptionShare = process.env.ENCRYPTION_SHARE!;
        }

        const openfort = new Openfort(openfortKey);
        await openfort.iam.verifyAuthToken(accessToken);
        const session = await openfort.registerRecoverySession(shieldPublicKey, shieldSecretKey, encryptionShare);
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
    console.log(`Server is running at port ${PORT}`);
});
