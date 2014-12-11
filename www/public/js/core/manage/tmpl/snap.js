YUI.add("t-core-manage-tmpl-snap", function(Y) { Y.namespace("DEMO.CORE.MANAGE.TMPL.SNAP").template = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="services-pkg" data-pkg="'+
$e($v( this.name ))+
'">\n  <h1 class="pkg-name">'+
$e($v( this.name ))+
' '+
$e($v( this.version ))+
'\n  <a class="pkg-show" href="'+
$e($v( this.url ))+
'" target="_blank">SHOW</a>\n  </h1>\n  <p>\n  ';
 if (this.description && this.description.length) { 
$t+='\n  '+
$e($v( this.description ))+
'\n  ';
 } else { 
$t+='\n    This package has no description.\n  ';
 } 
$t+='\n  <div class="install">\n    <div class="switch">\n      <fieldset>\n      <label for="'+
$e($v( this.name ))+
'" class="tt-w" data-tt="Click to remove">Installed</label>\n      <input type="checkbox" checked id="'+
$e($v( this.name ))+
'" />\n      <div class="thing"></div>\n      </fieldset>\n    </div>\n  </div>\n  <div class="services">\n    ';
 if (this.services && this.services.length) { 
$t+='\n    <h2>Manage Services</h2>\n    <table>\n    ';
 Y.Array.each(this.services, function (service) { 
$t+='\n    <div class="service-row">\n      <div class="service-name">'+
$e($v( service.name ))+
'</div>\n      ';
 if (service.status === 'active') { 
$t+='\n      <div class="service-action">\n        <div class="switch" data-service="'+
$e($v( service.name ))+
'">\n          <fieldset>\n          <label for="service-'+
$e($v( service.name ))+
'" class="tt-w" data-tt="Click to deactivate service">'+
$e($v( service.status ))+
'</label>\n          <input data-pkg="'+
$e($v( this.name ))+
'" checked type="checkbox" id="service-'+
$e($v( service.name ))+
'" />\n          <div class="thing"></div>\n          </fieldset>\n        </div>\n      </div>\n      ';
 } else if (service.status) { 
$t+='\n      <div>\n        <div class="switch">\n          <label for="'+
$e($v( service.name ))+
'" class="tt-w" data-tt="Click to deactivate service">'+
$e($v( service.name ))+
' '+
$e($v( service.status ))+
'</label>\n          <input type="checkbox" id="'+
$e($v( service.name ))+
'" />\n          <div class="thing"></div>\n        </div>\n      </div>\n      ';
 } 
$t+='\n    </div>\n    ';
 }, this); 
$t+='\n    </table>\n    ';
 } else { 
$t+='\n      <p>This package has no services.\n    ';
 } 
$t+='\n  </div>\n</div>\n';
return $t;
}});