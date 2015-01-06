YUI.add("t-core-settings.old-tmpl-list", function(Y) { Y.namespace("iot.core.settings.old.tmpl.list").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="icon-list">\n  ';
 Y.Array.each(this.groups, function (group) { 
$t+='\n  <div class="title">'+
$e($v( group.title ))+
'</div>\n  ';
 Y.Array.each(group.items, function (icon) { 
$t+='\n  <div class="icon" data-module="'+
$e($v( icon.name ))+
'" data-fn="'+
$e($v( icon.fn ))+
'" data-api="'+
$e($v( icon.api ))+
'">\n    '+
$e($v( icon.title ))+
'\n  </div>\n  ';
 }); 
$t+='\n  ';
 }); 
$t+='\n</div>\n';
return $t;
}});