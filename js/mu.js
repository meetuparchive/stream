mu = {};

mu.Rsvps = function(callback) {
    mu.Stream({
        url: "http://www.dev.meetup.com:8100/2/rsvps",
        callback: callback
    });
}

  /**
   * @param config object that defines the following options
   *  host - websocket host for stream
   *  callback - callback for messages, parameter is one JS object
   *  log    - function that logs a msg
   *  error  - function called when an error occurs
   */
mu.Stream = function(config) {
    var url = config.url || "http://stream.meetup.com/2/rsvps",
      wsUrl = config.wsUrl || url.replace(/^http/, 'ws'),
      log = config.log || function(msg) { },
      error = function(msg) {
         alert(msg);
      },
      handleJson = function(rsvp) {
        if(typeof config.callback === "function") {
            config.callback(rsvp);
        } else {
            error("callback is not a function");
        }
      };

    if(window.WebSocket) {
        var s = new WebSocket(wsUrl);
        s.onmessage = function(e) {
            log(e);
            handleJson(JSON.parse(e.data))
        }
    } else {
        var successCallback = function(ary) {
            var newest = 0;
            if (ary) for (i in ary) {
                handleJson(ary[i])
                newest = Math.max(newest, ary[i].mtime);
            }
            var params = {};
            if (newest > 0)
                params = { since_mtime: newest }
            $.ajax({
                url: url,
                data: params,
                dataType: 'jsonp',
                jsonpCallback: "jsonpcallback",
                success: successCallback
            });
        };
        $(window).load(function () {
            successCallback();
        });
    }
}