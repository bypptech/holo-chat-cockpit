import { HttpAgent } from '@dfinity/agent';
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

export interface GetBalanceResult {
  success: boolean;
  currency: string;
  balance?: string;
  error?: string;
}

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
    const token = supportedTokens[currency];
    if (!token) {
      return {
        success: false,
        currency,
        error: `${currency} not supporeted`,
      };
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
    const ledgerCanister = IcrcLedgerCanister.create({
      agent: agent,
      canisterId: token.principal,
    });

    // get balance of Owner
    const balance:BigInt = await ledgerCanister.balance({
      owner: identity.getPrincipal()
    });

    return {
      success: true,
      currency,
      balance: PaymentOperationService.formatBalance(balance, token.decimal, token.digits)
    }
  }

  static formatBalance(balance:BigInt, decimal:number, digits:number): string {
    return BigNumber(balance.toString()).shiftedBy(-decimal).toFixed(digits);
  }
}

export default PaymentOperationService;
