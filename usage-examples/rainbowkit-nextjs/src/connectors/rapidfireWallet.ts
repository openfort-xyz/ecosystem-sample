// Link your ecosystem wallet and modify the import to match the name of your SDK:
import { ProviderInterface } from '@rapidfire/id'
import {
    ChainNotConfiguredError,
    type Connector,
    createConnector,
} from '@wagmi/core'
import type { Compute } from '@wagmi/core/internal'
import {
    type AddEthereumChainParameter,
    type Address,
    type Hex,
    type ProviderRpcError,
    SwitchChainError,
    UserRejectedRequestError,
    getAddress,
    numberToHex,
} from 'viem'
import { ecosystemWalletInstance } from '../utils/ecosystemWallet'

export type RapidfireWalletParameters = Compute<any>

export function rapidfireWallet(
    parameters: RapidfireWalletParameters = {} as any,
) {
    type Provider = ProviderInterface & {
        request(args: {
            readonly method: string;
            readonly params?: readonly unknown[] | object;
        }): Promise<unknown>;
    }

    type Properties = {
        connect(parameters?: {
            chainId?: number | undefined
            instantOnboarding?: boolean | undefined
            isReconnecting?: boolean | undefined
        }): Promise<{
            accounts: readonly Address[]
            chainId: number
        }>
    }

    let walletProvider: Provider | undefined

    let accountsChanged: Connector['onAccountsChanged'] | undefined
    let chainChanged: Connector['onChainChanged'] | undefined
    let disconnect: Connector['onDisconnect'] | undefined

    return createConnector<Provider, Properties>((config) => ({
        id: 'com.rapidfire.id',
        name: 'Rapidfire ID',
        rdns: 'com.rapidfire.id',
        type: rapidfireWallet.type,
        async connect({ chainId, ...rest } = {}) {
            try {
                const provider = await this.getProvider()
                const accounts = (
                    (await provider.request({
                        method: 'eth_requestAccounts',
                    })) as string[]
                ).map((x) => getAddress(x))

                if (!accountsChanged) {
                    accountsChanged = this.onAccountsChanged.bind(this)
                    provider.on('accountsChanged', accountsChanged)
                }
                if (!chainChanged) {
                    chainChanged = this.onChainChanged.bind(this)
                    provider.on('chainChanged', chainChanged)
                }
                if (!disconnect) {
                    disconnect = this.onDisconnect.bind(this)
                    provider.on('disconnect', disconnect)
                }

                // Switch to chain if provided
                let currentChainId = await this.getChainId()
                if (chainId && currentChainId !== chainId) {
                    const chain = await this.switchChain!({ chainId }).catch((error) => {
                        if (error.code === UserRejectedRequestError.code) throw error
                        return { id: currentChainId }
                    })
                    currentChainId = chain?.id ?? currentChainId
                }

                return { accounts, chainId: currentChainId }
            } catch (error) {
                if ((error as Error).message === 'User not authenticated and third party authentication required.') {
                    // Redirect to authentication page
                    if (typeof window !== 'undefined') {
                        window.location.href = '/authentication';
                    }
                    throw new Error('Authentication required. Redirecting...');
                }
                if (
                    /(user closed modal|accounts received is empty|user denied account|request rejected)/i.test(
                        (error as Error).message,
                    )
                )
                    throw new UserRejectedRequestError(error as Error)
                throw error
            }
        },
        async disconnect() {
            const provider = await this.getProvider()

            if (accountsChanged) {
                provider.removeListener('accountsChanged', accountsChanged)
                accountsChanged = undefined
            }
            if (chainChanged) {
                provider.removeListener('chainChanged', chainChanged)
                chainChanged = undefined
            }
            if (disconnect) {
                provider.removeListener('disconnect', disconnect)
                disconnect = undefined
            }

            provider.disconnect()
        },
        async getAccounts() {
            const provider = await this.getProvider()
            return (
                (await provider.request({
                    method: 'eth_accounts',
                })) as string[]
            ).map((x) => getAddress(x))
        },
        async getChainId() {
            const provider = await this.getProvider()
            const chainId = (await provider.request({
                method: 'eth_chainId',
            })) as Hex
            return Number(chainId)
        },
        async getProvider() {
            if (!walletProvider) {
                walletProvider = ecosystemWalletInstance.getEthereumProvider()
            }

            return walletProvider
        },
        async isAuthorized() {
            try {
                const accounts = await this.getAccounts()
                return !!accounts.length
            } catch {
                return false
            }
        },
        async switchChain({ addEthereumChainParameter, chainId }) {
            const chain = config.chains.find((chain) => chain.id === chainId)
            if (!chain) throw new SwitchChainError(new ChainNotConfiguredError())

            const provider = await this.getProvider()

            try {
                await provider.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: numberToHex(chain.id) }],
                })
                return chain
            } catch (error) {
                // Indicates chain is not added to provider
                if ((error as ProviderRpcError).code === 4902) {
                    try {
                        let blockExplorerUrls: string[] | undefined
                        if (addEthereumChainParameter?.blockExplorerUrls)
                            blockExplorerUrls = addEthereumChainParameter.blockExplorerUrls
                        else
                            blockExplorerUrls = chain.blockExplorers?.default.url
                                ? [chain.blockExplorers?.default.url]
                                : []

                        let rpcUrls: readonly string[]
                        if (addEthereumChainParameter?.rpcUrls?.length)
                            rpcUrls = addEthereumChainParameter.rpcUrls
                        else rpcUrls = [chain.rpcUrls.default?.http[0] ?? '']

                        const addEthereumChain = {
                            blockExplorerUrls,
                            chainId: numberToHex(chainId),
                            chainName: addEthereumChainParameter?.chainName ?? chain.name,
                            iconUrls: addEthereumChainParameter?.iconUrls,
                            nativeCurrency:
                                addEthereumChainParameter?.nativeCurrency ??
                                chain.nativeCurrency,
                            rpcUrls,
                        } satisfies AddEthereumChainParameter

                        await provider.request({
                            method: 'wallet_addEthereumChain',
                            params: [addEthereumChain],
                        })

                        return chain
                    } catch (error) {
                        throw new UserRejectedRequestError(error as Error)
                    }
                }

                throw new SwitchChainError(error as Error)
            }
        },
        onAccountsChanged(accounts) {
            if (accounts.length === 0) this.onDisconnect()
            else
                config.emitter.emit('change', {
                    accounts: accounts.map((x) => getAddress(x)),
                })
        },
        onChainChanged(chain) {
            const chainId = Number(chain)
            config.emitter.emit('change', { chainId })
        },
        async onDisconnect(_error) {
            config.emitter.emit('disconnect')

            const provider = await this.getProvider()
            if (accountsChanged) {
                provider.removeListener('accountsChanged', accountsChanged)
                accountsChanged = undefined
            }
            if (chainChanged) {
                provider.removeListener('chainChanged', chainChanged)
                chainChanged = undefined
            }
            if (disconnect) {
                provider.removeListener('disconnect', disconnect)
                disconnect = undefined
            }
        },
    }))
}

// Set the type property
rapidfireWallet.type = 'rapidfireWallet' as const