YUI.add("t-core-manage-tmpl-list", function(Y) { Y.namespace("DEMO.CORE.MANAGE.TMPL.LIST").template = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="snap-list">\n  ';
 Y.Array.each(this.snaps, function (snap) { 
$t+='\n  <div class="title">'+
$e($v( snap.title ))+
'</div>\n  ';
 }); 
$t+='\n</div>\n';
return $t;
}});