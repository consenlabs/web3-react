import { ConnectorUpdate } from '@web3-react/types'
import { AbstractConnector } from '@web3-react/abstract-connector'

// @ts-ignore
import imKeyProvider from '@imkey/web3-provider'

interface ImKeyConnectorArguments {
  chainId?: number
  url: string
  headers?: Record<string, string>
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
  private provider: any

  constructor({
    chainId,
    url,
    headers,
    symbol,
    rpc,
    supportedChainIds,
  }: ImKeyConnectorArguments) {
    super({ supportedChainIds: supportedChainIds || [chainId || 0] })

    this.rpc = rpc || {}
    this._chainId = chainId || 1
    this.url = url || this.rpc[this.chainId]
    this.headers = headers
    this.symbol = symbol
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
        symbol: this.symbol
      })
    }

    const provider = await this.provider
    
    this.provider.on('chainChanged', this.handleChainChanged)

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
