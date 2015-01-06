YUI.add("t-core-settings-tmpl-list", function(Y) { Y.namespace("iot.core.settings.tmpl.list").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="about">\n  ';
 Y.Object.each(this, function (val, key) { 
$t+='\n  <p>'+
$e($v( key ))+
': '+
$e($v( val ))+
'\n  ';
 }); 
$t+='\n</div>\n';
return $t;
}});