import Blob "mo:base/Blob";
import Cycles "mo:base/ExperimentalCycles";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Int "mo:base/Int";
import IC "ic:aaaaa-aa";

actor {

  stable var logs : [Text] = [];

  func addLog(timestamp : Int, response : Text) {
    let entry = "timestamp: " # Int.toText(timestamp) # ", response: " # response;
    logs := Array.append(logs, [entry]);
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
    };

    Cycles.add<system>(230_949_972_000);

    let http_response : IC.http_request_result = await IC.http_request(http_request);

    let decoded_text : Text = switch (Text.decodeUtf8(http_response.body)) {
      case (null) { "No value returned" };
      case (?y) { y };
    };

    addLog(Time.now(), decoded_text);

    decoded_text;
  };

};
