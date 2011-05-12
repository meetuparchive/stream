$(function() {
    var src = window.location.hash.length > 0 ?
        window.location.hash.substr(1) : 'http://www.meetup.com/';
    $('#content').attr('src', src);
    var socket = new WebSocket("ws://stream.meetup.com/2/rsvps");

    var ticker = $('#ticker');
  
    socket.onmessage = function(event) {
        var rsvp = JSON.parse(event.data);
        if (rsvp.response != "yes") return;
        var span = $(["<div><span>", rsvp.group.group_name, "</span></div>"].join(""));
        ticker.append(span);
        var childs = ticker.children();
        var MAX = 10; // max we think might still be on screen
        childs.each(function(idx) {
            if (idx < childs.size() - MAX) $(this).remove();
        });
        span.animate({ width: 'show' }, 1000);
    };
});