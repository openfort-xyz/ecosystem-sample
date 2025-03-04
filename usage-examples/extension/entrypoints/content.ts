import EcosystemWallet from '@rapidfire/id';

export default defineContentScript({
  matches: ['https://*/*', 'http://localhost/*'],
  runAt: 'document_end',
  world: 'MAIN',
  main() {
    const rapidfire = new EcosystemWallet()
    const provider = rapidfire.getEthereumProvider()
      ; (window as any).ethereum = provider
  },
})
