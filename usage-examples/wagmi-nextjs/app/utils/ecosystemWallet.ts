import EcosystemWallet from '@rapidfire/id';
import { baseSepolia } from 'wagmi/chains';

export const ecosystemWalletInstance = new EcosystemWallet({
    appChainIds: [baseSepolia.id],
    appLogoUrl: 'https://a.rgbimg.com/users/b/ba/barunpatro/600/mf6B5Gq.jpg',
    appName: 'Example App',
});