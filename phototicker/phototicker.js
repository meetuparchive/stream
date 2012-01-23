(function($, mu) {
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
 $(function() {
   var content = $("#content")
   , blacklist = [
       'naturism',
       ,'figuredrawing',
       ,'beautyindustry',
       ,'modeling',
       ,'model-photography',
       ,'studio-photography'
    ]
    , blacklisted = function(topic) {
       return blacklist.indexOf(topic.urlkey) !== -1; 
    }
    , queue = []
    , enqueue = function(p) {
        var topics = p.photo_album.group.group_topics;
        if(!topics || topics.filter(blacklisted).length < 1) {
          queue.push(p);
        }
    }
    , dequeue = function() {
        return queue.shift();
    }
    , pollInterval = 5000
    , maxPhotos = 2
    , img = function(src) {
        return '<img src="'+src+'"/>';
    }
    , render = function(p) {
        return '<li><div class="p">' + img(p.highres_link) + '</div></li>';
    }
    , process = function(p) {
      if(p.photo_album.event) {
        var el = $(render(p))
          , photos = content.children()
          , psize = photos.size();
        photos.each(function(i) {
          if (i < psize - maxPhotos) $(this).remove();
        });
        el.hide();
        content.prepend(el);
        $('#caption').slideUp('fast');
        el.find('.p img').load(function() {
          el.animate({ height: 'show' }, 700, function() {
            var pa = p.photo_album;
            $('#group').html(pa.group.name);
            $('#event').html(pa.event.name);
            $('#caption').slideDown('slow');            
          });          
        });
      }
    }
    , pollq = function() {
      var p = dequeue();
      if(p) process(p);
    }
    , params = {
        since_count: 10
    };          
    mu.Photos(enqueue, params);
    setInterval(pollq, pollInterval);
  });
})(jQuery, mu);