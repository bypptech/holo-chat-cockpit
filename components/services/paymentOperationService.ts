import { AnonymousIdentity, HttpAgent, Identity } from '@dfinity/agent';
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from '@dfinity/principal';
import BigNumber from "bignumber.js";
import { getGlobalSessionNetwork } from '../auth/ICPAuth';

export interface Token {
  symbol: string;
  principal: Principal;
  decimal: number;
  digits: number;
  fee: string;
}

// TODO: get information from ledger canister: icrc_metadata()
const supportedTokens:{[key:string]: Token} = {
  "ICP": {
    symbol: "ICP",
    principal: Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"),
    decimal: 8,
    digits: 4,
    fee: "0.0001",
  },
  "ckUSDC": {
    symbol: "ckUSDC",
    principal: Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai"),
    decimal: 6,
    digits: 2,
    fee: "0.01"
  }
};

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

  getFee(currency:string): string {
    return supportedTokens[currency]?.fee ?? "";
  }

  async getBalance(currency: string, network?: 'local' | 'mainnet'): Promise<GetBalanceResult> {
    try {
      const currentNetwork = network || getGlobalSessionNetwork();
      const { token, ledger, identity } = await this.prepare(currency, currentNetwork);

      // get balance of Owner
      const balance: BigInt = await ledger.balance({
        owner: identity.getPrincipal()
      });

      return {
        success: true,
        currency,
        balance: this.formatBalance(balance, token.decimal, token.digits)
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
      const currentNetwork = getGlobalSessionNetwork() || 'mainnet';
      const { token, ledger } = await this.prepare(currency, currentNetwork);
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
      const currentNetwork = getGlobalSessionNetwork() || 'mainnet';
      const { token, identity, ledger } = await this.prepare(currency, currentNetwork);
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
      const currentNetwork = getGlobalSessionNetwork() || 'mainnet';
      const { token, identity, ledger } = await this.prepare(currency, currentNetwork);
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
        allowance: this.formatBalance(result.allowance, token.decimal, token.digits),
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
      const currentNetwork = getGlobalSessionNetwork() || 'mainnet';
      const { token, identity, ledger } = await this.prepare(currency, currentNetwork);
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

  private async prepare(currency: string, network: 'local' | 'mainnet' = 'mainnet'): Promise<Prepared> {
    const token = supportedTokens[currency];
    if (!token) {
      throw new Error(`${currency} not supporeted`);
    }

    // Logic imported from driveOperationService#callBackendCanister()
    const { AuthClient } = await import('@dfinity/auth-client');
    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();

    let host;
    if (network === 'mainnet') {
      host = process.env.EXPO_PUBLIC_ICP_MAINNET_URL;
    } else {
      host = process.env.EXPO_PUBLIC_ICP_LOCAL_URL;
    }

    const agent = new HttpAgent({
      identity,
      host,
      shouldFetchRootKey: (network === 'local'),
    });

    if (network === 'local') {
      await agent.fetchRootKey();
    }

    // Target ledger canister
    const ledger = IcrcLedgerCanister.create({
      agent: agent,
      canisterId: token.principal,
    });

    return {
      token,
      identity,
      agent,
      ledger
    };
  }

  toBingInt(amount:number|BigNumber, decimal:number): bigint {
    return BigInt(BigNumber(amount).shiftedBy(decimal).toFixed(0));
  }

  formatBalance(balance:BigInt, decimal:number, digits:number): string {
    return BigNumber(balance.toString()).shiftedBy(-decimal).toFixed(digits);
  }
}

export default PaymentOperationService;
