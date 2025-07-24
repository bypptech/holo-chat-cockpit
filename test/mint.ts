import { HttpAgent } from '@dfinity/agent';
import { IcrcLedgerCanister } from "@dfinity/ledger-icrc";
import { Principal } from "@dfinity/principal";
import { Secp256k1KeyIdentity } from "@dfinity/identity-secp256k1";
import BigNumber from "bignumber.js";

export interface Token {
  principal: Principal;
  decimal: number;
}
const supportedTokens:{[key:string]: Token} = {
  "ICP": {
    principal: Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai"),
    decimal: 8,
  },
  "ckUSDC": {
    principal: Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai"),
    decimal: 6,
  }
};

// Arguments 
if (process.argv.length != 2 + 3) {
  console.log("Usage: node test/mint.ts <receive address> <ICP|ckUSDC> <amount>");
  process.exit(1);
}
const receivePrincipal = Principal.fromText(process.argv[2]);
const currency = process.argv[3];
const token = supportedTokens[currency];
if (!token) {
  console.log(`${currency} not supporeted.`);
  process.exit(1);
}
const amount = BigInt(BigNumber(process.argv[4]).shiftedBy(token.decimal).toFixed(0));

// Local Minter (See dfx.json)
const identity = Secp256k1KeyIdentity.fromSeedPhrase("test test test test test test test test test test test test");
const agent = new HttpAgent({
  identity,
  host: "http://localhost:4943", // local only
  shouldFetchRootKey: true, // true if local
});

// Target ledger canister
const ledgerCanister = IcrcLedgerCanister.create({
  agent: agent,
  canisterId: token.principal,
});

// get balance of Owner
await ledgerCanister.transfer({
  amount,
  to: {
    owner: receivePrincipal,
    subaccount:[]
  },
});
console.log("done.");
