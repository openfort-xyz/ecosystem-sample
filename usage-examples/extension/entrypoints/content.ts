import EcosystemWallet from '@rapidfire/id';

export default defineContentScript({
  matches: ['https://*/*', 'http://localhost/*'],
  runAt: 'document_end',
  world: 'MAIN',
  main() {
    let rapidfire = new EcosystemWallet()
    let provider = rapidfire.getEthereumProvider()
      ; (window as any).ethereum = provider
  },
})
