YUI.add("t-core-store-tmpl-list", function(Y) { Y.namespace("DEMO.CORE.STORE.TMPL.LIST").template = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="package-list">\n  ';
 Y.Array.each(this, function (pkg) { 
$t+='\n  <div class="package-pkg">\n    <img src="'+
$e($v( pkg.icon_url ))+
'" width=32 height=32 />\n    <p>Title: '+
$e($v( pkg.title ))+
'\n    <p>Name: '+
$e($v( pkg.name ))+
'\n    <p>Publisher '+
$e($v( pkg.publisher ))+
'\n    <div class="install">\n      <button class="button-install" data-pkg="'+
$e($v( pkg.name ))+
'">Install</button>\n      <div class="install-response"></div>\n    </div>\n  </div>\n  ';
 }); 
$t+='\n</div>\n';
return $t;
}});