import Blob "mo:core/Blob";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Int "mo:core/Int";
import Iter "mo:core/Iter";
import Map "mo:core/Map";
import Principal "mo:core/Principal";
import IC "ic:aaaaa-aa";

shared ({caller = owner}) persistent actor class Backend() {
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

  public func gacha_drive_request(auth_token : Text) : async Text {
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

  public shared ({caller}) func setPaymentWallet(principal:Principal) : async Bool {
    if (caller != owner) {
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
    };
  };

  public shared ({caller}) func updatePrice(currency:Text, price:Nat) : async Bool {
    if (caller != owner) {
      return false;
    };

    let valueOpt = Map.get(priceMap, Text.compare, currency);
    switch (valueOpt) {
      case (?value) {
        let newValue : Price = {
          price;
          oldPrice = value.price;
          lastUpdated = Time.now();
        };
        ignore Map.replace(priceMap, Text.compare, currency, newValue);
        return true;
      };
      case null {
        return false;
      };
    };
  };
};
