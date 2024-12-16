import EcosystemWallet from '@openfort/ecosystem-client-sdk-sample-app';

export const ecosystemWalletInstance = new EcosystemWallet({
    appChainIds: [80002],
    appLogoUrl: 'https://example.com/logo.png',
    appName: 'Example App',
});