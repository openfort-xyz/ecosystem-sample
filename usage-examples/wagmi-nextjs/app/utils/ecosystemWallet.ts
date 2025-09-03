import EcosystemWallet from '@rapidfire/id';
import { baseSepolia } from 'wagmi/chains';

export const ecosystemWalletInstance = new EcosystemWallet({
    appMetadata: {
        appLogoUrl: 'https://a.rgbimg.com/users/b/ba/barunpatro/600/mf6B5Gq.jpg',
        appName: 'Example App',
        appChainIds: [baseSepolia.id],
    },
    testnet: false,
    windowStrategy: 'iframe',
});
