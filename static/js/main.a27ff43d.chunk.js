(this["webpackJsonpinteractive-network"]=this["webpackJsonpinteractive-network"]||[]).push([[0],{131:function(t,e){},132:function(t,e){},133:function(t,e){},134:function(t,e){},135:function(t,e){},136:function(t,e){},137:function(t,e,a){"use strict";a.r(e);var n=a(1),r=a.n(n),i=a(21),s=a.n(i);a(96),Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));var l=a(6),o=a(81),u=a(164),c=a(80),h=a.n(c),p=a(13),f=a(77),d=a(160),m=a(166),v=a(167),y=a(163),g=a(79),b=a.n(g),_=a(22),x=a.n(_),w=a(5);var k=function(t){var e=t.imgArr,a=t.scale,i=Object(n.useRef)(null),s=Object(n.useRef)(null);return Object(n.useEffect)((function(){s.current||(s.current=new x.a((function(t){t._draw=function(e){var a=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;if(e)if(t._setupDone){var n=e.length*a,r=e[0].length*a;n===t.height&&r===t.width||(t.resizeCanvas(r,n),t._img=t.createGraphics(e.length,e[0].length)),t.clear();var i=Math.max.apply(Math,Object(w.a)(e.flat()));e=e.map((function(t){return t.map((function(t){return t/(i||1)}))})),t._img.clear(),t._img.loadPixels();for(var s=0;s<e.length;s+=1)for(var l=0;l<e[0].length;l+=1){var o=255*e[s][l];o>0?t._img.set(l,s,t.color(0,0,0,o)):o<0&&t._img.set(l,s,t.color(214,30,30,.75*-o))}t._img.updatePixels(),t.image(t._img,0,0,r,n)}else setTimeout((function(){return t._draw(e,a)}),10)},t.setup=function(){t.pixelDensity(1),t.createCanvas(1,1),t.stroke(255),t.noLoop(),t.noSmooth()}}),i.current)),s.current&&s.current._draw(e,a)}),[e,a]),r.a.createElement("div",{ref:i})},M=function(t){var e=t.imgArrs,a=t.cols,n=t.scale;return r.a.createElement(d.a,{container:!0,spacing:1,style:t.style},e.map((function(t,e){return r.a.createElement(d.a,{item:!0,key:e,style:a&&e%a===a-1?{breakAfter:"always"}:{}},r.a.createElement(k,{imgArr:t,scale:n}))})))},O=a(169),E=a(162),j=a(168),S=Object(n.memo)((function(t){return r.a.createElement("div",null,r.a.createElement("div",null,r.a.createElement("div",null,"Types"),r.a.createElement(j.a,{value:t.types,onChange:function(e,a){return a.length>0?t.onChange("types",a):0},"aria-label":"types of kernels",style:{borderRadius:0,margin:"12px 0"},className:"toggle-types"},["l","i","L","T","X","Y"].map((function(t){return r.a.createElement(E.a,{key:t,value:t,style:{borderRadius:0,height:"28px",width:"28px",textTransform:"none"}},t)})))),r.a.createElement("div",null,r.a.createElement("div",null,"Angles"),r.a.createElement(O.a,{defaultValue:t.numComponents,track:!1,"aria-labelledby":"number of components",marks:[1,2,3,4,5].map((function(t){return{value:t,label:Math.pow(2,t)}})),step:1,min:1,max:5,onChange:function(e,a){return t.onChange("numComponents",a)}})),r.a.createElement("div",null,r.a.createElement("div",null,"Size"),r.a.createElement(O.a,{defaultValue:t.windowSize,track:!1,"aria-labelledby":"window size",valueLabelDisplay:"auto",marks:[3,5,7,9,11,13,15].map((function(t){return{value:t,label:t}})),step:2,min:3,max:15,onChange:function(e,a){return t.onChange("windowSize",a)}})),r.a.createElement("div",null,r.a.createElement("div",null,"Width Factor"),r.a.createElement(O.a,{defaultValue:t.lambda,track:!1,"aria-labelledby":"lambda",valueLabelDisplay:"auto",step:.1,min:1.1,max:10,onChange:function(e,a){return t.onChange("lambda",a)},style:{padding:"24px 0"}})),r.a.createElement("div",null,r.a.createElement("div",null,"Gaussian Spread"),r.a.createElement(O.a,{defaultValue:t.sigma,track:!1,"aria-labelledby":"sigma",valueLabelDisplay:"auto",step:.1,min:.1,max:8,onChange:function(e,a){return t.onChange("sigma",a)},style:{padding:"24px 0"}})))})),B=a(9),z=a.n(B);function I(t,e){var a=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1;return function(n,r){var i=2*Math.PI/e*(n*Math.cos(t)+r*Math.sin(t));return i>Math.PI*a||i<-Math.PI*a?null:Math.cos(i)}}function A(t){return function(e,a){return Math.exp(-.5*(Math.pow(e,2)/Math.pow(t,2)+Math.pow(a,2)/Math.pow(t,2)))}}function D(t,e,a,n){for(var r=I(e,a),i=A(n),s=z.a.zeros([t,t]).assign(-1).tolist(),l=Math.floor(t/2),o=0;o<t;o+=1)for(var u=o-l,c=0;c<t;c+=1){var h=c-l,p=r(h,u);null!==p&&(s[o][c]=p),s[o][c]=s[o][c]*i(h,u)}return s}function C(t,e,a,n){for(var r=I(e,a),i=A(n),s=z.a.zeros([t,t]).assign(-1).tolist(),l=Math.floor(t/2),o=0;o<t;o+=1)for(var u=o-l,c=0;c<t;c+=1){var h=c-l,p=null,f=Math.sin(e)*h-Math.cos(e)*u;f<1e-5?p=r(h,u):f<1.00001&&(p=(p=r(h,u))>0?p/2:p),null!==p&&(s[o][c]=p),s[o][c]=s[o][c]*i(h,u)}return s}function P(t){var e,a=0,n=0,r=0;t.forEach((function(t){return t.forEach((function(t){t>0?(a+=t,t>n&&(n=t)):t<r&&(r=t)}))})),e=0===n||0===r?1:-r/(n/a);var i=a;return t=t.map((function(t){return t.map((function(t){return t>0?t/i:t/e}))}))}function T(t,e,a,n,r){var i=[];return t&&e?(r.includes("l")&&i.push.apply(i,Object(w.a)(function(t,e,a,n){for(var r=Math.PI/e,i=[],s=0;s<e;s+=1){var l=D(t,s*r,a,n);i.push(l)}return i}(t,e,a,n))),r.includes("i")&&i.push.apply(i,Object(w.a)(function(t,e,a,n){for(var r=2*Math.PI/e,i=[],s=0;s<e;s+=1){var l=C(t,s*r,a,n);i.push(l)}return i}(t,2*e,a,n))),r.includes("L")&&i.push.apply(i,Object(w.a)(function(t,e,a,n,r){for(var i=2*Math.PI/a,s=Math.floor(t/2),l=[],o=0;o<a;o+=1){for(var u=o*i,c=Math.sin(u+Math.PI/2-e/2),h=Math.cos(u+Math.PI/2-e/2),p=C(t,u,n,r),f=C(t,u-e,n,r),d=z.a.zeros([t,t]).tolist(),m=0;m<t;m+=1)for(var v=m-s,y=0;y<t;y+=1){var g=c*(y-s)-h*v;d[m][y]=g<1e-5?p[m][y]:f[m][y]}l.push(d)}return l}(t,.5*Math.PI,2*e,a,n))),r.includes("T")&&i.push.apply(i,Object(w.a)(function(t,e,a,n,r){for(var i=2*Math.PI/a,s=Math.floor(t/2),l=[],o=0;o<a;o+=1){for(var u=o*i,c=Math.sin(u+Math.PI/2),h=Math.cos(u+Math.PI/2),p=D(t,u,n,r),f=C(t,u-e,n,r),d=z.a.zeros([t,t]).tolist(),m=0;m<t;m+=1)for(var v=m-s,y=0;y<t;y+=1){if(c*(y-s)-h*v<1e-5)d[m][y]=p[m][y];else{var g=Math.max(p[m][y],f[m][y]),b=Math.min(p[m][y],f[m][y]);d[m][y]=g>0?g:b}}l.push(d)}return l}(t,.5*Math.PI,2*e,a,n))),r.includes("X")&&i.push.apply(i,Object(w.a)(function(t,e,a,n,r){for(var i=Math.PI/2/a,s=[],l=0;l<a;l+=1){for(var o=l*i,u=D(t,o,n,r),c=D(t,o-e,n,r),h=z.a.zeros([t,t]).tolist(),p=0;p<t;p+=1)for(var f=0;f<t;f+=1){var d=Math.max(u[p][f],c[p][f]),m=Math.min(u[p][f],c[p][f]);h[p][f]=d>0?d:m}s.push(h)}return s}(t,.5*Math.PI,e/2,a,n))),r.includes("Y")&&i.push.apply(i,Object(w.a)(function(t,e,a,n,r){for(var i=2*Math.PI/a,s=Math.floor(t/2),l=[],o=0;o<a;o+=1){for(var u=o*i,c=C(t,u,n,r),h=C(t,u-Math.PI+e,n,r),p=C(t,u-Math.PI-e,n,r),f=Math.sin(u),d=Math.cos(u),m=z.a.zeros([t,t]).tolist(),v=0;v<t;v+=1)for(var y=v-s,g=0;g<t;g+=1){if(f*(g-s)-d*y<-1.00001)m[v][g]=c[v][g];else{var b=Math.max(h[v][g],p[v][g],c[v][g]),_=Math.min(h[v][g],p[v][g],c[v][g]);m[v][g]=b>0?b:_}}l.push(m)}return l}(t,.25*Math.PI,2*e,a,n))),i.map(P)):i}var L=function(t){var e=t.defaultKernelSettings,a=t.updateKernelSettings,i=Object(n.useState)(e),s=Object(l.a)(i,2),o=s[0],u=s[1],c=o.numComponents,h=o.lambda,g=o.sigma,_=o.windowSize,x=o.types,w=Object(n.useRef)(null),k=Object(n.useCallback)((function(t,e){var n=Object(f.a)({},o,Object(p.a)({},t,e));u(n),w.current&&clearTimeout(w.current),w.current=setTimeout((function(){a(n)}),100)}),[u,o,a]),O=Object(n.useMemo)((function(){return T(_,Math.pow(2,c),h,g,x)}),[c,h,g,_,x]);return r.a.createElement(m.a,{defaultExpanded:!0,square:!0,style:{boxShadow:"none",border:"1px solid #b2b2b2"}},r.a.createElement(v.a,{expandIcon:r.a.createElement(b.a,null),"aria-controls":"kerneltuner-content"},r.a.createElement("h3",{style:{margin:"0 10px"}},"Kernel Tuner")),r.a.createElement(y.a,{style:{margin:"10px 20px"}},r.a.createElement(d.a,{container:!0,justify:"flex-start",spacing:4},r.a.createElement(d.a,{item:!0,style:{marginRight:"20px",width:"200px"}},r.a.createElement(S,{numComponents:c,lambda:h,sigma:g,windowSize:_,types:x,onChange:k})),r.a.createElement(d.a,{item:!0,style:{width:"calc(100% - 220px)"}},r.a.createElement(M,{imgArrs:O,scale:4,cols:8})))))},N=a(18),W=a(14),F=a(7),R="float32",K=function(){function t(e,a,n,r){var i,s=this;Object(N.a)(this,t),this._shape=a,this._stride=r,this._pad=Math.floor(n/2),0!==this._pad?(i=this._shape.map((function(t){return t+2*s._pad})),this._outerBounds=[-this._pad,-this._pad,this._shape[1]+this._pad,this._shape[0]+this._pad]):(i=a.map((function(t){return Math.ceil(t/s._stride)*s._stride})),this._outerBounds=[0,0,i[1],i[0]]);var o=i,u=Object(l.a)(o,2),c=u[0],h=u[1];this._channels=e,this._arr=z.a.zeros([e,c,h],R),this._ids=z.a.zeros(this._shape,"int32").assign(-1,!1),this._max=z.a.zeros(this._shape,R),this._dirtyBounds=null}return Object(W.a)(t,[{key:"assign",value:function(t,e,a){null===e?this._slice(a).assign(t,!1):this._slice(a).slice([e,e+1],null,null).assign(t,!1),this._updateDirtyBounds(a)}},{key:"clean",value:function(){this._dirtyBounds=null}},{key:"calcStats",value:function(t){var e=arguments.length>1&&void 0!==arguments[1]?arguments[1]:"cpu";if(this._dirtyBounds){var a,n;e&&(n=F.b());var r,i=Object(l.a)(this._dirtyBounds,4),s=i[0],o=i[1],u=i[2],c=i[3],h=c-o,p=u-s,f=[],d=Date.now();e&&F.g(e),f.push(F.b());var m=t.argMax(1);e&&F.g(n),r=Date.now(),f.push("argmax -> "),f.push(r-d),d=r,f.push(F.b());var v=m.dataSync();r=Date.now(),f.push("data sync -> "),f.push(r-d),d=r,f.push(F.b());var y=z.a.int32(v);y=y.reshape([h,p]);var g=this._ids.slice([o,c],[s,u]);g.assign(y,!1),r=Date.now(),f.push("update _ids -> "),f.push(r-d),d=r,f.push(F.b());var b=t.reshape([-1]),_=m.reshape([-1]),x=F.d(_,F.f(p*h,"int32")),w=F.e(0,h*p,1,"int32"),k=F.a(x,w);r=Date.now(),f.push("prepare gather -> "),f.push(r-d),d=r,e&&F.g(e),f.push(F.b());var M=b.gather(k);e&&F.g(n),r=Date.now(),f.push("gather -> "),f.push(r-d),d=r,f.push(F.b());var O=z.a[R](M.dataSync()).reshape([h,p]),E=this._max.slice([o,c],[s,u]);E.assign(O,!1),r=Date.now(),f.push("update _max -> "),f.push(r-d),d=r,(a=console).log.apply(a,["calc stats:",e,"total time -> ",f.reduce((function(t,e){return Number.isInteger(e)?t+e:t}),0)].concat(f))}}},{key:"_slice",value:function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:null;t||(t=[0,0].concat(Object(w.a)(this._shape)));var e=t,a=Object(l.a)(e,4),n=a[0],r=a[1],i=a[2],s=a[3];return this._arr.slice(null,[r+this._pad,s+this._pad],[n+this._pad,i+this._pad])}},{key:"_updateDirtyBounds",value:function(t){if(this._dirtyBounds){var e=Object(l.a)(t,4),a=e[0],n=e[1],r=e[2],i=e[3],s=Object(l.a)(this._dirtyBounds,4),o=s[0],u=s[1],c=s[2],h=s[3];this._dirtyBounds=[Math.min(a,o),Math.min(n,u),Math.max(r,c),Math.max(i,h)]}else this._dirtyBounds=t}},{key:"print",value:function(){this.arr.tolist().forEach((function(t){return console.table(t)}))}},{key:"printBacking",value:function(){this._arr.tolist().forEach((function(t){return console.table(t)}))}},{key:"dirty",get:function(){return this._dirtyBounds?this._slice(this.dirtyBounds):null}},{key:"dirtyBounds",get:function(){var t=this;if(!this._dirtyBounds)return null;var e=this._dirtyBounds;if(0!==this._pad&&(e=function(t,e){if(!t||!e)return t;var a=Object(l.a)(t,4),n=a[0],r=a[1],i=a[2],s=a[3],o=Object(l.a)(e,4),u=o[0],c=o[1],h=o[2],p=o[3],f=Math.max(n,u),d=Math.max(r,c),m=Math.min(i,h),v=Math.min(s,p);return[f,d,m,v]}(e=X(this._dirtyBounds,2*this._pad),this._outerBounds)),1!==this._stride){var a=e=e.map((function(e){return e/t._stride})),n=Object(l.a)(a,4),r=n[0],i=n[1],s=n[2],o=n[3];e=(e=[Math.floor(r),Math.floor(i),Math.ceil(s),Math.ceil(o)]).map((function(e){return e*t._stride}))}return e}},{key:"arr",get:function(){return this._slice([0,0,this._shape[1],this._shape[0]])}}],[{key:"pool",value:function(e,a,n){return new t(e,a,0,n)}},{key:"conv",value:function(e,a,n){var r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:1;return new t(e,a,n,r)}}]),t}();function X(t,e){if(!t||0===t.length||!e)return t;var a=Object(l.a)(t,4);return[a[0]-e,a[1]-e,a[2]+e,a[3]+e]}var Y=function(){function t(e,a,n,r){Object(N.a)(this,t),this.input=e,this.output=a,this._kernelSize=r,this._pad=Math.floor(r/2),this._rawFilters=n,this.filters=n.map((function(t){return t.map((function(t){return t?z.a[R]([t]):null}))})),this._tflayer=function(t,e){var a=t.shape[0],n=t.transpose(2,3,1,0).tolist(),r=[F.h(n)];return F.c.conv2d({filters:a,kernelSize:e,strides:1,padding:"valid",weights:r,activation:"relu",dataFormat:"channelsFirst",useBias:!1})}(z.a[R](n.map((function(t){return t.map((function(t){return t||z.a.zeros([r,r],R).tolist()}))}))),r)}return Object(W.a)(t,[{key:"runWith",value:function(t){var e,a,n,r=this.input.dirty,i=[],s=Date.now(),l=r.reshape([1].concat(Object(w.a)(r.shape))).selection,o=F.h(l.data,l.shape);a=Date.now(),i.push("to tensor -> "),i.push(a-s),s=a,t&&(n=F.b(),F.g(t)),i.push(F.b());var u=this._tflayer.apply(o);t&&F.g(n),a=Date.now(),i.push("apply conv -> "),i.push(a-s),s=a,i.push(F.b());var c=u.dataSync();a=Date.now(),i.push("data sync -> "),i.push(a-s),s=a,i.push(F.b());var h=z.a[R](c);return a=Date.now(),i.push("to array -> "),i.push(a-s),s=a,(e=console).log.apply(e,["conv stats:",t,"total time -> ",i.reduce((function(t,e){return Number.isInteger(e)?t+e:t}),0)].concat(i)),{output:u,updateArr:h}}},{key:"run",value:function(){var t=X(this.input.dirtyBounds,-this._pad),e=Object(l.a)(t,4),a=e[0],n=e[1],r=e[2],i=e[3]-n,s=r-a,o=i*s*this._kernelSize*this._rawFilters.length;F.g("cpu");var u,c=i*s>=22500||o>8e6,h="".concat(s," x ").concat(i," x ").concat(this._kernelSize," x ").concat(this._rawFilters.length," = ").concat(o);c?(console.log("dirty size x kernel x kernels -> ",h," -> electing webgl backend"),u=this.runWith("webgl")):(console.log("dirty size x kernel x kernels -> ",h," -> electing cpu backend"),u=this.runWith("cpu"));var p=u,f=p.output,d=p.updateArr,m=[this.output._channels,i,s],v=d.reshape(m);this.output.assign(v,null,t),c?this.output.calcStats(f,"webgl"):this.output.calcStats(f,"cpu"),this.input.clean()}}]),t}();var V=function(){function t(e,a,n){Object(N.a)(this,t),this.input=e,this.output=a,this.poolSize=n,this._tflayer=F.c.maxPooling2d({poolSize:n,dataFormat:"channelsFirst"})}return Object(W.a)(t,[{key:"run",value:function(){var t=this,e=this.input.dirty,a=this.input.dirtyBounds.map((function(e){return Math.ceil(e/t.poolSize)})),n=Object(l.a)(a,4),r=n[0],i=n[1],s=n[2],o=n[3]-i,u=s-r,c=o*u;c>3e3?(F.g("webgl"),console.log("opting to use webgl")):F.g("cpu");var h=e.reshape([1].concat(Object(w.a)(e.shape))).selection,p=F.h(h.data,h.shape),f=this._tflayer.apply(p),d=[this.output._channels,o,u],m=z.a[R](f.dataSync()).reshape(d);F.g("cpu"),this.output.assign(m,null,a),c>3e3?this.output.calcStats(f,"webgl"):this.output.calcStats(f,"cpu"),this.input.clean()}}]),t}(),J=function(){function t(e,a){var n=this;Object(N.a)(this,t),this.layerInfos=a,this.arrs=[];var r=1,i=e,s=!0,o=!1,u=void 0;try{for(var c,h=function(){var t=c.value,e=void 0;"conv2d"===t.type?(e=K.conv(r,i,t.kernelSize),r=t.filters.length):"maxPool2d"===t.type&&(e=K.pool(r,i,t.poolSize),i=i.map((function(e){return Math.ceil(e/t.poolSize)}))),n.arrs.push(e)},p=a[Symbol.iterator]();!(s=(c=p.next()).done);s=!0)h()}catch(O){o=!0,u=O}finally{try{s||null==p.return||p.return()}finally{if(o)throw u}}this.arrs.push(K.conv(r,i,0)),this.layers=[];var f=!0,d=!1,m=void 0;try{for(var v,y=a.entries()[Symbol.iterator]();!(f=(v=y.next()).done);f=!0){var g=v.value,b=Object(l.a)(g,2),_=b[0],x=b[1],w=this.arrs[_],k=this.arrs[_+1],M=void 0;"conv2d"===x.type?M=new Y(w,k,x.filters,x.kernelSize):"maxPool2d"===x.type&&(M=new V(w,k,x.poolSize)),this.layers.push(M)}}catch(O){d=!0,m=O}finally{try{f||null==y.return||y.return()}finally{if(d)throw m}}}return Object(W.a)(t,[{key:"run",value:function(t,e){this.arrs[0].assign(t,0,e);var a=Date.now(),n=!0,r=!1,i=void 0;try{for(var s,o=this.layers.entries()[Symbol.iterator]();!(n=(s=o.next()).done);n=!0){var u=s.value,c=Object(l.a)(u,2),h=c[0],p=c[1],f=Date.now();p.run();var d=Date.now();console.log("time for layer "+h,d-f)}}catch(v){r=!0,i=v}finally{try{n||null==o.return||o.return()}finally{if(r)throw i}}var m=Date.now();console.log("total network time",m-a),this.arrs[this.arrs.length-1].clean()}},{key:"getOutput",value:function(t){var e=this.arrs[t+1];return{acts:e.arr,max:e._max,ids:e._ids}}}]),t}();function U(t,e,a){return t<e?e:t>=a?a-.001:t}function G(t,e){var a=Object(l.a)(e,4),n=a[0],r=a[1],i=a[2],s=a[3],o=U(t.x,n,i),u=U(t.y,r,s);return new x.a.Vector(o,u)}var H=function(){function t(e,a,n){Object(N.a)(this,t),this.p=e,this.shape=a,this.layerInfos=n,this.network=new J(this.shape,n),this._dirtyBounds=null,this._backup=null,this._listeners=[]}return Object(W.a)(t,[{key:"init",value:function(){var t=this;this.p._setupDone?this.forceFullUpdate():setTimeout((function(){return t.init()}),10)}},{key:"reset",value:function(){this.p.clear(),this._dirtyBounds=this.bounds,this.update()}},{key:"addSegment",value:function(t,e){var a=arguments.length>2&&void 0!==arguments[2]&&arguments[2];t=G(t,this.bounds),e=G(e,this.bounds);var n,r=this._getLineBounds(t,e);a&&(null!==this._backup&&console.log("Overwriting existing backup! Should call restore() first"),this._backup={img:(n=this.p).get.apply(n,Object(w.a)(r)),bounds:r});this.p.line(t.x,t.y,e.x,e.y),this._updateDirtyBounds(r)}},{key:"restore",value:function(){if(null!==this._backup){var t=this._backup,e=t.img,a=t.bounds,n=a.slice(0,2),r=Object(l.a)(n,2),i=r[0],s=r[1];this.p.image(e,i,s),this._backup=null,this._updateDirtyBounds(a)}else console.log("Backup failed, no backup cache available")}},{key:"update",value:function(){if(this._dirtyBounds){var t=Object(l.a)(this._dirtyBounds,4),e=t[0],a=t[1],n=t[2],r=t[3],i=this.p.get(e,a,n-e,r-a);i.loadPixels();var s=z.a[R](i.pixels).reshape(i.height,i.width,4).slice(null,null,[3,4]).reshape(1,i.height,i.width);this.network.run(s,this._dirtyBounds),this._notifyListeners({network:this.network,dirtyBounds:Object(w.a)(this._dirtyBounds)}),this._dirtyBounds=null}}},{key:"forceFullUpdate",value:function(){this._dirtyBounds=this.bounds,this.update()}},{key:"_updateDirtyBounds",value:function(t){if(this._dirtyBounds){var e=Object(l.a)(t,4),a=e[0],n=e[1],r=e[2],i=e[3],s=Object(l.a)(this._dirtyBounds,4),o=s[0],u=s[1],c=s[2],h=s[3];this._dirtyBounds=[Math.min(a,o),Math.min(n,u),Math.max(r,c),Math.max(i,h)]}else this._dirtyBounds=t}},{key:"_getLineBounds",value:function(t,e){return[Math.min(t.x,e.x)-1,Math.min(t.y,e.y)-1,Math.max(t.x,e.x)+1+1,Math.max(t.y,e.y)+1+1].map((function(t){return Math.floor(t)}))}},{key:"addListener",value:function(t){this._listeners.push(t)}},{key:"removeListener",value:function(t){var e=this._listeners.indexOf(t);e>-1&&this._listeners.splice(e,1)}},{key:"_notifyListeners",value:function(){var t=!0,e=!1,a=void 0;try{for(var n,r=this._listeners[Symbol.iterator]();!(t=(n=r.next()).done);t=!0){var i=n.value;i&&i.apply(void 0,arguments)}}catch(s){e=!0,a=s}finally{try{t||null==r.return||r.return()}finally{if(e)throw a}}}},{key:"bounds",get:function(){var t=Object(l.a)(this.shape,2),e=t[0];return[0,0,t[1],e]}}]),t}();var q=function(t){var e=t.shape,a=t.kernels,i=t.onUpdate,s=Object(n.useRef)(null),o=Object(n.useRef)(null),u=Object(n.useRef)(null);return Object(n.useEffect)((function(){o.current||(o.current=new x.a(function(t,e){var a=!1;return function(n){n.setup=function(){n.pixelDensity(1);var e=Object(l.a)(t,2),a=e[0],r=e[1];n.createCanvas(a,r),n.strokeWeight(2)},n.draw=function(){if(n.mouseIsPressed){var t={x:n.pmouseX,y:n.pmouseY},r={x:n.mouseX,y:n.mouseY};t.x<0||t.y<0||r.x<0||r.y<0||r.x>=n.width||t.x>=n.width||r.y>=n.height||t.y>=n.height||(e.current.addSegment(t,r),a=!0)}else a&&(e.current.update(),a=!1)}}}(e,u),s.current))})),Object(n.useEffect)((function(){var t=[{filters:a.map((function(t){return[t]})),kernelSize:a[0].length,type:"conv2d"}];u.current=new H(o.current,e,t),u.current.addListener(i),u.current.init()}),[a,e,i]),r.a.createElement("div",{ref:s})},$=["#e6194b","#3cb44b","#4363d8","#f58231","#911eb4","#46f0f0","#f032e6","#bcf60c","#fabebe","#008080","#e6beff","#9a6324","#800000","#aaffc3","#808000","#ffd8b1","#000075"],Q={};var Z=function(t){var e=t.kernels,a=t.pt,i=t.ids,s=t.max,l=t.scale,o=t.onSelect,u=Object(n.useRef)(null),c=Object(n.useRef)(null);return Object(n.useEffect)((function(){u.current&&(u.current.innerHTML="",c.current=new x.a(function(t){var e=null,a=null,n=1,r=!1;return function(t){t.setData=function(t,i){var s=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1;e=t;var l=Math.max.apply(Math,Object(w.a)(i.flat()));a=i.map((function(t){return t.map((function(t){return t/l}))})),n=s,r=!0},t.setKernels=function(e){t._kernelCache=[];var a=!0,n=!1,r=void 0;try{for(var i,s=e[Symbol.iterator]();!(a=(i=s.next()).done);a=!0){var l=i.value,o=t._getIcon(l);t._kernelCache.push(o)}}catch(u){n=!0,r=u}finally{try{a||null==s.return||s.return()}finally{if(n)throw r}}},t.setup=function(){t.pixelDensity(1),t.createCanvas(300,300),t.stroke(255)},t.draw=function(){if(e&&a){var i=e.length*n,s=e[0].length*n;i===t.height&&s===t.width||t.resizeCanvas(s,i);var l=Math.floor(t.mouseX/n),o=Math.floor(t.mouseY/n),u=8*n;if(l>4&&o>4&&l<s/n-4&&o<i/n-4){t.clear(),t._drawBackground(e,a,n);var c=[Math.max(0,l-4),Math.max(0,o-4),Math.min(s/n,l+4+1),Math.min(i/n,o+4+1)],h=c[0],p=c[1],f=c[2],d=c[3],m=z.a.array(e).slice([p,d],[h,f]).tolist(),v=z.a.array(a).slice([p,d],[h,f]).tolist();t.push(),t.translate(l*n-4.5*u,o*n-4.5*u),t.push(),t.fill(255),t.noStroke(),t.rect(0,0,m[0].length*u,m.length*u),t.pop(),t._drawIconArray(m,v,u),t.push(),t.noFill(),t.strokeWeight(1),t.stroke("#b2b2b2"),t.rect(0,0,m[0].length*u,m.length*u),t.pop(),t.push(),t.noFill(),t.stroke("#b2b2b2"),t.strokeWeight(1),t.rect(4*u,4*u,u,u),t.pop(),t.pop(),r=!0}else r&&(t.clear(),t._drawBackground(e,a,n),r=!1)}},t.mouseClicked=function(){if(e&&n){var a=Math.floor(t.mouseX/n),r=Math.floor(t.mouseY/n);a>0&&r>0&&a<e.length&&r<e[0].length&&(t._onSelect&&t._onSelect({x:a,y:r}),t._pt={x:a,y:r})}},t._drawBackground=function(e,a){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1;t.strokeWeight(.08*n);for(var r=0;r<e.length;r+=1)for(var i=0;i<e[0].length;i+=1)if(a[r][i]>=.1){var s=e[r][i];if(s>=0){var l=t._getColor(s);l.setAlpha(255*a[r][i]),t.fill(l),t.rect(i*n,r*n,n,n)}}if(t._pt){t.push(),t.scale(n),t.fill(0);var o=t._pt,u=o.x,c=o.y,h=6/n;t.translate(.5,1),t.triangle(u,c,u+.75*h,c+2*h,u-.75*h,c+2*h),t.pop()}},t._drawIconArray=function(e,a){for(var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:1,r=0;r<e.length;r+=1)for(var i=0;i<e[0].length;i+=1){var s=a[r][i];if(s>.1){var l=e[r][i];if(l>=0){var o=t._kernelCache[l];t.push(),t.tint(255,255*s),t.image(o,i*n,r*n,n,n),t.pop()}}}},t._getColor=function(e){var a=Q[e];return a||(a=$[e]?t.color($[e]):t.color([155*Math.random(),155*Math.random(),155*Math.random()]),Q[e]=a),a},t._getIcon=function(e){var a=e.length,n=t.createGraphics(a,a),r=Math.max.apply(Math,Object(w.a)(e.flat()));e=e.map((function(t){return t.map((function(t){return t/r}))})),n.loadPixels();for(var i=0;i<e.length;i+=1)for(var s=0;s<e[0].length;s+=1){var l=255*e[i][s];l>0?n.set(s,i,t.color(0,0,0,l)):l<0&&n.set(s,i,t.color(214,30,30,.75*-l))}return n.updatePixels(),n.get()}}}(),u.current))}),[]),Object(n.useEffect)((function(){c.current&&c.current.setKernels(e)}),[e]),Object(n.useEffect)((function(){c.current&&(c.current._pt=a)}),[a]),Object(n.useEffect)((function(){c.current&&i&&s&&c.current.setData(i,s,l)}),[i,s,l]),Object(n.useEffect)((function(){c.current&&(c.current._onSelect=o)}),[o]),r.a.createElement("div",{ref:u})},tt=a(34);function et(t,e,a){var n=a.map((function(t,e){return{name:e,value:t/255}})),r=4,i=4,s=4,l=4,o=t.offsetWidth-l-i,u=.5*o,c=tt.b().domain(n.map((function(t){return t.name}))).range([l,o-i]).padding(.1),h=tt.c().domain([0,1]).range([u-s,r+c.bandwidth()]),p=tt.d(t).append("svg").attr("width",o).attr("height",u),f=p.append("g").selectAll(".bar").data(n).enter();f.append("rect").attr("fill","#e0e0e0").attr("stroke","#b2b2b2").style("stroke-width",1).attr("x",(function(t){return c(t.name)})).attr("y",(function(t){return h(t.value?t.value:0)})).attr("height",(function(t){return h(0)-h(t.value?t.value:0)})).attr("width",c.bandwidth()),f.exit().remove(),function(t,e,a){var n=[];a.forEach((function(t,e){var a=Math.max.apply(Math,Object(w.a)(t.map((function(t){return Math.max.apply(Math,Object(w.a)(t.map((function(t){return Math.abs(t)}))))}))));t.forEach((function(t,r){return t.forEach((function(t,i){n.push({kIndex:e,row:r,col:i,v:t/a})}))}))}));var r=t.append("g").selectAll(".pixel").data(n).enter(),i=e.bandwidth()/a[0].length;r.append("rect").attr("fill",(function(t){return t.v>=0?"rgba(0, 0, 0, "+t.v+")":"rgba(214, 30, 30, "+.75*-t.v+")"})).attr("x",(function(t){return e(t.kIndex)+i*t.col})).attr("y",(function(t){return i*t.row})).attr("height",i).attr("width",i),t.append("g").selectAll(".outline").data(a).enter().append("rect").attr("x",(function(t,a){return e(a)})).attr("y",0).attr("height",e.bandwidth()).attr("width",e.bandwidth()).style("stroke","#b2b2b2").style("fill","none").style("stroke-width",1)}(p,c,e);return p.append("g").style("font-size","0").call((function(t){return t.attr("transform","translate(0,".concat(u-s,")")).attr("color","#b2b2b2").call(tt.a(c).tickSize(0))})),p.node()}var at=function(t){var e=Object(n.useRef)(null),a=t.kernels,i=t.acts;return Object(n.useEffect)((function(){e.current.innerHTML="",a&&i&&et(e.current,a,i)}),[a,i]),r.a.createElement("div",{ref:e,style:{width:"400px"}})},nt=function(t){var e=t.imgArrs,a=t.imgArrsOverlay,n=t.scale,i=t.overlayOpacity;return r.a.createElement("div",{style:{position:"relative"}},r.a.createElement(M,{imgArrs:e,scale:n}),r.a.createElement(M,{imgArrs:a,scale:n,style:{position:"absolute",top:"4px",opacity:i||.75}}))};var rt=function(t){var e=t.acts,a=t.kernels,n=t.count,i=t.imgArr,s=t.pt;if(!e||!s||!a||a.length!==e.length)return null;var l=s.x,o=s.y,u=e.map((function(t){return t[o][l]})),c=function(t,e,a){var n=e.x,r=e.y,i=[n-a,r-a,n+a+1,r+a+1],s=i[0],l=i[1],o=i[2],u=i[3];return s<0||l<0||o>=t[0].length||u>=t.length?null:z.a.array(t).slice([l,u],[s,o]).tolist()}(i,s,(a[0].length-1)/2),h=function(t,e){return t.map((function(t,e){return[e,t]})).sort((function(t,e){return t[1]>e[1]?-1:1})).slice(0,e).map((function(t){return t[0]}))}(u,n);a=h.map((function(t){return a[t]})),u=h.map((function(t){return u[t]}));var p="(".concat(s.x,", ").concat(s.y,")");return r.a.createElement(d.a,{container:!0,spacing:4,justify:"center",style:t.style},r.a.createElement(d.a,{item:!0},r.a.createElement("div",null,r.a.createElement(at,{kernels:a,acts:u}),r.a.createElement("div",{style:{margin:"5px 0 25px 0",textAlign:"center"}},r.a.createElement("b",null,"Top activations for pixel ",p))),c&&r.a.createElement("div",null,r.a.createElement(nt,{imgArrs:new Array(a.length).fill(c),imgArrsOverlay:a,scale:6,overlayOpacity:.8}),r.a.createElement("div",{style:{margin:"10px 0",textAlign:"center"}},r.a.createElement("b",null,"Kernel overlays for pixel ",p)))))};var it=function(t){var e=t.data,a=t.kernels,i=t.defaultPt,s=Object(n.useState)(i),o=Object(l.a)(s,2),u=o[0],c=o[1],h=Object(n.useMemo)((function(){if(e&&e.network){var t=e.network.getOutput(-1).acts,a=e.network.getOutput(0),n=a.acts,r=a.max,i=a.ids;return{imgArr:t.tolist()[0],acts:n.tolist(),max:r.tolist(),ids:i.tolist()}}return{}}),[e]),p=h.imgArr,f=h.acts,m=h.max,v=h.ids;return r.a.createElement(d.a,{container:!0,spacing:4,justify:"center",style:t.style},r.a.createElement(d.a,{item:!0},r.a.createElement("div",null,r.a.createElement(Z,{kernels:a,max:m,ids:v,scale:2.5,onSelect:c,pt:u}),r.a.createElement("div",{style:{textAlign:"center"}},r.a.createElement("div",{style:{marginTop:"10px"}},r.a.createElement("b",null,"A color-coded map of maximum activation")),r.a.createElement("div",{style:{marginTop:"10px"}},"Select a pixel to inspect")))),r.a.createElement(d.a,{item:!0},r.a.createElement(rt,{kernels:a,imgArr:p,acts:f,pt:u,count:Math.min(8,a.length),style:{width:"400px"}})))},st=[150,150],lt={x:Math.floor(st[0]/2)-1,y:Math.floor(st[1]/2)-1};var ot=function(t){var e=Object(n.useState)(null),a=Object(l.a)(e,2),i=a[0],s=a[1],o=t.kernelSettings,u=o.numComponents,c=o.lambda,h=o.sigma,p=o.windowSize,f=o.types,m=Object(n.useMemo)((function(){return T(p,Math.pow(2,u),c,h,f)}),[u,c,h,p,f]);return r.a.createElement("div",{style:t.style},r.a.createElement("h3",null,"Kernel Inspector"),r.a.createElement(d.a,{container:!0,spacing:4,justify:"center"},r.a.createElement(d.a,{item:!0},r.a.createElement(q,{kernels:m,shape:st,onUpdate:s}),r.a.createElement("div",{style:{marginTop:"10px",textAlign:"center"}},"Make a test drawing")),r.a.createElement(d.a,{item:!0},i&&r.a.createElement(it,{kernels:m,data:i,defaultPt:lt}))))},ut=a(165),ct=Object(o.a)({palette:{primary:h.a}});var ht="kernelSettings",pt=JSON.parse(localStorage.getItem(ht)),ft=function(t){if(!t)return!1;var e=t.numComponents,a=t.lambda,n=t.sigma,r=t.windowSize,i=t.types;return!(isNaN(e)||isNaN(a)||isNaN(n)||isNaN(r)||!Array.isArray(i)||0===i.length)}(pt)?pt:{numComponents:2,lambda:4.9,sigma:3.3,windowSize:9,types:["l","L","T","X"]};s.a.render(r.a.createElement((function(){var t=Object(n.useState)(ft),e=Object(l.a)(t,2),a=e[0],i=e[1];return Object(n.useEffect)((function(){localStorage.setItem(ht,JSON.stringify(a))}),[a]),r.a.createElement(u.a,{theme:ct},r.a.createElement(ut.a,{maxWidth:"md"},r.a.createElement(L,{defaultKernelSettings:a,updateKernelSettings:i})),r.a.createElement(ut.a,{maxWidth:"lg",style:{marginTop:"40px"}},r.a.createElement(ot,{kernelSettings:a})))}),null),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(t){t.unregister()}))},91:function(t,e,a){t.exports=a(137)},96:function(t,e,a){}},[[91,1,2]]]);
//# sourceMappingURL=main.a27ff43d.chunk.js.map