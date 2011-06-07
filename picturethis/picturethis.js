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
    var SIDE_MARGIN = 150, PHOTO_W = 168, TOP_MARGIN = 70, PHOTO_H = 169;
    var photos = $("#photos"),
        all = function() { return photos.children() };
    var columns = function () {
        return Math.floor(($(window).width() - SIDE_MARGIN*2) / PHOTO_W);
    }
    var resizeGrid = function() {
        $("#container").width(columns() * PHOTO_W);
        // remove any photos that go over the limit
        all().slice(rows() * columns()).remove();
    }
    var rows = function() {
        return Math.max(1,
            Math.floor(($(window).height() - TOP_MARGIN) / PHOTO_H));
    };
    $(function() {
        resizeGrid();
        $(window).resize(resizeGrid);
        $(window).resize(rows);
        var twt = function(url) {
            return ['<a href="http://twitter.com/share" class="twitter-share-button"'
                    , ' data-text="Picture this..." data-count="horizontal"'
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
                            , biglink, '"/>'
                            , '<img class="smlogo" src="../img/meetup.png"/>'
                            , '</a><div>'
                            , twt(mulink)
                            , '</div>'].join(''));
            rltwt();
            $.facebox({div: '#big'});
            return false;
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
                    var count = all().size();
                    if(count >= rows() * columns()) {
                        var c = all()[Math.floor(Math.random() * count)];
                        $(c).fadeOut(1000, function() {
                            $(this).replaceWith(p.fadeIn(500));
                        });
                    } else {
                        photos.append(p.fadeIn(500));
                    }
                });
            } /* else no photo */
        };

        var go = function() {
            setInterval(poll, 3000);
        }
        , Flagged = ['entrepreneur'
                     ,'workathome'
                     ,'networkmarket'
                     ,'figuredrawing'
                     ,'modeling'
                     ,'wingman',
                     ,'model-photography'
                     ,'studio-photography']
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
