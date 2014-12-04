YUI.add("t-core-store-tmpl-list", function(Y) { Y.namespace("DEMO.CORE.STORE.TMPL.LIST").template = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="package-list">\n  ';
 Y.Array.each(this, function (pkg) { 
$t+='\n  <div class="package-pkg uninstalled" data-pkg="'+
$e($v( pkg.name ))+
'">\n    <img src="'+
$e($v( pkg.icon_url ))+
'" width=128 height=128 />\n    <p>Title: '+
$e($v( pkg.title ))+
'\n    <p>Name: '+
$e($v( pkg.name ))+
'\n    <p>Publisher: '+
$e($v( pkg.publisher ))+
'\n    <div class="status">\n      <button disabled class="btn button-working">Working...</button>\n    </div>\n    <div class="install">\n      <button class="btn button-install" data-pkg="'+
$e($v( pkg.name ))+
'">Install</button>\n      <div class="install-response"></div>\n    </div>\n    <div class="uninstall">\n      <button class="btn button-uninstall" data-pkg="'+
$e($v( pkg.name ))+
'">Uninstall</button>\n      <div class="install-response"></div>\n    </div>\n  </div>\n  ';
 }); 
$t+='\n</div>\n';
return $t;
}});