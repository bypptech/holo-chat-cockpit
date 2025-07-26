import { AnonymousIdentity, HttpAgent, Identity } from '@dfinity/agent';
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from '@dfinity/principal';
import BigNumber from "bignumber.js";

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

  async getBalance(currency:string): Promise<GetBalanceResult> {
    try {
      const { token, ledger, identity } = await this.prepare(currency);

      // get balance of Owner
      const balance:BigInt = await ledger.balance({
        owner: identity.getPrincipal()
      });

      return {
        success: true,
        currency,
        balance: this.formatBalance(balance, token.decimal, token.digits)
      }

    } catch (e:any) {
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

  async approve(currency:string, to:Principal, amount:number|BigNumber, expiresMs?:number): Promise<ApproveResult> {
    try {
      const { token, identity, ledger } = await this.prepare(currency);
      const blockIndex = await ledger.approve({
        amount: this.toBingInt(amount, token.decimal),
        spender: {
          owner: to,
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

  async allowance(currency:string, to:Principal): Promise<AllowanceResult> {
    try {
      const { token, identity, ledger } = await this.prepare(currency);
      const result = await ledger.allowance({
        account: {
          owner: identity.getPrincipal(),
          subaccount:[]
        },
        spender: {
          owner: to,
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

  async transferFrom(currency:string, from:Principal, amount:number|BigNumber): Promise<TransferResult> {
    try {
      const { token, identity, ledger } = await this.prepare(currency);
      const blockIndex = await ledger.transferFrom({
        from: {
          owner: from,
          subaccount:[]
        },
        to: {
          owner: identity.getPrincipal(),
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

  private async prepare(currency:string):Promise<Prepared> {
    const token = supportedTokens[currency];
    if (!token) {
      throw new Error(`${currency} not supporeted`);
    }

    // Logic imported from driveOperationService#callBackendCanister()
    const { AuthClient } = await import('@dfinity/auth-client');
    const authClient = await AuthClient.create();
    const identity = authClient.getIdentity();

    const host = process.env.EXPO_PUBLIC_ICP_MAINNET_URL; // FIXME
    const agent = new HttpAgent({
      identity,
      host,
      shouldFetchRootKey: (host != "https://ic0.app"), // true if local
    });

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
