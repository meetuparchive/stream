if(!Array.prototype.shuffle) {
  Array.prototype.shuffle = function (){
     for(var rnd, tmp, i=this.length; i; rnd=parseInt(Math.random()*i), tmp=this[--i], this[i]=this[rnd], this[rnd]=tmp);
  };
}