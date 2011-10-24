
var geo_ip;
var signed_url = "http://api.meetup.com/members?relation=self&order=name&offset=0&format=json&page=200&fields=geo_ip&sig_id=7230113&sig=5e3b4d6d9dc360339e131a77a57937daa623a98a&callback=?";
$.getJSON(signed_url, function(data) {
    geo_ip = data.meta.geo_ip;
});

var details = $("#details"), uuid = 0, rsvps = [], cleanupInterval = 2000, domrm = function(rid) {
    var p = $("#"+rid);
    p.animate({opacity:0, svgR:0}, 1500, function() {
        if(p.HasBubblePopup()) {
            p.RemoveBubblePopup();
        }
        p.remove();
    });
}, cleanup = function() {
    var expiry = 1800000, cutoff = new Date() - expiry;
    var i = 0;
    while(i < rsvps.length && rsvps[i].time < cutoff) {
        domrm(rsvps[i].id);
        i++;
    }
    if (i > 0) rsvps.splice(0, i)
};
setInterval(cleanup, cleanupInterval);

var updateTimes = function() {
    $(".rsvp .time").each(function() {
        var elem = $(this);
        elem.text(mu.Time.ago(elem.attr('mtime')));
    });
}
setInterval(updateTimes, 1000);



var stm = mu.Rsvps(function(rsvp) {
    var latDiff = rsvp.group.group_lat - geo_ip.lat, lonDiff = rsvp.group.group_lon - geo_ip.lon;
    var dist = Math.sqrt(latDiff*latDiff + lonDiff*lonDiff);
    console.log(rsvp.group.group_city)
    console.log(dist);
    if ( rsvp.response === "yes" && dist < 1) {
    	var now = new Date();
    	rsvp.systime = now.getTime();
        var imgCode = "";
        if (rsvp.member.photo != undefined) {
    	 	imgCode = '<img src="'+rsvp.member.photo+'" />';	
        }
    	
		msg = ['<a target="_BLANK" href="', rsvp.event.event_url, '">',
               '<div class="rsvp"><span class="member-photo">',imgCode,
				 '</span><div class="member-info"> <span class="member">', rsvp.member.member_name,
                 '</span> will meetup with<br/> ',
                 '<span class="group">', rsvp.group.group_name,
                 '</span><br/> in <span class="place">', rsvp.group.group_city, ', ',
                 (rsvp.group.group_state ? rsvp.group.group_state : rsvp.group.group_country).toUpperCase(),
                 '</span><br/> <span class="time" mtime="', rsvp.systime, 
                 '">', mu.Time.ago(rsvp.systime), '</span></div></div></a>'].join('');  
                 
        /* push this map entry in a queue to be removed from the dom at a given time */
        rsvps.push({ id: "r-"+uuid++, time: +new Date() });

    	var depth = Math.min(rsvps.length, 60);
        if (depth > 1) {
        	var rate = (depth - 1) * 60 * 1000 / (rsvps[rsvps.length-1].time - rsvps[rsvps.length - depth].time);
            $("#r").text(Math.round(rate));
        }
        
        var details = $("#rsvp-detail"),
            detail = $(msg).hide(),
            showDetail = function() {
              details.prepend(detail);
              detail.css({opacity:0}).animate({height:'toggle', opacity:1}, 500, function() {
                details.children().each(function(idx) {
                  if (idx > 10) $(this).remove();
                });
                  details = null;
              });

            };
          setTimeout(showDetail, 500);
    }
});

$(window).bind("unload", function() {
  $("*").add(document).unbind();
});
setTimeout(function() {
  // you win, memory leaks! (reload after 6 hours)
  window.location.reload();
}, 21600000);
