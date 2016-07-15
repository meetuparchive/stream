;(function(window, $) {
  if (window.must !== undefined) {
      return window.must;
  }
  var mu = {};

  /** Streams public RSVP data from http://www.meetup.com/meetup_api/docs/stream/2/rsvps/#polling */
  mu.Rsvps = function(callback, params, error) {
    return mu.Stream({
      path: "/2/rsvps",
      callback: callback,
      error: error,
      params: params
    });
  };

  /** Streams public photo data from http://www.meetup.com/meetup_api/docs/stream/2/photos/#polling */
  mu.Photos = function(callback, params, error) {
    return mu.Stream({
      path: "/2/photos",
      callback: callback,
      error: error,
      params: params
    });
  };

  /** Streams public checkin data from http://www.meetup.com/meetup_api/docs/stream/2/checkins/#polling */
  mu.Checkins = function(callback, params, error) {
    return mu.Stream({
      path: "/2/checkins",
      callback: callback,
      error: error,
      params: params
    });
  };

  /** Streams public Meetup comments from http://www.meetup.com/meetup_api/docs/stream/2/event_comments/#polling */
  mu.Comments = function(callback, params, error) {
    return mu.Stream({
      path: "/2/event_comments",
      callback: callback,
      params: params,
      error: error
    });
  };

  /**
   * @param config object that defines the following options
   *  host - base host
   *  path - path of stream endpoint
   *  url - http url for the stream
   *  wsUrl - websockets url for the stream
   *  callback - callback for messages, parameter is one JS object
   *  log    - function that logs a msg
   *  error  - function called when an error occurs
   */
  mu.Stream = (function(config) {
    var $      = jQuery,
      host     = config.host  || "http://stream.meetup.com",
      path     = config.path  || "/2/rsvps"
      url      = config.url   || host + path,
      wsUrl    = config.wsUrl || url.replace(/^http/, 'ws'),
      log      = config.log   || function(msg) { },
      stopping = false,
      error = config.error || function(msg) {
          alert(msg);
      },
      handleJson = function(json) {
        if (typeof config.callback === "function") {
          config.callback(json);
        } else {
          error("callback is not a function");
        }
      },
      supportsWebsockets = function() {
        return window.WebSocket || window.MozWebSocket;
      };

    if (supportsWebsockets()) {
      if (config.params)
        wsUrl = wsUrl + "?" + $.param(config.params);
        var s = window.WebSocket ? new WebSocket(wsUrl) : new MozWebSocket(wsUrl);
        s.onmessage = function(e) {
          if (stopping) {
            s.close();
          } else {
            var ary = JSON.parse(e.data);
            if (ary.errors) {
              error(ary.errors);
            } else {
              handleJson(ary);
            }
          }
        };
      } else {
        var newest = 0,
          successCallback = function(ary) {
            if (!stopping) {
              if (ary) {
                if (ary.errors) {
                  stopping = true;
                  error(ary.errors);
                } else {
                  $.each(ary, function() {
                    handleJson(this);
                    newest = Math.max(newest, this.mtime);
                  });
                }
              }
              if (!stopping) {
                var params = config.params || {};
                if (newest > 0) {
                  params.since_mtime = newest;
                  delete params.since_count;
                }
                $.ajax({
                  url: url,
                  data: params,
                  dataType: 'jsonp',
                  success: successCallback,
                  scriptCharset: 'UTF-8'
                });
              }
            }
          };
          mu.Loader.defer(function () {
            successCallback();
          });
      }
      return {
        stop: function() {
          stopping = true;
        }
      };
  });

  // export to window
  window.must = mu;

}(this, jQuery));