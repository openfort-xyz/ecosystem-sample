import EcosystemWallet from '@rapidfire/id';
import { sepolia } from 'wagmi/chains';

export const ecosystemWalletInstance = new EcosystemWallet({
    appChainIds: [sepolia.id],
    appLogoUrl: 'https://purple-magnificent-bat-958.mypinata.cloud/ipfs/QmfQrh2BiCzugFauYF9Weu9SFddsVh9qV82uw43cxH8UDV',
    appName: 'Rapidfire Portfolio',
});

