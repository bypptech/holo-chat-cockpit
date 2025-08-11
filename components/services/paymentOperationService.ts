import { Actor, HttpAgent, Identity } from '@dfinity/agent';
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from '@dfinity/principal';
import BigNumber from "bignumber.js";

export interface Token {
  canisterId: Principal;
  decimal: number;
  digits: number;
  fee: bigint;
}


interface Result {
  success: boolean;
  error?: string;
}

export interface GetBalanceResult extends Result {
  currency: string;
  balance?: string;
}

export interface TransferResult extends Result {
  blockIndex?: bigint;
}
export interface ApproveResult extends Result {
  blockIndex?: bigint;
}

export interface AllowanceResult extends Result {
  allowance?: string;
}

interface Prepared {
  token: Token;
  identity: Identity;
  agent: HttpAgent;
  ledger: IcrcLedgerCanister;
};

class PaymentOperationService {
  private static instance: PaymentOperationService;

  static getInstance(): PaymentOperationService {
    if (!PaymentOperationService.instance) {
      PaymentOperationService.instance = new PaymentOperationService();
    }
    return PaymentOperationService.instance;
  }

  private isMainnet?:boolean;

  private tokens:{[key:string]: Token} = {};

  private prices:{[key:string]: bigint} = {};

  private rates:{[key:string]: Number} = {};

  private paymentWallet?:Principal;

  /**
   * specify network.  Call this method when network changed.
   * @param network 
   */
  async setNetwork(network: "mainnet"|"local") {
    const isMainnet = network == "mainnet";
    if (this.isMainnet === isMainnet) {
      // no change
      return;
    }

    // Update paymentInfo
    this.isMainnet = isMainnet;
    try {
      const actor:any = await this.getBackendActor();
      const paymentInfo = await actor.getPaymentInfo();

      // update supported tokens
      this.tokens = paymentInfo.tokens.reduce(
        (obj:any, data:any[]) =>{
          const [ currency, value ] = data;
          obj[currency] = value;
          return obj;
        }, {});

      // update prices
      this.prices = paymentInfo.prices.reduce(
        (obj:any, data:any[]) =>{
          const [ currency, price ] = data;
          const token = this.tokens[currency];
          if (token) {
            obj[currency] = price;
          }
          return obj;
        }, {});

      // update rates
      this.rates = paymentInfo.rates.reduce(
        (obj:any, data:any[]) =>{
          const [ currency, rate ] = data;
          const token = this.tokens[currency];
          if (token) {
            obj[currency] = rate;
          }
          return obj;
        }, {});

      // payment Wallet
      this.paymentWallet = paymentInfo.paymentWallet;
    } catch (e: any) {
      // TODO error handling
      throw e;
    }
  }

  /**
   * returns current login identity.  Override this for test
  */
  async getIdentity():Promise<Identity> {
    const { AuthClient } = await import('@dfinity/auth-client');
    const authClient = await AuthClient.create();
    return authClient.getIdentity();
  }

  getPaymentAddress(): string {
    return this.paymentWallet?.toString() ?? "";
  }

  getPrice(currency:string): string {
    const token = this.tokens[currency];
    const price = this.prices[currency];
    return (token && price) ? this.formatPrice(price, token.decimal, token.digits) : "";
  }

  getFee(currency:string): string {
    const token = this.tokens[currency];
    return token ? this.formatPrice(token.fee, token.decimal, token.digits) : "";
  }

  getRate(currency:string): Number {
    return this.rates[currency] ?? NaN;
  }

  getTotalAmount(currency:string): string {
    const token = this.tokens[currency];
    const price = this.prices[currency];
    if (token && price) {
      const total:bigint = price + token.fee;
      return this.formatPrice(total, token.decimal, token.digits);
    }
    return "";
  }

  async getBalance(currency: string, address?:string): Promise<GetBalanceResult> {
    try {
      const { token, ledger, identity } = await this.prepare(currency);

      // get balance of Owner
      const balance: BigInt = await ledger.balance({
        owner: address ? Principal.fromText(address) : identity.getPrincipal()
      });

      return {
        success: true,
        currency,
        balance: this.formatPrice(balance, token.decimal, token.digits)
      }

    } catch (e: any) {
      return {
        success: false,
        currency,
        error: e?.message
      };
    }
  }

  async transfer(currency:string, to:Principal, amount:number|BigNumber): Promise<TransferResult> {
    try {
      const { token, ledger } = await this.prepare(currency);
      const blockIndex = await ledger.transfer({
        to: {
          owner: to,
          subaccount:[]
        },
        amount: this.toBingInt(amount, token.decimal)
      });

      return {
        success: true,
        blockIndex
      };
    } catch (e:any) {
      return {
        success: false,
        error: e?.message
      };
    }
  }

  async approve(currency:string, spender:Principal, amount:number|BigNumber, expiresMs?:number): Promise<ApproveResult> {
    try {
      const { token, identity, ledger } = await this.prepare(currency);
      const blockIndex = await ledger.approve({
        amount: this.toBingInt(amount, token.decimal),
        spender: {
          owner: spender,
          subaccount:[]
        },
        expires_at: expiresMs ? BigInt(Date.now()) + BigInt(expiresMs) * BigInt(1e6) : undefined,
      });

      return {
        success: true,
        blockIndex
      };
    } catch (e:any) {
      return {
        success: false,
        error: e?.message
      };
    }
  }

  async allowance(currency:string, spender:Principal): Promise<AllowanceResult> {
    try {
      const { token, identity, ledger } = await this.prepare(currency);
      const result = await ledger.allowance({
        account: {
          owner: identity.getPrincipal(),
          subaccount:[]
        },
        spender: {
          owner: spender,
          subaccount:[]
        }
      });

      return {
        allowance: this.formatPrice(result.allowance, token.decimal, token.digits),
        success: true,
      };
    } catch (e:any) {
      return {
        success: false,
        error: e?.message
      };
    }
  }

  async transferFrom(currency:string, from:Principal, to:Principal, amount:number|BigNumber): Promise<TransferResult> {
    try {
      const { token, identity, ledger } = await this.prepare(currency);
      const blockIndex = await ledger.transferFrom({
        from: {
          owner: from,
          subaccount:[]
        },
        to: {
          owner: to,
          subaccount:[]
        },
        amount: this.toBingInt(amount, token.decimal)
      });

      return {
        success: true,
        blockIndex
      };
    } catch (e:any) {
      return {
        success: false,
        error: e?.message
      };
    }
  }

  private async prepare(currency: string): Promise<Prepared> {
    const token = this.tokens[currency];
    if (!token) {
      throw new Error(`${currency} not supporeted`);
    }

    const identity = await this.getIdentity();

    let host = this.isMainnet ? process.env.EXPO_PUBLIC_ICP_MAINNET_URL : process.env.EXPO_PUBLIC_ICP_LOCAL_URL;

    const agent = new HttpAgent({
      identity,
      host,
      shouldFetchRootKey: !this.isMainnet,
    });

/* shouldFetchRootKey 
    if (!this.isMainnet) {
      await agent.fetchRootKey();
    }
*/

    // Target ledger canister
    const ledger = IcrcLedgerCanister.create({
      agent: agent,
      canisterId: token.canisterId,
    });

    return {
      token,
      identity,
      agent,
      ledger
    };
  }

  // based on driveOperationService#callBackendCanister()
  async getBackendActor():Promise<Actor> {
    const [host, canisterId] = this.isMainnet ? 
      [process.env.EXPO_PUBLIC_ICP_MAINNET_URL, process.env.EXPO_PUBLIC_ICP_MAINNET_CANISTER_ID_DRIVE_GACHA] :
      [process.env.EXPO_PUBLIC_ICP_LOCAL_URL,   process.env.EXPO_PUBLIC_ICP_LOCAL_CANISTER_ID_DRIVE_GACHA];
    if (!canisterId) {
      throw new Error('Drive gacha canister ID not configured');
    }

    const agent = new HttpAgent({
      // no identity needed: anonymous
      host,
      shouldFetchRootKey: !this.isMainnet,
    });

    const idlFactory = ({ IDL }: { IDL: any }) => {
      const Token = IDL.Record({
        'fee' : IDL.Nat,
        'digits' : IDL.Nat8,
        'decimal' : IDL.Nat8,
        'canisterId' : IDL.Principal,
      });
      const PaymentInfo = IDL.Record({
        'tokens' : IDL.Vec(IDL.Tuple(IDL.Text, Token)),
        'prices' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Nat)),
        'paymentWallet' : IDL.Principal,
        'rates' : IDL.Vec(IDL.Tuple(IDL.Text, IDL.Float64)),
      });

      return IDL.Service({
        'getPaymentInfo' : IDL.Func([], [PaymentInfo], ['query']),
        'setPaymentWallet' : IDL.Func([IDL.Principal], [IDL.Bool], []),
      });
    };

    // Create the actor
    const actor = Actor.createActor(idlFactory, {
      agent,
      canisterId,
    });
    return actor;
  }

  toBingInt(amount:number|BigNumber, decimal:number): bigint {
    return BigInt(BigNumber(amount).shiftedBy(decimal).toFixed(0));
  }

  formatPrice(balance:BigInt, decimal:number, digits:number): string {
    return BigNumber(balance.toString()).shiftedBy(-decimal).toFixed(digits);
  }
}

export default PaymentOperationService;
