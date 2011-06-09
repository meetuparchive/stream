(function($){
   var T = {
       puri: function(p){
           return ['http://meetup.com'
                   , p.photo_album.group.urlname
                   , 'photos'
                   , p.photo_album.photo_album_id
                   , p.photo_id].join('/');
       }
       , img: function(src, classes, alt){
            return ['<img src="',src,'" alt="',(alt||'Group Photo'),'" class="',(classes||''),'"/>'].join('');
       }
       , li: function(content) {
           return ['<li>', content,'</li>'].join('');
       }
        , div:  function(content, classes) {
            return ['<div class="',(classes||''),'">', content, '</div>'].join('');
        }
        , thumb: function(p) {
             return ['<a href="',T.puri(p),'" target="_blank" class="thumb"><span>',T.img(p.photo_link, "pho"),'</span></a>'].join('');
        }
        , full: function(p) {
             return ['<a href="#" class="thumb" target="_blank"><span>',T.img(p.photo_link, "pho"),'</span></a>'].join('');
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
    }, PHOH = 150, TBPAD = 75;

    $(function() {
        var bg = $("#bg .reel")
        , fg = $("#fg .reel")
        , hl = $("#highlight")
        , queue = []
        , calculateCells = function() {
            /* floor of window.height-padding / photo height */
            var c = 0|(($(window).height()-TBPAD) / PHOH);
            /* ensure an odd number of cells */
            return (c % 2 !== 0) ? c : c - 1;
        }
        , cells = calculateCells()
        , poll = function() {
            var photo = queue.shift();
            if(photo) {
                var thumb = $(T.div(T.thumb(photo), "t"));
                thumb.find("img.pho").load(function() {
                    var thumbs = bg.find("div.t")
                    , top = true//thumbs.size() < cells
                        ? (PHOH*(0|cells/2)) /* middle */
                        : parseInt($(thumbs[0]).css("top").replace("px","")) - PHOH;
                    bg.prepend(thumb);

                    top -= 20;
                    thumb.animate({top:top}, 800, function(){
                        /*done animating, do any nessessary readjusting*/
                        var full = $(T.div(T.full(photo), "f"));
                       // full.css({top:fg.height()/2+full.height()/2});
                        fg.html(full);
                    });
               });
            }
        }
        , onResize = function() {
            cells = calculateCells();
            bg.css({'height':cells*PHOH+"px"});
            hl.css({'top':((0|cells/2))*PHOH+"px"});
        };
        onResize();
        $(window).resize(onResize);
        setInterval(poll, 2000);
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