YUI.add("t-main-tmpl-icons", function(Y) { Y.namespace("DEMO.MAIN.TMPL.ICONS").template = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="icon-list">\n  ';
 Y.Array.each(this.icons, function (icon) { 
$t+='\n  <div class="icon" data-module="'+
$e($v( icon.name ))+
'" data-fn="'+
$e($v( icon.fn ))+
'">\n    '+
$e($v( icon.title ))+
'\n  </div>\n  ';
 }); 
$t+='\n</div>\n';
return $t;
}});