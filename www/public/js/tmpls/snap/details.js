YUI.add("t-tmpls-snap-details", function(Y) { Y.namespace("iot.tmpls.snap.details").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="row details">\n  <div class="inner-wrapper">\n\n    <main class="seven-col append-one">\n\n      <div class="app__details-description">\n        <h2>Description</h2>\n        <p>'+
$e($v( this.description ))+
'</p>\n      </div>\n\n      ';
 if (this.screenshot_urls.length > 0) { 
$t+='\n      <div class="app__details-screenshots">\n        <h3>Screenshots</h3>\n        <ul class="inline">\n          ';
 Y.Object.each(this.screenshot_urls, function (value, key) { 
$t+='\n            <li class="three-col';
 if(key % 2) { 
$t+=' last-col';
 } 
$t+='"><img src="'+
$e($v( value ))+
'" /></li>\n          ';
 }); 
$t+='\n        </ul>\n      </div>\n      ';
 } 
$t+='\n    </main>\n\n    <aside class="four-col last-col">\n      <div class="frameworks box four-col">\n        <h3>Frameworks</h3>\n        <ul class="no-bullets">\n          ';
 Y.Object.each(this.click_framework, function (value, key) { 
$t+='\n          <li class="smaller">'+
$e($v( value ))+
'</li>\n          ';
 }); 
$t+='\n        </ul>\n      </div>\n    </aside>\n\n    <!--\n    ';
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
$t+='\n    -->\n  </div>\n</div>';
return $t;
}});