import Blob "mo:core/Blob";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Int "mo:core/Int";
import IC "ic:aaaaa-aa";

persistent actor {

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

};
