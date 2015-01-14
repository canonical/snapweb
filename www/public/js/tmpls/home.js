YUI.add("t-tmpls-home", function(Y) { Y.namespace("iot.tmpls.home").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="row row-hero">\n    <div class="inner-wrapper">\n        <section id="apps">\n            ';
 if (this.apps.length == 0) { 
$t+='\n            <div class="header--get-apps">\n                <h1>No apps installed</h1>\n                <p>Search the store to get some now</p>\n            </div>\n            <img class="icon--get-apps" src="/public/images/curly-arrow.png" alt="Get some apps here" />\n            ';
 } else { 
$t+='\n            <ul class="list--apps">\n                ';
 for (var index = 0; index < this.apps.length; index++) { 
$t+='\n                ';
 var app = this.apps[index] 
$t+='\n                <li class="three-col ';
 if (index == this.apps.length - 1) { 
$t+='last-col';
 } 
$t+='">\n                    ';

                        var url;
                        if (app.url) {
                            url = app.url;
                        } else {
                            url = "/apps/" + app.name + "/settings";
                        }
                    
$t+='\n                    <a href="'+
$e($v( url ))+
'">\n                        <img\n                            src="'+
$e($v( app.iconUrl || '/public/images/app-placeholder.svg' ))+
'"\n                            alt="'+
$e($v( app.name ))+
' icon"\n                            class="icon--app-icon"\n                        />\n                        <label class="label--app-name">'+
$e($v( app.name ))+
'</label>\n                    </a>\n                </li>\n                ';
 } 
$t+='\n            </ul>\n            ';
 } 
$t+='\n        </section>\n    </div>\n</div>\n';
return $t;
}});