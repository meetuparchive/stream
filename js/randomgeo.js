var RandomGeo = function(limit, interval, fn){
    // n 45 s 30
    // w -120 e -75
    var rsvps = [], randRange = function(a, b) {
        return Math.random() * (b-a) + a;
    };
    for(var i = 0; i < limit; i++) {
        rsvps.push({
            response:"yes",
            member: {
                member_name: "member_"+i,
                photo: "x.jpg"
            },
            event: {
                event_name: "event_"+i
            },
            venue: {
                venue_name: "venue_" + i,
                lat: randRange(30, 45),
                lon: randRange(-120, -75)
            }
        });
    }
    var i = setInterval(function() {
        if(rsvps.length > 0) {
            fn(rsvps.shift());
        } else {
            clearInterval(i);
        }
    }, interval);
};