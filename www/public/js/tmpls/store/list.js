YUI.add("t-tmpls-store-list", function(Y) { Y.namespace("iot.tmpls.store.list").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="package-list">\n  ';
 Y.Array.each(this, function (pkg) { 
$t+='\n  <div class="pkg" data-pkg="'+
$e($v( pkg.name ))+
'">\n    <img class="pkg-img" src="'+
$e($v( pkg.icon_url ))+
'" />\n    <p class="pkg-name">\n      <a href="/apps/'+
$e($v( pkg.name ))+
'">'+
$e($v( pkg.name ))+
'</a>\n      <a class="pkg-show hide" href="" target="_blank">SHOW</a>\n    <p class="pkg-title">'+
$e($v( pkg.title ))+
'\n    <p class="pkg-publisher">'+
$e($v( pkg.publisher ))+
'\n    <div class="switch thinking">\n      <label for="'+
$e($v( pkg.name ))+
'" class="tt-w" data-tt="…">Checking status...</label>\n      <input disabled type="checkbox" id="'+
$e($v( pkg.name ))+
'" />\n      <div class="thing"></div>\n    </div>\n    <p><a href="/store/'+
$e($v( pkg.name ))+
'/reviews">Reviews</a>\n    <p><a href="/store/'+
$e($v( pkg.name ))+
'/settings">Settings</a>\n  </div>\n  ';
 }); 
$t+='\n</div>\n';
return $t;
}});