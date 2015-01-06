YUI.add("t-core-settings.old-tmpl-form", function(Y) { Y.namespace("iot.core.settings.old.tmpl.form").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="settings-form">\n  <div>'+
$e($v( this.title ))+
'</div>\n  <form id="demo-settings">\n    ';
 Y.Array.each(this.data, function (data) { 
$t+='\n    <div>\n      <label for="'+
$e($v( data.name ))+
'">'+
$e($v( data.label ))+
'</label>\n      <div class="help"></div>\n      ';
 if (!data.value) { 
$t+='\n      <input type="text" name="'+
$e($v( data.name ))+
'" />\n      ';
 } else { 
$t+='\n      <input type="text" name="'+
$e($v( data.name ))+
'" value="'+
$e($v( data.value ))+
'"/>\n      ';
 } 
$t+='\n    </div>\n    ';
 }); 
$t+='\n    <button class="btn" type="button" id="submit">Apply</button>\n    <button class="btn" type="button" id="cancel">Cancel</button>\n  </form>\n</div>\n';
return $t;
}});