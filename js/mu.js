mu = {};

mu.Rsvps = function(jsonpCallback) {
    mu.Stream({
        url: "http://stream.dev.meetup.com:8100/2/rsvps",
        callback: jsonpCallback
    });
}
mu.Photos = function(jsonpCallback) {
    mu.Stream({
        url: "http://stream.dev.meetup.com:8100/2/photos",
        callback: jsonpCallback
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
      handleJson = function(json) {
        if(typeof config.callback === "function") {
            config.callback(json);
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
            if (ary) $.each(ary, function() {
                handleJson(this);
                newest = Math.max(newest, this.mtime);
            });
            var params = {};
            if (newest > 0)
                params = { since_mtime: newest }
            $.ajax({
                url: url,
                data: params,
                dataType: 'jsonp',
                success: successCallback
            });
        };
        $(window).load(function () {
            successCallback();
        });
    }
}