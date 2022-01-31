/* FileSaver.js
 * A saveAs() FileSaver implementation.
 * 1.3.8
 * 2018-03-22 14:03:47
 *
 * By Eli Grey, https://eligrey.com
 * License: MIT
 *   See https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md
 */
/*! @source http://purl.eligrey.com/github/FileSaver.js/blob/master/src/FileSaver.js */
/* Minor modification: Removed export keyword and minified. */
var saveAs=saveAs||function(t){"use strict";if(!(void 0===t||"undefined"!=typeof navigator&&/MSIE [1-9]\./.test(navigator.userAgent))){var e=function(){return t.URL||t.webkitURL||t},n=t.document.createElementNS("http://www.w3.org/1999/xhtml","a"),r="download"in n,o=/constructor/i.test(t.HTMLElement)||t.safari,a=/CriOS\/[\d]+/.test(navigator.userAgent),i=t.setImmediate||t.setTimeout,c=function(t){i(function(){throw t},0)},d=function(t){setTimeout(function(){"string"==typeof t?e().revokeObjectURL(t):t.remove()},4e4)},f=function(t){return/^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(t.type)?new Blob([String.fromCharCode(65279),t],{type:t.type}):t},s=function(s,u,l){l||(s=f(s));var p,v=this,w="application/octet-stream"===s.type,m=function(){!function(t,e,n){for(var r=(e=[].concat(e)).length;r--;){var o=t["on"+e[r]];if("function"==typeof o)try{o.call(t,n||t)}catch(t){c(t)}}}(v,"writestart progress write writeend".split(" "))};if(v.readyState=v.INIT,r)return p=e().createObjectURL(s),void i(function(){var t,e;n.href=p,n.download=u,t=n,e=new MouseEvent("click"),t.dispatchEvent(e),m(),d(p),v.readyState=v.DONE},0);!function(){if((a||w&&o)&&t.FileReader){var n=new FileReader;return n.onloadend=function(){var e=a?n.result:n.result.replace(/^data:[^;]*;/,"data:attachment/file;");t.open(e,"_blank")||(t.location.href=e),e=void 0,v.readyState=v.DONE,m()},n.readAsDataURL(s),void(v.readyState=v.INIT)}p||(p=e().createObjectURL(s)),w?t.location.href=p:t.open(p,"_blank")||(t.location.href=p);v.readyState=v.DONE,m(),d(p)}()},u=s.prototype;return"undefined"!=typeof navigator&&navigator.msSaveOrOpenBlob?function(t,e,n){return e=e||t.name||"download",n||(t=f(t)),navigator.msSaveOrOpenBlob(t,e)}:(u.abort=function(){},u.readyState=u.INIT=0,u.WRITING=1,u.DONE=2,u.error=u.onwritestart=u.onprogress=u.onwrite=u.onabort=u.onerror=u.onwriteend=null,function(t,e,n){return new s(t,e||t.name||"download",n)})}}("undefined"!=typeof self&&self||"undefined"!=typeof window&&window||this);
