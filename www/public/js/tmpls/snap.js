YUI.add("t-tmpls-snap", function(Y) { Y.namespace("iot.tmpls.snap").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="snap">\n  <p>'+
$e($v( this.title ))+
'</p>\n  <img src="'+
$e($v( this.icon_url ))+
'" />\n</div>\n';
return $t;
}});