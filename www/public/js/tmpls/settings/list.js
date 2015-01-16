YUI.add("t-tmpls-settings-list", function(Y) { Y.namespace("iot.tmpls.settings.list").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="row strip-trans">\n    <div class="inner-wrapper">\n        <h1>System settings</h1>\n        <main class="eight-col box append-four">\n            <h2>'+
$e($v( this.system.device_name ))+
'</h2>\n            <ul class="list">\n                <li><strong>Current build:</strong> '+
$e($v( this.system.current_build_number ))+
'</li>\n                <li><strong>Last updated:</strong> '+
$e($v( this.system.last_update_date ))+
'</li>\n                <li><strong>Last checked:</strong> '+
$e($v( this.system.last_check_date ))+
'</li>\n                <li><strong>Channel:</strong> '+
$e($v( this.system.channel_name ))+
'</li>\n                <li><strong>Target build number:</strong> '+
$e($v( this.system.target_build_number ))+
'</li>\n            </ul>\n        </main>\n    </div>\n</div>\n<div class="row">\n<div class="inner-wrapper">\n        <section id="apps">\n            ';
 if (this.apps.length == 0) { 
$t+='\n            <div class="one-col">\n                <img src="/public/images/picto-upload-warmgrey.png" alt="Get some apps here" />\n            </div>\n            <div class="ten-col last-col header--get-apps">\n                <h1>No apps installed</h1>\n                <p><a href="/store">Visit the store to get some &rsaquo;</a></p>\n            </div>\n            ';
 } else { 
$t+='\n            <h2>Installed app settings</h2>\n            <ul class="list--apps">\n                ';
 for (var index = 0; index < this.apps.length; index++) { 
$t+='\n                ';
 var app = this.apps[index] 
$t+='\n                <li class="two-col ';
 if (index % 6 == 5) { 
$t+='last-col';
 } 
$t+='">\n                <a href="'+
$e($v( app.url ))+
'" class="link--app">\n                        <img\n                            src="'+
$e($v( YUI.Env.iot.icons[app.name] || '/public/images/app-placeholder.svg' ))+
'"\n                            alt="'+
$e($v( app.name ))+
' icon"\n                            class="icon--app-icon"\n                        />\n                        <label class="label--app-name">'+
$e($v( app.name ))+
'</label>\n                    </a>\n                </li>\n                ';
 } 
$t+='\n            </ul>\n            ';
 } 
$t+='\n        </section>\n    <div class="inner-wrapper">\n</div>\n';
return $t;
}});