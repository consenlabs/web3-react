import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'

// @ts-ignore
import imKeyProvider from '@imkey/web3-provider'

interface ImKeyConnectorArguments {
  chainId?: number
  url: string
  headers?: Record<string, string>
  decimals?: number
  msgAlert?: (msg: string) => void
  language?: string
  symbol?: string
  rpc?: Record<number, string>
  supportedChainIds?: number[]
}

export class ImKeyConnector extends AbstractConnector {
  private url: string
  private _chainId = 0
  private readonly rpc: Record<number, string> = {}
  private readonly headers: Record<string, string> | undefined
  private readonly symbol: string | undefined
  private decimals: number | undefined
  private language: string | undefined
  private provider: any

  constructor({
    chainId,
    url,
    headers,
    symbol,
    rpc,
    supportedChainIds,
    decimals,
    language
  }: ImKeyConnectorArguments) {
    super({ supportedChainIds: supportedChainIds || [chainId || 0] })

    this.rpc = rpc || {}
    this._chainId = chainId || 1
    this.url = url || this.rpc[this.chainId]
    this.headers = headers
    this.symbol = symbol
    this.decimals = decimals
    this.language = language

  }

  private handleChainChanged = (chainId: number): void => {
    this.emitUpdate({ chainId })
  }

  set chainId(chainId: number) {
    this._chainId = chainId
    if (this.rpc && chainId in this.rpc) {
      this.url = this.rpc[chainId]
    }
  }

  get chainId() {
    return this._chainId
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
    
    this.provider.on('chainChanged', this.handleChainChanged)

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
