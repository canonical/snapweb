YUI.add("t-core-manage-tmpl-snap", function(Y) { Y.namespace("DEMO.CORE.MANAGE.TMPL.SNAP").template = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="snap-representation">\n  <h1>Hello, I am a snap.</h1>\n  '+
$e($v( this.description ))+
'\n  '+
$e($v( this.name ))+
'\n  '+
$e($v( this.version ))+
'\n</div>\n';
return $t;
}});