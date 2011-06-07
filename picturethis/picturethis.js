if (!Array.prototype.filter){
    Array.prototype.filter = function(fun){
        var len = this.length;
        if (typeof fun != "function") { throw new TypeError(); }
        var res = [], thisp = arguments[1];
        for (var i = 0; i < len; i++) {
            if (i in this) {
                var val = this[i];
                if (fun.call(thisp, val, i, this)) { res.push(val); }
            }
        }
        return res;
    };
}

if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt) {
        var len = this.length, from = Number(arguments[1]) || 0;
        from = (from < 0)
            ? Math.ceil(from)
            : Math.floor(from);
        if (from < 0) from += len;

        for (; from < len; from++) {
            if (from in this && this[from] === elt) return from;
        }
        return -1;
    };
}
(function($) {
    var resizeGrid = function() {
        var MARGIN = 150, PHOTO_W = 168;
        var avail = $(window).width() - MARGIN*2;
        $("#container").width(avail - (avail % PHOTO_W));
    }
    $(function() {
        resizeGrid();
        $(window).resize(resizeGrid);
        var twt = function(url) {
            return ['<a href="http://twitter.com/share" class="twitter-share-button"'
                    , ' data-text="Future status:" data-count="horizontal"'
                    , ' data-url="'
                    , url
                    , '" data-related="Meetup"'
                    , ' data-via="MeetupAPI">Tweet</a>'].join('');
        }, rltwt = function() {
            /* needed for dynamic additions of tweet btns to the page. don't worry. it's cached.*/                              
            $.ajax({url:"http://platform.twitter.com/widgets.js",dataType:"script",cache:true});                           
        };
        $("#photos li").live('click', function() {
            var p = $(this).data();
            var mulink = ['http://meetup.com'
                          , p.photo_album.group.urlname
                          , 'photos'
                          , p.photo_album.photo_album_id
                          , p.photo_id].join('/')
            , biglink = p.photo_link;
            $("#big").html(['<a href="',mulink,'" target="_blank"><img src="'
                            , biglink, '"/></a><div>'
                            , twt(mulink)
                            , '</div>'].join(''));
            rltwt();
            $.facebox({div: '#big'});
        });
        var queue = []
        , poll = function() {
            var photo = queue.shift();
            if(photo) {

                if($("#big-question").is(":visible")) { $("#big-question").slideUp("slow"); }
                var mulink = ['http://meetup.com'
                              , photo.photo_album.group.urlname
                              , 'photos'
                              , photo.photo_album.photo_album_id
                              , photo.photo_id].join('/')
                , p = $([
                    '<li><span><a href="#"><img alt="Meetup Photo" class="pho" src="'
                    , photo.photo_link
                    , '"/></a></span>'
                    , '<div class="meta"><a title="comment" href="'
                    , mulink
                    , '" target="_blank">'
                    , '<img src="comment.png"/> on Meetup</a>'
                    , twt(mulink)
                    , '</div></li>'].join('')
                       );

                p.data(photo);
                /*
                  p.hover(function() {
                  var what = photo.photo_album.event ?
                  [photo.member.name
                  , " at "
                  , photo.photo_album.event.name
                  , " with "
                  , photo.photo_album.group.name].join('')
                  : [photo.member.name
                  , " with "
                  , photo.photo_album.group.name].join('');
                  $("h1 span").text(what);
                  var meta = p.find("div.meta");
                  if(meta.is(":visible")) {
                  meta.animate({"bottom":"+=55"}, 400);
                  }
                  rltwt();
                  }
                  , function() {
                  $("h1 span").empty();
                  p.find("div.meta").animate({"bottom":"-=55"}, 400);
                  }); */

                p.find("img.pho").load(function(){
                    var photos = $("#photos")
                    , all = photos.children();
                    if(photos.height() + 159 > window.innerHeight) {
                        var perRow = Math.floor(photos.width() / 159);
                        if(all.size() % perRow === 0) { /* recycle */
                            var c = all[Math.floor(Math.random() * all.size())];
                            $(c).fadeOut(1000, function() {
                                $(this).replaceWith(p.fadeIn(500));
                            });
                        } else { /* final row */
                            photos.append(p.fadeIn(500));
                        }
                    } else {
                        photos.append(p.fadeIn(500));
                    }
                });
            } /* else no photo */
        };

        var go = function() {
            setInterval(poll, 3000);
        }
        , Flagged = ['digcam'
                     ,'entrepreneur'
                     ,'singles'
                     ,'workathome'
                     ,'newlysingle'
                     ,'networkmarket'
                     ,'figuredrawing'
                     ,'couples'
                     ,'modeling'
                     ,'wingman']
        , inappropriate = function(t){
            return Flagged.indexOf(t.urlkey) !== -1;
        };
        mu.Photos(function(photo) {
            var topics = photo.photo_album.group.group_topics;
            if(!topics || topics.filter(inappropriate).length<1) {
                queue.push(photo);
            }
        });
        setTimeout(go, 2500);
    });
})(jQuery);
