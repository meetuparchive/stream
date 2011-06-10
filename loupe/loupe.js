(function($){
     var MEETUP = 'http://meetup.com' 
     , T = {
         glink: function(p) {
             return [MEETUP, p.photo_album.group.urlname].join('/');
         }
         , plink: function(p){
           return [T.glink(p)
                   , 'photos'
                   , p.photo_album.photo_album_id
                   , p.photo_id].join('/');
         }
         , elink: function(p) {
             return [T.glink(p), 'events', p.photo_album.event.id].join('/');
         }
         , mlink:  function(p, t) {
             return [T.glink(p), 'members', p.member.member_id].join('/');
         }
         , a: function(href, txt) {
             return ['<a href="',href,'" target="_blank">',txt,'</a>'].join('');
         }
         , desc: function(p) {
             return p.photo_album.event ?
                  [T.a(T.mlink(p), p.member.name)
                  , " at "
                  , T.a(T.elink(p), p.photo_album.event.name)
                  , " with "
                  , T.a(T.glink(p), p.photo_album.group.name)
                  , ' <span class="time">uploaded '
                   , mu.Time.ago(p.ctime)
                   , '</span>'].join('')
                  : [T.a(T.mlink(p), p.member.name)
                  , " with "
                  , T.a(T.glink(p), p.photo_album.group.name)
                  , ' <span class="time">uploaded '
                  , mu.Time.ago(p.ctime)
                  , '</span>'].join('');
         }
         , img: function(src, classes, alt){
             return ['<img src="',src,'" alt="',(alt||'Group Photo'),'" class="',(classes||''),'"/>'].join('');
         }
         , div:  function(content, classes) {
             return ['<div class="',(classes||''),'">', content, '</div>'].join('');
         }
         , thumb: function(p) {
             return ['<a href="',T.plink(p),'" target="_blank" class="thumb"><span>',T.img(p.photo_link, "pho"),'</span></a>'].join('');
         }
         , full: function(p) {
            return T.div(['<a href="',T.plink(p)
                          ,'" class="full" target="_blank"><span>'
                          ,T.img(p.photo_link, "pho")
                          ,'</span></a>', T.div(T.desc(p), "desc")].join(''));
        }
    }
    , Flagged = ['entrepreneur'
        , 'workathome'
        , 'networkmarket'
        , 'figuredrawing'
        , 'modeling'
        , 'wingman',
        , 'model-photography'
        , 'studio-photography']
    , inappropriate = function(t) {
        return Flagged.indexOf(t.urlkey) !== -1;
    }, PHOH = 150, TBPAD = 75, SPEED = 500, SCROLL_SPEED = 200;

    $(function() {
        var bg = $("#bg .reel")
        , fg = $("#fg .reel")
        , hl = $("#highlight")
        , queue = []
        , processing = []
        , processing = false
        , calculateCells = function() {
            var c = 0|(($(window).height()-TBPAD) / PHOH);
            /* ensure an odd number of cells, so center represents a `focused` photo */
            return (c % 2 !== 0) ? c : c - 1;
        }
        , cells = calculateCells()
        , focusedPhoto = function() {
             var mint = hl.offset().top
            , maxt = mint + PHOH
            , thumbs = $("#bg div.reel .t");
            for(var i = 0, tl = thumbs.size(); i<tl; i++) {
                var t = $(thumbs[i]);
                if(t && t.offset){                
                    var ttop = t.offset().top;
                    if(ttop >= mint && ttop <=maxt) {
                        return t.data();           
                    }
                }
            }
            return null;
        }
        , refocus = function() {
            var focused = focusedPhoto();
            if(focused) {
                fg.find("div.focused").html(T.div(T.full(focused), "f"));    
            }
        }
        , updateNav = function() {
            var earlier = $("#earlier")
            , later = $("#later")
            , thumbs = bg.find("div.t")
            , head = thumbs[0]
            , last = thumbs[thumbs.size()-1]
            , htop = hl.offset().top
            , hbot = htop + PHOH;
            if(last && ($(last).offset().top) > hbot) {
                earlier.removeClass("disabled");
            } else {
                earlier.addClass("disabled");
            }
            if(head && $(head).offset().top > htop) {
                later.addClass("disabled");
            } else if(head) {
                later.removeClass("disabled");
            }
        }
        , poll = function() {
            if(processing) { return; }
            var photo = queue.shift();
            if(photo) {
                processing = true;
                var thumb = $(T.div(T.thumb(photo), "t")).data(photo);
                thumb.find("img.pho").load(function() {
                   var thumbs = bg.find("div.t")
                    , offset = 15
                    , ftop = thumbs[0]
                        ? parseInt($(thumbs[0]).css("top").replace("px",""))
                        : 0
                    , htopmin = hl.offset().top
                    , htopmax = htopmin + PHOH;
                    var top = !thumbs[0] || (
                        ftop+offset >= htopmin && ftop+offset <= htopmax
                        )
                        ? (PHOH*(0|cells/2)) - offset
                        : ftop - PHOH - 2;
                    thumbs.css({top:top});
                    bg.prepend(thumb)
                    thumb.animate({top:top}, SPEED, function(){
                       refocus();
                       updateNav();
                       processing = false;
                    });
               });
            }
        }
        , onResize = function() {
            cells = calculateCells();
            bg.css({'height':cells*PHOH+"px"});
            hl.css({'top':((0|cells/2))*PHOH+"px"});
            refocus();
            updateNav();
        };
        onResize();
        $(window).resize(onResize);
        var onUp = function() {
            if(!$("#earlier").hasClass("disabled") && !processing) {
                processing = true;
                $("#bg .reel div.t").animate({top:"-="+PHOH}, SCROLL_SPEED, function(){
                    refocus();
                    updateNav();
                    processing = false;
                });
            }
        }
        , onDown = function() {
            if(!$("#later").hasClass("disabled") && !processing) {
                processing = true;
                $("#bg .reel div.t").animate({top:"+="+PHOH}, SCROLL_SPEED, function(){
                    refocus();
                    updateNav();
                    processing = false;
                });
            }
        };
        $("#earlier").bind('click', function(e){
            e.preventDefault();
            onUp();
            return false;
        });
        $("#later").bind('click', function(e){
            e.preventDefault();
            onDown();
            return false;
        });
        $(window).bind('keydown', function(e){
           switch(window.event ? e.window.keyCode : e.which) {
           case 38/*arrow up*/: onDown(); break;
           case 40/*arrow down*/: onUp(); break;
           }
        });
        setInterval(poll, 3000);
        mu.Stream({
            url: "http://stream.meetup.com/2/photos",
            callback: function(photo) {
                var topics = photo.photo_album.group.group_topics;
                if(!topics || topics.filter(inappropriate).length<1) {
                    queue.push(photo);
                }
            }
        });
    });
})(jQuery);