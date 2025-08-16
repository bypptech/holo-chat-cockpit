
import Blob "mo:core/Blob";
import Float "mo:core/Float";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Nat8 "mo:core/Nat8";
import Nat32 "mo:core/Nat32";
import Nat64 "mo:core/Nat64";
import Principal "mo:core/Principal";
import Debug "mo:core/Debug";
import IC "ic:aaaaa-aa";
import IcpLedger "canister:icp_ledger_canister";
import XRC "canister:exchange_rate_canister";
import Ledger "ledger";
import serdeJson "mo:serde/JSON";

shared ({caller = owner}) persistent actor class Backend() = this {
  let canisterId : Principal = Principal.fromActor(this);

  var logs : [Text] = [];

  func addLog(timestamp : Int, response : Text) {
    let entry = "timestamp: " # Int.toText(timestamp) # ", response: " # response;
    logs := Array.concat(logs, [entry]);
  };

  public query func getLogs() : async [Text] {
    logs;
  };

  public query func transform({
    response : IC.http_request_result;
  }) : async IC.http_request_result {
    {
      response with headers = [];
    };
  };

  public shared ({caller}) func gacha_drive_request(auth_token : Text) : async Text {
    let url = "https://gacha-icp.kwhppscv.dev/drive";
    let request_headers = [
      { name = "User-Agent"; value = "gacha-controller" },
      { name = "x-auth-token"; value = auth_token },
    ];
    let http_request : IC.http_request_args = {
      url = url;
      max_response_bytes = null;
      headers = request_headers;
      body = null;
      method = #get;
      transform = ?{
        function = transform;
        context = Blob.fromArray([]);
      };
      is_replicated = ?false;
    };

    let http_response : IC.http_request_result = await (with cycles = 230_949_972_000) IC.http_request(http_request);

    let decoded_text : Text = switch (Text.decodeUtf8(http_response.body)) {
      case (null) { "No value returned" };
      case (?y) { y };
    };

    addLog(Time.now(), decoded_text);

    decoded_text;
  };

  type Role = {
    #User;
    #Admin;
  };

  type UserInfo = {
    name: Text;
    role: Role;
    image: ?Blob; // png format
    registerAt: Int;
  };

  let userMap = Map.fromIter<Principal, UserInfo>([
    (
      owner,
      {
        name = "";
        role = #Admin;
        image = null;
        registerAt = Time.now();
      }
    )
  ].values(), Principal.compare);

  public shared query ({caller}) func getUserInfo(): async ?UserInfo {
    return Map.get(userMap, Principal.compare, caller);
  };

  type SetUserInfoArgument = {
    name: Text;
    image: ?Blob;
  };

  public shared ({caller}) func setUserInfo(info: SetUserInfoArgument) {
    switch(Map.get(userMap, Principal.compare, caller)) {
      case (null) {
        Map.add(userMap, Principal.compare,
          caller,
          {
            name = info.name;
            role = #User;
            image = info.image;
            registerAt = Time.now();
          });
      };
      case (?currentInfo) {
        ignore Map.replace(userMap, Principal.compare, caller, {
          name = info.name;
          role = currentInfo.role;
          image = if (info.image != null) info.image else currentInfo.image;
          registerAt = currentInfo.registerAt;
        });
      };
    };
  };

  public shared ({caller}) func setUserRole(principal:Principal, role:Role): async Bool {
    // Permission check
    let ?user = Map.get(userMap, Principal.compare, caller) else {
      return false;
    };
    if (user.role != #Admin) {
      return false;
    };

    // Change Role of Target user
    switch(Map.get(userMap, Principal.compare, principal)) {
      case (null) {
        Map.add(userMap, Principal.compare,
          principal,
          {
            name = "";
            role;
            image = null;
            registerAt = Time.now();
          });
      };
      case (?currentInfo) {
        ignore Map.replace(userMap, Principal.compare, principal, {
          name = currentInfo.name;
          role;
          image = currentInfo.image;
          registerAt = currentInfo.registerAt;
        });
      };
    };
    return true;
  };

  type DeviceDetail = {
    #smartGacha: {
      url: Text;
      userAgent: Text;
      authToken: Text;
    };
  };

  type DeviceInfo = {
    name: Text;
    price: Float; // USD
    detail: DeviceDetail;
    registeredAt: Int;
  };

  type DevicePublicInfo = {
    principal: Principal;
    name: Text;
    price: Float;
    deviceType: Text;
  };

  let deviceMap = Map.empty<Principal, DeviceInfo>();

  public query func getDeviceList() : async [DevicePublicInfo] {
    let devices : [DevicePublicInfo] = Iter.toArray(
      Iter.map<(Principal, DeviceInfo), DevicePublicInfo>(
        Map.entries(deviceMap),
        func ((principal : Principal, data : DeviceInfo)) : DevicePublicInfo {
          return {
            principal;
            name = data.name;
            price = data.price;
            deviceType = debug_show(data.detail);
          }
        }
      )
    );
    return devices;
  };

  type RegisterDeviceArgument = {
    name: Text;
    price: Float;
    detail: DeviceDetail;
  };

  type RegisterDeviceResult = {
    #Ok;
    #Err : Text;
  };

  public shared ({caller}) func registerDevice(principal:Principal, device:RegisterDeviceArgument) : async RegisterDeviceResult {
    // Permission check
    let ?user = Map.get(userMap, Principal.compare, caller) else {
      return #Err("Not permitted.");
    };
    if (user.role != #Admin) {
      return #Err("Not permitted.");
    };

    if (Map.containsKey(deviceMap, Principal.compare, principal)) {
      return #Err("The device already registered.");
    };
    Map.add(deviceMap, Principal.compare,
      principal,
      {
        name = device.name;
        price = device.price;
        detail = device.detail;
        registeredAt = Time.now();
      });
    return #Ok;
  };

  type UnresigerDeviceResult = {
    #Ok;
    #Err : Text;
  };

  public shared ({caller}) func unregisterDevice(principal:Principal) : async UnresigerDeviceResult {
    // Permission check
    let ?user = Map.get(userMap, Principal.compare, caller) else {
      return #Err("Not permitted.");
    };
    if (user.role != #Admin) {
      return #Err("Not permitted.");
    };

    if (Map.delete(deviceMap, Principal.compare, principal)) {
      return #Ok;
    } else {
      return #Err("The device not registered.");
    };
  };

  public shared ({caller}) func runDeviceAfterPayment(deviceId:Principal, currency:Text) : async Text {
    let ?device = Map.get(deviceMap, Principal.compare, deviceId) else return "Device not found";
    let ?token = Map.get(tokenMap, Text.compare, currency) else return "Unsupported currency";
    let priceToken = toNat(currency, device.price);

    // check allowance
    let ledger = actor(Principal.toText(token.canisterId)) : Ledger.Service;
    let allowance = await ledger.icrc2_allowance({
      account = {
        owner = caller;
        subaccount = null;
      };
      spender = {
        owner = canisterId;
        subaccount = null;
      };
    });
    if (allowance.allowance < priceToken) {
      return "Insufficient balance";
    };

    var result : Text = "";
    switch (device.detail) {
      case (#smartGacha(detail)) {
        let http_request : IC.http_request_args = {
          url = detail.url;
          max_response_bytes = null;
          headers = [
            { name = "User-Agent"; value = detail.userAgent },
            { name = "x-auth-token"; value = detail.authToken },
          ];
          body = null;
          method = #get;
          transform = ?{
            function = transform;
            context = Blob.fromArray([]);
          };
          is_replicated = ?false;
        };
        let http_response : IC.http_request_result = await (with cycles = 230_949_972_000) IC.http_request(http_request);
        result := switch (Text.decodeUtf8(http_response.body)) {
          case (null) { 
            "No value returned";
          };
          case (?json) {
            switch (serdeJson.fromText(json, null)) {
              case (#ok(blob)) { 
                type Result = {
                  command: Text;
                  result: Text;
                };
                let ?parsed = (from_candid(blob) : ?Result) else return "Unexpected JSON format.";

                parsed.result;
              };
              case (#err(msg)) {
                msg;
              };
            };
          };
        };
      };
    };

    // payment
    var log = result # ", device: " # device.name;
    if (result == "ok") {
      let transferResult = await ledger.icrc2_transfer_from({
        from = {
          owner = caller;
          subaccount = null;
        };
        to = {
          owner = paymentWallet;
          subaccount = null;
        };
        amount = priceToken;
        // optional
        created_at_time = null;
        fee = null;
        memo = null;
        spender_subaccount = null;
      });
      switch(transferResult) {
        case (#Ok(ledgerIndex)) {
          log := log # ", currency: " # currency # ", ledgerIndex: " # Nat.toText(ledgerIndex);
        };
        case (#Err(error)) {
          // FIXME gacha executed, but payment failed
          result := debug_show(error);
          log := result # ", device: " # device.name;
        };
      };
    };

    addLog(Time.now(), log);
    return result;
  };

  // payment
  var paymentWallet : Principal = owner;

  type Token = {
    canisterId: Principal; // Ledger Canister Id
    decimal: Nat8;
    digits: Nat8;
    fee: Nat; // transaction fee
  };

  type Price = {
    price: Nat;
    oldPrice: Nat;
    lastUpdated: Int;
  };

   type PaymentInfo = {
    paymentWallet: Principal;
    tokens: [(Text, Token)];
    prices: [(Text, Nat)];
    rates: [(Text, Float)];
  };

  transient let tokenMap = Map.fromIter<Text, Token>([
    (
      "ICP",
      {
        canisterId = Principal.fromText("ryjl3-tyaaa-aaaaa-aaaba-cai");
        decimal = 8 : Nat8;
        digits = 4 : Nat8;
        fee = 10_000; // 0.0001
      }
    ),
    (
      "ckUSDC",
      {
        canisterId = Principal.fromText("xevnm-gaaaa-aaaar-qafnq-cai");
        decimal = 6 : Nat8;
        digits = 2 : Nat8;
        fee = 10_000; // 0.01
      }
    )
  ].values(), Text.compare);

  var priceMap = Map.fromIter<Text, Price>([
    (
      "ICP",
      {
        price = 20_000_000; // FIXME 0.2 ICP ($ 5 / ICP) on 2025/08/06
        oldPrice = 20_000_000;
        lastUpdated = 0 : Int;
      },
    ),
    (
      "ckUSDC",
      {
        price = 1_000_000; // 1.0
        oldPrice = 1_000_000;
        lastUpdated = 0 : Int;
      }
    )
  ].values(), Text.compare);

  var rateMap = Map.fromIter<Text, Float>([
    ("ICP", 0.2),
    ("ckUSDC", 1.0),
  ].values(), Text.compare);

  public shared ({caller}) func setPaymentWallet(principal:Principal) : async Bool {
    // Permission check
    let ?user = Map.get(userMap, Principal.compare, caller) else {
      return false;
    };
    if (user.role != #Admin) {
      return false;
    };

    paymentWallet := principal;
    return true;
  };

  public query func getPaymentInfo() : async PaymentInfo {
    let prices : [(Text, Nat)] = Iter.toArray(
      Iter.map<(Text, Price), (Text, Nat)>(
        Map.entries(priceMap),
        func ((k, v)) { (k, v.price) }
      )
    );

    return {
      paymentWallet;
      tokens = Iter.toArray(Map.entries(tokenMap));
      prices;
      rates = Iter.toArray(Map.entries(rateMap));
    };
  };

  type SetPriceResult = {
    #Ok : [(Text, Nat)];
    #Err : Text;
  };

  public shared ({caller}) func setPrice(dollar:Float) : async SetPriceResult {
    if (caller != owner and caller != canisterId) {
      return #Err("Not permitted.");
    };

    // xrc target currencies
    var currencies : [Text] = [];
    for (currency in Map.keys(priceMap)) {
      if (currency != "ckUSDC") {
        currencies := Array.concat(currencies, [currency]);
      }
    };

    var futures : [async XRC.GetExchangeRateResult] = [];
    for (currency in currencies.values()) {
      futures := Array.concat(futures, [(with cycles = 10_000_000_000) XRC.get_exchange_rate({
        base_asset = {
          class_ = #Cryptocurrency;
          symbol = "USDC";
        };
        quote_asset = {
          class_ = #Cryptocurrency;
          symbol = Text.replace(currency, #text "ck", "");
        };
        timestamp = null;
      })]);
    };

    var rates : [Float] = [];
    for (i in futures.keys()) {
      let currency = currencies[i];
      let result = await futures[i];
      switch (result) {
        case (#Ok(data)) {
          let rate:Float = Float.fromInt(Int.fromNat(Nat64.toNat(data.rate))) *
            Float.pow(10.0, -1 * Float.fromInt(Int.fromNat(Nat32.toNat(data.metadata.decimals))));
          rates := Array.concat(rates, [rate]);
        };
        case (#Err(err)) {
          return #Err("get_exchange_rate() failed. (" # debug_show(err) # ")");
        };
      }
    };

    let now = Time.now();
    let dollarNat = toNat("ckUSDC", dollar);
    ignore updatePrice("ckUSDC", dollarNat, now);

    var results : [(Text, Nat)] = [("ckUSDC", dollarNat)];
    for (i in currencies.keys()) {
      let currency = currencies[i];
      let newPrice = toNat(currency, dollar * rates[i]);
      ignore Map.replace(rateMap, Text.compare, currency, rates[i]);
      ignore updatePrice(currency, newPrice, now);

      results := Array.concat(results, [(currency, newPrice)]);
    };
    return #Ok(results);
  };

  func toNat(currency:Text, price:Float) : Nat {
    let ?token = Map.get(tokenMap, Text.compare, currency) else return 0;
    let validDigits : Int = Float.toInt(Float.ceil(price * Float.pow(10.0, Float.fromInt(Int.fromNat(Nat8.toNat(token.digits))))));
    return Int.abs(validDigits * Int.pow(10, Int.fromNat(Nat8.toNat(token.decimal - token.digits))));
  };

  func updatePrice(currency:Text, price:Nat, time:Int) : Bool {
    let ?value = Map.get(priceMap, Text.compare, currency) else return false; // false is not expected
    let newValue : Price = {
      price;
      oldPrice = value.price;
      lastUpdated = time;
    };
    ignore Map.replace(priceMap, Text.compare, currency, newValue);
    return true;
  };

  type PayResult = {
    #Ok : Nat;
    #Err : Text;
  };

  func pay(currency:Text, from:Principal) : async PayResult {
    let ?token = Map.get(tokenMap, Text.compare, currency) else return #Err("Unsupported Currency");
    let ?price = Map.get(priceMap, Text.compare, currency) else return #Err("Price not specified");
    let ledger = actor(Principal.toText(token.canisterId)) : Ledger.Service;
 
    let result = await ledger.icrc2_transfer_from({
      from = {
        owner = from;
        subaccount = null;
      };
      to = {
        owner = paymentWallet;
        subaccount = null;
      };
      amount = price.price - token.fee;
      created_at_time = null;
      fee = null;
      memo = null;
      spender_subaccount = null;
    });
    switch (result) {
      case (#Ok(blockIndex)) {
        return #Ok(blockIndex);
      };
      case (#Err(error)) {
        // TODO accept oldPrice for a while
        return #Err(debug_show(error)); // TODO Error message
      };
    };
  };

  public shared func checkTransaction(currency:Text, from:Principal, to:Principal, amount:Nat64, blockIndex:Nat64) : async Bool {
    if (currency == "ICP") {
      let result = await IcpLedger.query_blocks({
        start = blockIndex;
        length = 1
      });
      if (result.first_block_index <= blockIndex and result.blocks.size() == 1) {
        let ?operation = result.blocks[0].transaction.operation else return false;
        switch operation {
          case (#Transfer transfer) { 
            if (transfer.from == Principal.toLedgerAccount(from, null) and
                transfer.to   == Principal.toLedgerAccount(to,   null) and
                transfer.amount.e8s == amount) {
              return true;
            } else {
              return false;
            }
          };
          case _ {
            return false;
          };
        };
      } else {
        // TODO Maybe in archive ledger.
        return false;
      };
    } else {
      let ?token = Map.get(tokenMap, Text.compare, currency) else return false;
      let ledger = actor(Principal.toText(token.canisterId)) : Ledger.Service;
      let blockIndexNat = Nat64.toNat(blockIndex);
      let result = await ledger.get_transactions({
        start = blockIndexNat; //Nat64.toNat(blockIndex);
        length = 1;
      });
      if (result.first_index <= blockIndexNat and result.transactions.size() == 1) {
        let ?transfer = result.transactions[0].transfer else return false;
        if (transfer.from == { owner = from; subaccount = null; } and
            transfer.to   == { owner = to; subaccount = null; } and
            transfer.amount == Nat64.toNat(amount)) {
          return true;
        } else {
          return false;
        }
      } else {
        // TODO Maybe in archive ledger.
        return false;
      };
    };
 };
};
