YUI.add("t-tmpls-settings-list", function(Y) { Y.namespace("iot.tmpls.settings.list").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="row">\n<div class="inner-wrapper">\n  ';
 Y.Object.each(this, function (val, key) { 
$t+='\n  <p>'+
$e($v( key ))+
': '+
$e($v( val ))+
'\n  ';
 }); 
$t+='\n</div>\n</div>\n';
return $t;
}});