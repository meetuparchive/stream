(function($, mu) {
 $(function() {
    var content = $("#content")      
    , queue = []
    , enqueue = function(p) {
        queue.push(p);
    }
    , dequeue = function() {
        return queue.shift();
    }
    , pollInterval = 4000
	, maxPhotos = 10
    , img = function(src) {
        return '<img src="'+src+'"/>';
    }
    , render = function(p) {
        return ['<li><div class="p">'
                , img(p.highres_link)
                ,'</div></li>'].join('');
    }
    , process = function(p) {
      if(p.photo_album.event) {
        var el = $(render(p)), photos = content.children(), psize = photos.size();
        el.hide();
		photos.each(function(i) {
          if (i < psize) $(this).remove();
        });
        content.prepend(el);
		$('div.caption').slideUp();
        el.find('img').load(function(){
          el.fadeIn('slow');
          var pa = p.photo_album
          , group = pa.group
		  , event = pa.event;
		  $('div.caption').slideDown();
		  $('div.group').html(group.name);
		  $('div.event').html(event.name);
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