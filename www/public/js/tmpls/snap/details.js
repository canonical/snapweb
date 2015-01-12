YUI.add("t-tmpls-snap-details", function(Y) { Y.namespace("iot.tmpls.snap.details").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<!-- same model data available in details template -->\n  ';
 Y.Object.each(this, function (value, key) { 
$t+='\n  <p>'+
$e($v( key ))+
':\n  ';
 if (Y.Lang.isObject(value)) { 
$t+='\n  ';
 Y.Object.each(value, function (value, key) { 
$t+='\n  <p>'+
$e($v( key ))+
': '+
$e($v( value ))+
'\n  ';
 }); 
$t+='\n  ';
 } else { 
$t+='\n  '+
$e($v( value ))+
'\n  ';
 } 
$t+='\n  ';
 }); 
$t+='\n';
return $t;
}});