YUI.add("t-tmpls-snap-body", function(Y) { Y.namespace("iot.tmpls.snap.body").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="snap">\n  <h1>'+
$e($v( this.title ))+
'</h1>\n  <!-- this is just to list out the props in the model for convienience -->\n  <img src="'+
$e($v( this.icon_url ))+
'" width="256" height="256" />\n  ';
 Y.Object.each(this, function (value, key) { 
$t+='\n  <p>'+
$e($v( key ))+
':\n  ';
 if (Y.Lang.isObject(value)) { 
$t+='\n  ';
 Y.Object.each(value, function (value, key) { 
$t+='\n  <p>'+
$e($v( key ))+
': '+
$e($v( value ))+
'\n  ';
 }); 
$t+='\n  ';
 } else { 
$t+='\n  '+
$e($v( value ))+
'\n  ';
 } 
$t+='\n  ';
 }); 
$t+='\n\n</div>\n<nav class="snap-nav-detail">\n<ul>\n  <li><a class="active" href="/apps/'+
$e($v( this.name ))+
'/details">Details</a></li>\n  <li><a href="/apps/'+
$e($v( this.name ))+
'/reviews">Reviews</a></li>\n  <li><a href="/apps/'+
$e($v( this.name ))+
'/settings">Settings</a></li>\n</ul>\n</nav>\n';
return $t;
}});