import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'

// @ts-ignore
import imKeyProvider from '@imkey/web3-provider'

interface ImKeyConnectorArguments {
  chainId: number
  url: string
  headers?: Record<string, string>
  symbol?: string,
  decimals?: number
  msgAlert?: (msg: string) => void
  language?: string
}

export class ImKeyConnector extends AbstractConnector {
  private readonly chainId: number
  private readonly url: string
  private readonly headers: Record<string, string> | undefined
  private readonly symbol: string | undefined
  private decimals: number | undefined
  private language: string | undefined
  private provider: any

  constructor({ chainId, url, headers, symbol, decimals, language }: ImKeyConnectorArguments) {
    super({ supportedChainIds: [chainId] })

    this.chainId = chainId
    this.url = url
    this.headers = headers
    this.symbol = symbol
    this.decimals = decimals
    this.language = language

  }
  public async activate(): Promise<ConnectorUpdate> {
    if (!this.provider) {
      this.provider = new imKeyProvider({
        rpcUrl: this.url,
        chainId: this.chainId,
        headers: this.headers,
        symbol: this.symbol,
        decimals: this.decimals,
        language: this.language
      })
    }

    const provider = await this.provider
    const account = await provider.enable().then((accounts: string[]): string => accounts[0])
    provider.on('disconnect', this.close.bind(this))

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
    try {
      await this.provider.stop()
    } catch {
      // ignore
    }
    
    this.provider = null;
    this.emitDeactivate()
  }
}
