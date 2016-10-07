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

$("#map .present").live('mouseenter mouseleave', function(e) {
  var r = $(this), x = e.clientX, y = e.clientY, bubbleOpts = {
      alwaysVisible: true,
      themePath: '../images/jquerybubblepopup-theme',
      themeName: 'all-black',
      width:250,
      innerHtml: r.data()['rsvp']
  };;
  /* jquery bubblepopup doesn't do a great job at positioning when close to edge, rectify this using x, y */
  if(x < 20) {
      bubbleOpts.position = 'right';
  } else if(x < 150) {
      bubbleOpts.align = 'left';
      bubbleOpts.tail = {
          align: 'left'
      };
  }
  if(y < 80) {
      bubbleOpts.position = 'bottom';
  }
  if(e.type === 'mouseenter') {
      $(r.children()[0]).animate({ "opacity":1 }, 500);
      if(!r.HasBubblePopup()) {
        r.CreateBubblePopup(bubbleOpts);
      }
      r.ShowBubblePopup();
  } else if(e.type==='mouseleave') {
      $(r.children()[0]).animate({ "opacity":0.25 }, 500);
      if(r.HasBubblePopup()) {
          r.HideBubblePopup();
      }
  }
});

var Map = (function() {
    po = org.polymaps,
    map = po.map()
        .container(document.getElementById("map")
                   .appendChild(po.svg("svg")))
        .center({lat: 27, lon: 105})
        .zoom(1.8)
        .add(po.interact())
        .add(po.image()
            .url("http://s3.amazonaws.com/com.modestmaps.bluemarble/{Z}-r{Y}-c{X}.jpg"))
        .add(po.compass().pan("none"));

    var load = function(e) {
      for (var i = 0, len = e.features.length; i < len; i++) {
        var feature = e.features[i],
           rsvp = feature.data.properties.rsvp;
           
          var f = $(feature.element, $("#map").svg()), p = f.parent(), t = f.attr("transform"),
            m = /translate\((\S+),(\S+)\)/.exec(t), tx = parseFloat(m[1]), ty = parseFloat(m[2]);

          p.addClass("present").attr("id", "r-"+uuid++);

          f.attr({"transform":  "translate("+tx+","+(ty-30)+")"});
          f.animate({ "opacity":0.5, svgTransform:t }, 500)
              .addClass(rsvp.response === "yes" ? "rsvp-yes" : "rsvp-no");

          simpleMsg = ['<div class="rsvp"><span class="member-photo"><img src="',rsvp.member.photo,
                 '"/></span><div class="member-info"> <span class="member">', rsvp.member.member_name,
                       '</span><br/><span class="will-mup"> will meetup with</span><br/> <span class="group">', rsvp.group.group_name, '</span><br/><span class="place">in ',
                       rsvp.group.group_city, ', ',
                        (rsvp.group.group_state ? rsvp.group.group_state : rsvp.group.group_country).toUpperCase(),
                       '</span></div>'].join(''),

          msg = ['<div class="rsvp"><span class="member-photo"><img src="',rsvp.member.photo,
                 '"/></span><div class="member-info"> <span class="member">', rsvp.member.member_name,
                 '</span><span class="will-mup"> will meetup with</span><br/> ',
                 '<span class="group">', rsvp.group.group_name,
                 '</span><br/><span class="place">in ', rsvp.group.group_city, ', ',
                 (rsvp.group.group_state ? rsvp.group.group_state : rsvp.group.group_country).toUpperCase(),
                 '</span><br/> <span class="time" mtime="', rsvp.mtime,
                 '">', mu.Time.ago(rsvp.mtime), '</span></div></div>'].join('');

          p.data('rsvp', simpleMsg);

          /* push this map entry in a queue to be removed from the dom at a given time */
          rsvps.push({ id: p.attr("id"), time: +new Date() });

          var depth = Math.min(rsvps.length, 60);
          if (depth > 1) {
              var rate = (depth - 1) * 60 * 1000 / (rsvps[rsvps.length-1].time - rsvps[rsvps.length - depth].time);
              $("span#rate .r").text(Math.round(rate));
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
    };

    return {
      plot: function(rsvp) {
        map.add(po.geoJson()
          .features([{
             geometry: {
               coordinates: [
                 parseFloat(rsvp.group.group_lon), parseFloat(rsvp.group.group_lat)],
                 type: "Point",
                 radius: 10,
                 text: rsvp.venue && rsvp.venue.venue_name || ""
             },
             properties: {
                rsvp: rsvp
             }
          }]).on("load", load));
        }
    };
})();

var stm = must.Rsvps(function(rsvp) {
    if (rsvp.member.photo != undefined && rsvp.response === "yes")
        Map.plot(rsvp);
});

$(window).bind("unload", function() {
  $("*").add(document).unbind();
});
setTimeout(function() {
  // you win, memory leaks! (reload after 6 hours)
  window.location.reload();
}, 21600000);
