YUI.add("t-main-tmpl-icons", function(Y) { Y.namespace("iot.main.tmpl.icons").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='  ';
 Y.Array.each(this.icons, function (icon) { 
$t+='\n  <li>\n  <a href="" class="icon" data-module="'+
$e($v( icon.name ))+
'" data-fn="'+
$e($v( icon.fn ))+
'">\n    '+
$e($v( icon.title ))+
'\n  </a>\n  </li>\n  ';
 }); 
$t+='\n';
return $t;
}});