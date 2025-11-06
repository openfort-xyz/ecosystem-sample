import EcosystemWallet from '@rapidfire/id';
import { polygonAmoy, base, baseSepolia, sepolia, ancient8Sepolia, dosChainTestnet } from 'wagmi/chains';

export const ecosystemWalletInstance = new EcosystemWallet({
    appChainIds: [polygonAmoy.id, base.id, baseSepolia.id, sepolia.id, ancient8Sepolia.id, dosChainTestnet.id],
    appLogoUrl: 'https://purple-magnificent-bat-958.mypinata.cloud/ipfs/QmfQrh2BiCzugFauYF9Weu9SFddsVh9qV82uw43cxH8UDV',
    appName: 'Rapidfire Portfolio',
});

