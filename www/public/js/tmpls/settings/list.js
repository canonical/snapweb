YUI.add("t-tmpls-settings-list", function(Y) { Y.namespace("iot.tmpls.settings.list").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="row">\n\t<div class="inner-wrapper">\n\t\t<main class="seven-col append-one">\n\t\t\t<h1>'+
$e($v( this.device_name ))+
'</h1>\n\t\t\t<p class="intro">Current build: '+
$e($v( this.current_build_number ))+
'</p>\n\t\t\t<ul class="list">\n\t\t\t\t<li>Last updated: '+
$e($v( this.last_update_date ))+
'</li>\n\t\t\t\t<li>Last checked: '+
$e($v( this.last_check_date ))+
'</li>\n\t\t\t\t<li>Channel: '+
$e($v( this.channel_name ))+
'</li>\n\t\t\t\t<li>Target build number: '+
$e($v( this.target_build_number ))+
'</li>\n\t\t\t</ul>\n\t\t</main>\n\t</div>\n</div>\n';
return $t;
}});