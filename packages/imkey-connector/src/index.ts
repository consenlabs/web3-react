import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'

// @ts-ignore
import imKeyProvider from '@imkey/web3-provider'

interface ImKeyConnectorArguments {
  chainId: number
  url: string
  headers?: Record<string, string>
  symbol?: string
}

export class ImKeyConnector extends AbstractConnector {
  private readonly chainId: number
  private readonly url: string
  private readonly headers: Record<string, string> | undefined
  private readonly symbol: string | undefined
  private provider: any

  constructor({ chainId, url, headers, symbol }: ImKeyConnectorArguments) {
    super({ supportedChainIds: [chainId] })

    this.chainId = chainId
    this.url = url
    this.headers = headers
    this.symbol = symbol
  }
  public async activate(): Promise<ConnectorUpdate> {
    if (!this.provider) {
      this.provider = new imKeyProvider({
        rpcUrl: this.url,
        chainId: this.chainId,
        headers: this.headers,
        symbol: this.symbol
      })
    }

    const provider = await this.provider
    const account = await provider.enable().then((accounts: string[]): string => accounts[0])

    return { provider, account }
  }

  public async getProvider(): Promise<any> {
    return this.provider
  }

  public async getChainId(): Promise<number | string> {
    return this.chainId
  }

  public async getAccount(): Promise<null | string> {
    return this.provider._providers[0].getAccountsAsync(1).then((accounts: string[]): string => accounts[0])
  }

  public async deactivate() {
    
  }

  public async close() {
    await this.provider.stop()
    this.provider = null;
    this.emitDeactivate()
  }
}
