YUI.add("t-tmpls-snap-body", function(Y) { Y.namespace("iot.tmpls.snap.body").compiled = function (Y, $e, data) {
var $b='', $v=function (v){return v || v === 0 ? v : $b;}, $t='<div class="row-hero app-details">\n  <div class="inner-wrapper">\n    <div class="eight-col">\n      <img src="'+
$e($v( this.icon_url ))+
'" width="96" height="96" class="app__icon" />\n      <div class="app__details">\n        <h1 class="app__details-title';
 if(this.title.length > 25) { 
$t+=' app__details-title--smaller';
 } 
$t+='">'+
$e($v( this.title ))+
'</h1>\n        <p>By <a href="'+
$e($v( this.support_url ))+
'">'+
$e($v( this.developer_name ))+
'</a></p>\n        <p>Version '+
$e($v( this.version ))+
'</p>\n      </div>\n      <ul class="no-bullets">\n        ';
 Y.Object.each(this.department, function (value, key) { 
$t+='\n          <li>'+
$e($v( value ))+
'</li>\n        ';
 }); 
$t+='\n      </ul>\n    </div>\n    <div class="four-col last-col ">\n      <p>Rating: '+
$e($v( this.ratings_average ))+
'/5</p>\n      <p>';
 if (this.price > 0) { 
$t+='&dollar;'+
$e($v( this.price ))+
'';
 } else { 
$t+='Free';
 } 
$t+='</p>\n      <a href="" class="link-cta-positive">Install</a>\n      <p class="right">';
 if (this.binary_filesize > 1000) { 
$t+=''+
$e($v( this.binary_filesize / 1000 ))+
' KB';
 } else { 
$t+=''+
$e($v( this.binary_filesize ))+
' Bits';
 } 
$t+='</p>\n    </div>\n  </div>\n</div>\n\n<div class="row app__details-nav">\n  <div class="inner-wrapper">\n    <nav class="twelve-col no-margin-bottom ">\n      <ul class="inline-icons">\n        <li><a ';
 if(/[^/]+$/.exec(location.pathname)[0] != 'reviews' && /[^/]+$/.exec(location.pathname)[0] != 'settings') { 
$t+='class="active" ';
 } 
$t+='href="/apps/'+
$e($v( this.name ))+
'/details">Details</a></li>\n        <li><a ';
 if (/[^/]+$/.exec(location.pathname)[0] == 'reviews') { 
$t+='class="active" ';
 } 
$t+='href="/apps/'+
$e($v( this.name ))+
'/reviews">Reviews</a></li>\n        <li><a ';
 if (/[^/]+$/.exec(location.pathname)[0] == 'settings') { 
$t+='class="active" ';
 } 
$t+='href="/apps/'+
$e($v( this.name ))+
'/settings">Settings</a></li>\n      </ul>\n    </nav>\n  </div>\n</div>';
return $t;
}});