YUI.add("t-core-manage-tmpl-snap", function(Y) { Y.namespace("DEMO.CORE.MANAGE.TMPL.SNAP").template = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="snap-representation">\n  <h1>'+
$e($v( this.name ))+
'</h1>\n  <p class="version">Ver. '+
$e($v( this.version ))+
'\n  <p>\n  ';
 if (this.description && this.description.length) { 
$t+='\n  '+
$e($v( this.description ))+
'\n  ';
 } else { 
$t+='\n    This package has no description.\n  ';
 } 
$t+='\n  <div class="services">\n    ';
 if (this.services && this.services.length) { 
$t+='\n    <h1>Services</h1>\n    ';
 Y.Array.each(this.services, function (service) { 
$t+='\n    <ul>\n      ';
 Y.Object.each(service, function (v, k) { 
$t+='\n      <li>'+
$e($v( k ))+
': '+
$e($v( v ))+
'</li>\n      ';
 }); 
$t+='\n    </ul>\n    ';
 }); 
$t+='\n    ';
 } else { 
$t+='\n      <p>This package has no services.\n    ';
 } 
$t+='\n  </div>\n</div>\n';
return $t;
}});