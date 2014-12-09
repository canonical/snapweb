YUI.add("t-core-manage-tmpl-snap", function(Y) { Y.namespace("DEMO.CORE.MANAGE.TMPL.SNAP").template = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="services">\n  <p class="pkg-name">'+
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
$t+='\n    <p>Services</p>\n    ';
 Y.Array.each(this.services, function (service) { 
$t+='\n    ';
 if (service.status === 'active') { 
$t+='\n    <div class="switch">\n      <label for="'+
$e($v( service.name ))+
'" class="tt-w" data-tt="Click to deactivate service">'+
$e($v( service.name ))+
' '+
$e($v( service.status ))+
'</label>\n      <input data-pkg="'+
$e($v( this.name ))+
'" checked type="checkbox" id="'+
$e($v( service.name ))+
'" />\n      <div class="thing"></div>\n    </div>\n    ';
 } else { 
$t+='\n    <div class="switch">\n      <label for="'+
$e($v( service.name ))+
'" class="tt-w" data-tt="Click to deactivate service">'+
$e($v( service.name ))+
' '+
$e($v( service.status ))+
'</label>\n      <input type="checkbox" id="'+
$e($v( service.name ))+
'" />\n      <div class="thing"></div>\n    </div>\n    ';
 } 
$t+='\n    ';
 }, this); 
$t+='\n    ';
 } else { 
$t+='\n      <p>This package has no services.\n    ';
 } 
$t+='\n  </div>\n</div>\n';
return $t;
}});