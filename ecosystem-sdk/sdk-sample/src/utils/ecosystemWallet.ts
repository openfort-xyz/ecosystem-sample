import EcosystemWallet from '@rapidfire/id';

// create the Ecosystem instance and export it so it can be used in the examples
const domain = typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_DOMAIN || "http://localhost:3004";

export const ecosystemWalletInstance = new EcosystemWallet({
  clientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
});