!function(e){var r={};function t(n){if(r[n])return r[n].exports;var o=r[n]={i:n,l:!1,exports:{}};return e[n].call(o.exports,o,o.exports,t),o.l=!0,o.exports}t.m=e,t.c=r,t.d=function(e,r,n){t.o(e,r)||Object.defineProperty(e,r,{enumerable:!0,get:n})},t.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},t.t=function(e,r){if(1&r&&(e=t(e)),8&r)return e;if(4&r&&"object"==typeof e&&e&&e.__esModule)return e;var n=Object.create(null);if(t.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:e}),2&r&&"string"!=typeof e)for(var o in e)t.d(n,o,function(r){return e[r]}.bind(null,o));return n},t.n=function(e){var r=e&&e.__esModule?function(){return e.default}:function(){return e};return t.d(r,"a",r),r},t.o=function(e,r){return Object.prototype.hasOwnProperty.call(e,r)},t.p="",t(t.s=0)}([function(e,r,t){const n=process.env.PORT||5e3;var o=t(1);o.enablePublicProviders();var u=t(2)();function a(e,r,t){!function(e){return void 0!==e.query&&void 0!==e.category||(console.log('request check fail {params.query:"'+e.query+'", params.category:"'+e.category+'"}'),!1)}(e.params)?(r.statusCode=404,r.end()):o.search(e.params.query,e.params.category,20).then(e=>{r.json(e),r.end()}).catch(e=>{r.statusCode=500,r.end()})}u.get("/",a),u.get("/search/:query/:category",a),u.listen(n,()=>console.log(`Listening on ${n}`))},function(e,r){e.exports=require("torrent-search-api")},function(e,r){e.exports=require("express")}]);