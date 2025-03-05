import { Wallet, WalletDetailsParams, getWalletConnectConnector } from '@rainbow-me/rainbowkit';
import { createConnector, CreateConnectorFn } from 'wagmi';

import {
  rapidfireWallet as rapidfireIDConnector,
} from '../connectors/rapidfireWallet';

export interface RapidfireIDOptions {
  appName: string;
  appIcon?: string;
}

export const rapidfireID = ({ appName, appIcon }: RapidfireIDOptions): Wallet => ({
  id: 'com.rapidfire.id',
  name: 'Rapidfire ID',
  iconUrl: 'https://blog-cms.openfort.xyz/uploads/dos_icon_logo_eb409648a4.svg',
  iconBackground: '#0c2f78',
  downloadUrls: {
    android: 'https://play.google.com/store/apps/details?id=my.wallet',
    ios: 'https://apps.apple.com/us/app/my-wallet',
    chrome: 'https://chrome.google.com/webstore/detail/my-wallet',
    qrCode: 'https://my-wallet/qr',
  },
  mobile: {
    getUri: (uri: string) => uri,
  },
  qrCode: {
    getUri: (uri: string) => uri,
    instructions: {
      learnMoreUrl: 'https://my-wallet/learn-more',
      steps: [
        {
          description:
            'We recommend putting My Wallet on your home screen for faster access to your wallet.',
          step: 'install',
          title: 'Open the My Wallet app',
        },
        {
          description:
            'After you scan, a connection prompt will appear for you to connect your wallet.',
          step: 'scan',
          title: 'Tap the scan button',
        },
      ],
    },
  },
  extension: {
    instructions: {
      learnMoreUrl: 'https://my-wallet/learn-more',
      steps: [
        {
          description:
            'We recommend pinning My Wallet to your taskbar for quicker access to your wallet.',
          step: 'install',
          title: 'Install the My Wallet extension',
        },
        {
          description:
            'Be sure to back up your wallet using a secure method. Never share your secret phrase with anyone.',
          step: 'create',
          title: 'Create or Import a Wallet',
        },
        {
          description:
            'Once you set up your wallet, click below to refresh the browser and load up the extension.',
          step: 'refresh',
          title: 'Refresh your browser',
        },
      ],
    },
  },
  createConnector: (walletDetails: WalletDetailsParams) => {
    const connector: CreateConnectorFn = rapidfireIDConnector({
      appName,
      appLogoUrl: appIcon,
    });

    return createConnector((config) => ({
      ...connector(config),
      ...walletDetails,
    }));
  },
});