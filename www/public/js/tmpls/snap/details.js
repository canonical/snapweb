YUI.add("t-tmpls-snap-details", function(Y) { Y.namespace("iot.tmpls.snap.details").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="row details">\n  <div class="inner-wrapper">\n    ';
 Y.Object.each(this, function (value, key) { 
$t+='\n    <p>'+
$e($v( key ))+
':</p>\n    ';
 if (Y.Lang.isObject(value)) { 
$t+='\n    ';
 Y.Object.each(value, function (value, key) { 
$t+='\n    <p>'+
$e($v( key ))+
': '+
$e($v( value ))+
'</p>\n    ';
 }); 
$t+='\n    ';
 } else { 
$t+='\n    '+
$e($v( value ))+
'\n    ';
 } 
$t+='\n    ';
 }); 
$t+='\n  </div>\n</div>';
return $t;
}});