mu = {};

  /**
   * @param config object that defines the following options
   *  host - websocket host for stream
   *  onRsvp - function that accepts an rsvp as they are streamed
   *  onConnect - function called when connected with host
   *  onDisconnect - function called when disconnected from host
   *  onUnsupported - function called script detects browser does not support
   *                  websockets
   *  filter - function that takes an rsvp and returns true if it should
   *           be passed to onRsvp
   *  log    - function that logs a msg
   *  error  - function called when an error occurs
   */
mu.Stream = function(config) {
    var host = config.host || "ws://stream.meetup.com/2/rsvps",
      onRsvp = config.onRsvp || function(rsvp) { },
      onConnect = config.onConnect || function() { },
      onDisconnect = config.onDisconnect || function() {  },
      onUnsupported = config.onUnsupported || function() {
        alert("your browser does not support web sockets");
      },
      filter = config.filter || function(rsvp) {
        return true;
      },
      log = config.log || function(msg) {
          if(console && console.log) { console.log(msg); }
      },
      error = function(msg) {
         alert(msg);
      };

    if(window.WebSocket) {
        var s = new WebSocket(host);
        s.onmessage = function(e) {
            log(e);
            if(typeof onRsvp === "function") {
                var rsvp = JSON.parse(e.data);
                if(typeof filter === "function") {
                    if(filter(rsvp)) {
                        onRsvp(rsvp);
                    }
                } else {
                    onRsvp(rsvp);
                }
            } else {
                error("onRsvp is not a function");
            }
        }
        s.onopen = function(e) {
            log(e);
            if(typeof onConnect === "function") {
                onConnect();
            } else {
                error("onConnect is not a function");
            }
        }
        s.onclose = function(e) {
            log(e);
            if(typeof onDisconnect === "function") {
                onDisconnect();
            } else {
                error("onDisconnect is not a function");
            }
        }
    } else {
        if(typeof onUnupported === "function") {
            onUnsupported();
        } else {
            error("onUnsupported is not a function");
        }
    }
}