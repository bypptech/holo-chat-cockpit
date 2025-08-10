// Based on https://dashboard.internetcomputer.org/canister/xevnm-gaaaa-aaaar-qafnq-cai
import Blob "mo:core/Blob";
import Nat "mo:core/Nat";
import Nat64 "mo:core/Nat64";
import Principal "mo:core/Principal";

module {
  public type Account = { owner : Principal; subaccount : ?Blob };
  public type Allowance = {
    from_account : Account;
    to_spender : Account;
    allowance : Nat;
    expires_at : ?Nat64;
  };
  public type AllowanceArgs = { account : Account; spender : Account };
  public type Allowance_1 = { allowance : Nat; expires_at : ?Nat64 };
  public type Approve = {
    fee : ?Nat;
    from : Account;
    memo : ?Blob;
    created_at_time : ?Nat64;
    amount : Nat;
    expected_allowance : ?Nat;
    expires_at : ?Nat64;
    spender : Account;
  };  
  public type ArchivedRange_1 = {
    callback : shared query GetBlocksRequest -> async TransactionRange;
    start : Nat;
    length : Nat;
  };
   public type Burn = {
    from : Account;
    memo : ?Blob;
    created_at_time : ?Nat64;
    amount : Nat;
    spender : ?Account;
  };

  public type GetBlocksRequest = { start : Nat; length : Nat };
  public type GetTransactionsResponse = {
    first_index : Nat;
    log_length : Nat;
    transactions : [Transaction];
    archived_transactions : [ArchivedRange_1];
  };
  public type Mint = {
    to : Account;
    memo : ?Blob;
    created_at_time : ?Nat64;
    amount : Nat;
  };
  public type Result_5 = { #Ok : Nat; #Err : TransferFromError };
  public type Transaction = {
    burn : ?Burn;
    kind : Text;
    mint : ?Mint;
    approve : ?Approve;
    timestamp : Nat64;
    transfer : ?Transfer;
  };
  public type TransactionRange = { transactions : [Transaction] };
  public type Transfer = {
    to : Account;
    fee : ?Nat;
    from : Account;
    memo : ?Blob;
    created_at_time : ?Nat64;
    amount : Nat;
    spender : ?Account;
  };  
  public type TransferFromArgs = {
    to : Account;
    fee : ?Nat;
    spender_subaccount : ?Blob;
    from : Account;
    memo : ?Blob;
    created_at_time : ?Nat64;
    amount : Nat;
  };
  public type TransferFromError = {
    #GenericError : { message : Text; error_code : Nat };
    #TemporarilyUnavailable;
    #InsufficientAllowance : { allowance : Nat };
    #BadBurn : { min_burn_amount : Nat };
    #Duplicate : { duplicate_of : Nat };
    #BadFee : { expected_fee : Nat };
    #CreatedInFuture : { ledger_time : Nat64 };
    #TooOld;
    #InsufficientFunds : { balance : Nat };
  };
	public type Service = actor {
    get_transactions : shared query GetBlocksRequest -> async GetTransactionsResponse;
    icrc2_allowance : shared query AllowanceArgs -> async Allowance_1;
    icrc2_transfer_from : shared TransferFromArgs -> async Result_5;
  }
}
