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
       
   var updateId = -1, updateInterval = 1000
   , updateTimes = function() {
     $(".when").each(function() {
       var elem = $(this), mtime = elem.data() ? elem.data().mtime : undefined;
       if(mtime) {
         elem.text(mu.Time.ago(mtime));    
       }
     });
   };
       
   var pstream, dispCount = 0, content = $("#content")
   , blacklist = [
       'naturism'
       ,'figuredrawing'
       ,'beautyindustry'
       ,'modeling'
       ,'model-photography'
       ,'studio-photography'
    ]
    , blacklisted = function(topic) {
       return blacklist.indexOf(topic.urlkey) !== -1; 
    }
    , queue = []
    , enqueue = function(p) {
        var topics =  p.photo_album.group.group_topics;
        if(!topics || topics.filter(blacklisted).length < 1) {
          queue.push(p);
        }
    }
    , dequeue = function() {
        return queue.shift();
    }
    , pollInterval = 5000
    , pollId
    , maxPhotos = 1
    , img = function(src) {
        return '<img src="'+src+'"/>';
    }
    , render = function(p) {
        var pa = p.photo_album;
        return ['<li class="p-container">'
                , '<div class="p">'
                ,   img(p.highres_link)
                , '</div>'
                , '<div class="caption" class="clearfix">'
                ,  '<div class="details">'
                ,    '<div class="group">', pa.group.name, '</div>'
                ,    '<div class="event">', pa.event.name, '</div>'
                ,    '<div class="when" data-mtime="', p.mtime, '">'
                ,       mu.Time.ago(p.mtime)
                ,    '</div>'
                ,  '</div>'
                , '</li>'].join('');
    }
    , process = function(p) {
      if(p.photo_album.event) {
        dispCount++;
        var el = $(render(p))
          , photos = content.children()
          , psize = photos.size();
        // chop the tail
        var removing = [];
        photos.each(function(i) {
          if (i >= maxPhotos) {
            removing.push($(this));
          }
        });
        el.hide();
        content.prepend(el);               
        $("#waiting").slideUp('fast', function() {
           $(this).remove();                     
        });
        $('.caption', el).slideUp('fast');
          el.find('.p img').load(function() {
          for(i in removing) {
            removing[i].remove();;    
          }          
          el.animate({ height: 'show' }, 700, function() {
            $('.caption', el).slideDown('slow');
            if(updateId < 0) {
              setInterval(updateTimes, updateInterval);
            }
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
    pstream = mu.Photos(enqueue, params);
    pollId = setInterval(pollq, pollInterval);
  });
})(jQuery, mu);