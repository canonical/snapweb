YUI.add("t-core-store-tmpl-list", function(Y) { Y.namespace("DEMO.CORE.STORE.TMPL.LIST").template = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="package-list">\n  ';
 Y.Array.each(this, function (pkg) { 
$t+='\n  <div class="pkg uninstalled" data-pkg="'+
$e($v( pkg.name ))+
'">\n    <!-- \n    <img src="'+
$e($v( pkg.icon_url ))+
'" width=128 height=128 />\n    -->\n    <p class="pkg-name">'+
$e($v( pkg.name ))+
'\n    <p class="pkg-title">'+
$e($v( pkg.title ))+
'\n    <p class="pkg-publisher">'+
$e($v( pkg.publisher ))+
'\n    <div class="switch thinking">\n      <label for="'+
$e($v( pkg.name ))+
'" class="tt-w" data-tt="…">Checking status...</label>\n      <input disabled type="checkbox" id="'+
$e($v( pkg.name ))+
'" />\n      <div class="thing"></div>\n    </div>\n  </div>\n  ';
 }); 
$t+='\n</div>\n';
return $t;
}});