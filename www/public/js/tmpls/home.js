YUI.add("t-tmpls-home", function(Y) { Y.namespace("iot.tmpls.home").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="row row-hero strip-trans">\n    <div class="inner-wrapper">\n        <section id="apps">\n            ';
 if (this.length === 0) { 
$t+='\n            <div class="one-col">\n                <img src="/public/images/picto-upload-warmgrey.png" alt="Get some apps here" />\n            </div>\n            <div class="ten-col last-col header--get-apps">\n                <h1>No apps installed</h1>\n                <p><a href="/store">Visit the store to get some &rsaquo;</a></p>\n            </div>\n            ';
 } else { 
$t+='\n            <h1>Installed apps</h1>\n            <ul class="list--apps">\n              ';
 Y.Array.each(this, function(app, index) { 
$t+='\n                <li class="three-col ';
 if (index % 4 === 3) { 
$t+='last-col';
 } 
$t+='">\n                    <a href="'+
$e($v( app.url ))+
'" class="link--app"\n                        ';
 if (app.launchable) { 
$t+=' target="_blank" ';
 } 
$t+='\n                    >\n                        <img\n                            src="'+
$e($v( app.iconUrl || '/public/images/app-placeholder.svg' ))+
'"\n                            alt="'+
$e($v( app.name ))+
' icon"\n                            class="icon--app-icon"\n                        />\n                        <p class="label--app-name">'+
$e($v( app.name ))+
'</p>\n                    </a>\n                </li>\n                ';
 }); 
$t+='\n            </ul>\n            ';
 } 
$t+='\n        </section>\n    </div>\n</div>\n';
return $t;
}});