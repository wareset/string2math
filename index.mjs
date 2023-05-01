/* eslint-disable */
var t=Array.prototype;function n(){return t.concat.apply([],arguments)}function e(t){return t[t.length-1]}var i=Object.is||function(t,n){return t===n?0!==t||1/t==1/n:t!=t&&n!=n},r=Math.pow,s=/^(NaN)?([-]?)(Infinity)?(\d*)\.?(\d*)[eE]?([-+]?\d*)$/,a=/^0+/;function o(t){var n=(0!=(t=+t)||1/t>0?""+t:"-0").match(s);return{isNaN:!!n[1],isMinus:"-"===n[2],isInfinity:!!n[3],integer:(n[4]+n[5]).replace(a,""),exponent:+n[6]-n[5].length}}function u(t){return t.isNaN?NaN:t.isInfinity?t.isMinus?-1/0:1/0:+((t.isMinus?"-":"")+(t.integer||"0")+"e"+t.exponent)}function c(t,n){if(t=+t,0===(n=+n))return 1;if(n!=n||t!=t)return NaN;if(n===1/0)return t?-1===t||1===t?NaN:t>1||t<-1?n:0:0;if(n===-1/0)return t?-1===t||1===t?NaN:t>1||t<-1?0:-n:-n;n<0&&(t=f(1,t),n=-n);for(var e=1,i=0;++i<=n;)e=l(e,t);return(n=N(n,1-i))>0&&(e=0===(e=l(e,r(t,n)))?0:e<0?-e:e),e}function h(t,n){var e=t.exponent,i=n.exponent;return e>i?i:e}function l(t,n){var e=o(t=+t),i=o(n=+n),r=h(e,i);e.exponent-=r,i.exponent-=r;var s=o(u(e)*u(i));return s.exponent+=r+r,u(s)}function f(t,n){var e=o(t=+t),i=o(n=+n),r=h(e,i);return e.exponent-=r,i.exponent-=r,u(e)/u(i)}function p(t,n){var e=o(t=+t),i=o(n=+n),r=h(e,i);e.exponent-=r,i.exponent-=r;var s=o(u(e)%u(i));return s.exponent+=r,u(s)}function N(t,n){var e=o(t=+t),i=o(n=+n),r=h(e,i);e.exponent-=r,i.exponent-=r;var s=o(u(e)+u(i));return s.exponent+=r,u(s)}function g(t,n){var e=o(t=+t),i=o(n=+n),r=h(e,i);e.exponent-=r,i.exponent-=r;var s=o(u(e)-u(i));return s.exponent+=r,u(s)}var y=/\?\??|\|\|?|\*\*?|&&?|<<|>>>?|[!=]=?=?|[<>]=?|(?<!\d\.?[eE])[-+]|[,:~^%/()[\]]/g,d=function(){function ProgramNode(t){this.type="Program",this.is=t}var t=ProgramNode.prototype;return t.toArray=function(t){return this.is?this.is.toArray(t):["NaN"]},t.toString=function(){return""+(this.is||NaN)},t.calculate=function(){return this.is?this.is.calculate.apply(this.is,arguments):NaN},ProgramNode}(),v=function(){function ParenthesisNode(t){this.type="Parenthesis",this.is=t}var t=ParenthesisNode.prototype;return t.toArray=function(t){var e=this.is,i=n(e?e.toArray(t):"NaN");return t&&"("!==i[0]?n("(",i,")"):i},t.toString=function(){return"("+(this.is||NaN)+")"},t.calculate=function(){return this.is?this.is.calculate.apply(this.is,arguments):NaN},ParenthesisNode}(),x=function(){function ConditionalNode(t,n,e){this.type="Conditional",this.is=e,this.isTrue=n,this.isFalse=t}var t=ConditionalNode.prototype;return t.toArray=function(t){var e=n(this.is?this.is.toArray(t):"NaN","?",this.isTrue?this.isTrue.toArray(t):"NaN",":",this.isFalse?this.isFalse.toArray(t):"NaN");return t?n("(",e,")"):e},t.toString=function(){return(this.is||NaN)+" ? "+(this.isTrue||NaN)+" : "+(this.isFalse||NaN)},t.calculate=function(){var t=this.is,n=this.isTrue,e=this.isFalse,i=arguments;return t?t.calculate.apply(t,i):e?e.calculate.apply(n,i):NaN},ConditionalNode}(),A=function(){function ConstantNode(t){this.type="Constant",this.is=t}var t=ConstantNode.prototype;return t.toArray=function(){return[this.is]},t.toString=function(){return this.is},t.calculate=function(){for(var t=this.is,n=arguments,e=n.length;e-- >0;)if(t in n[e]&&"function"!=typeof n[e][t])return n[e][t];var i=+t;return i==i||"NaN"===t?i:t},ConstantNode}();function w(t,e){return 0===e?t.toArray(this[0]):n(",",t.toArray(this[0]))}function C(t){return t.calculate.apply(t,this)}var m=function(){function FunctionNode(t,n){this.type="Function",this.is=t,this.isArgs=n}var t=FunctionNode.prototype;return t.toArray=function(t){return n(this.is,"(",n.apply(void 0,this.isArgs.map(w,[t])),")")},t.toString=function(){return this.is+"("+this.isArgs.join(", ")+")"},t.calculate=function(){for(var t=this.is,n=arguments,e=n.length;e-- >0;)if(t in n[e]&&"function"==typeof n[e][t])return n[e][t].apply(void 0,this.isArgs.map(C,n));return NaN},FunctionNode}(),b=function(){function OperatorNode(t,n,e){this.type="Operator",this.is=t,this.isLeft=e,this.isRight=n}var t=OperatorNode.prototype;return t.toArray=function(t){var e=this.is,i=this.isLeft,r=this.isRight,s=i?i.toArray(t):["NaN"],a=r?r.toArray(t):["NaN"];return r?i?"!"===e||"~"===e?["NaN"]:t?n("(",s,e,a,")"):n(s,e,a):"!"===e||"~"===e||"-"===e?n(e,a):a:s},t.toString=function(){var t=this.is,n=this.isLeft,e=this.isRight,i=""+(n||NaN),r=""+(e||NaN);return e?n?"!"===t||"~"===t?"NaN":i+" "+t+" "+r:"!"===t||"~"===t||"-"===t?t+r:r:i},t.calculate=function(){var t,n=this.is,e=this.isLeft,r=this.isRight,s=arguments,a=e?e.calculate.apply(e,s):NaN,o=r?r.calculate.apply(r,s):NaN;if(!r)return a;for(var u=s.length;u-- >0;)if(n in s[u]&&"function"==typeof s[u][n]){t=s[u][n];break}if(!e)return"-"===n?t?t(0,o):-o:"!"===n?t?t(o):+!o:"~"===n?t?t(o):~o:o;if(t)return t(a,o);switch(n){case"**":return c(a,o);case"*":return l(a,o);case"/":return f(a,o);case"%":return p(a,o);case"+":return N(a,o);case"-":return g(a,o);case"<<":return a<<o;case">>":return a>>o;case">>>":return a>>>o;case"<":return a<o?1:0;case"<=":return a<=o?1:0;case">":return a>o?1:0;case">=":return a>=o?1:0;case"=":case"==":return a===o?1:0;case"===":return i(a,o)?1:0;case"!=":return a!==o?1:0;case"!==":return i(a,o)?0:1;case"&":return a&o;case"^":return a^o;case"|":return a|o;case"&&":return a?o:a;case"||":return a||o;case"??":return a==a?a:o}return NaN},OperatorNode}(),O={"!":14,"~":14,"**":13,"*":12,"/":12,"%":12,"+":11,"-":11,"<<":10,">>":10,">>>":10,"<":9,"<=":9,">":9,">=":9,"=":8,"==":8,"!=":8,"===":8,"!==":8,"&":7,"^":6,"|":5,"&&":4,"||":3,"??":3,"?":2,":":2,",":1};function F(t,i,r,s,a,o,u){if(o[i]&&o[i].length)for(var c,h=o[i],l=h.length;l-- >0;)if((c=h[l]-r)>-1&&c<t.length)return h.splice(l,1),n(F(t.slice(0,c),i,r,s,a,o,u),F(t.slice(c+1),i,r+c+1,s,a,o,u));if(a[i]&&a[i].length)for(var f,p,N=a[i],g=N.length;g-- >0;)if(f=N[g].f-r,p=N[g].s-r,f>-1&&f<t.length&&p>f)return N.splice(g,1),new x(e(n(F(t.slice(p+1),i,r+p+1,s,a,o,u))),e(n(F(t.slice(f+1,p),i,r+f+1,s,a,o,u))),e(n(F(t.slice(0,f),i,r,s,a,o,u))));if(u[i]&&u[i].length)for(var y,d=u[i],w=d.length;w-- >0;)if((y=d[w]-r)>-1&&y<t.length)return d.splice(w,1),new b(t[y],e(n(F(t.slice(y+1),i,r+y+1,s,a,o,u))),e(n(F(t.slice(0,y),i,r,s,a,o,u))));if(s[i]&&s[i].length)for(var C,O,L=s[i],S=L.length;S-- >0;)if(C=L[S].f-r,O=L[S].s-r,C>-1&&C<t.length&&O>C)return L.splice(S,1),"("===t[C]?new v(e(n(F(t.slice(C+1,O),i+1,r+C+1,s,a,o,u)))):new m(t[C],n(F(t.slice(C+2,O),i+1,r+C+2,s,a,o,u)));var k=t.join("");return k?new A(k):[]}function L(t,n,e,i){t[n]||(t[n]=[]),t[n][e]||(t[n][e]=[]),t[n][e][e===O["**"]?"unshift":"push"](i.length)}function S(t,n,e){L(t,n,O["*"],e),e.push("*")}function k(i){i="("+i+")",y.lastIndex=0;for(var r,s,a,o,u,c=[],h=0,l="",f=0,p=0,N={},g={},v={},x={},A=O["!"],w={},C={},m={};u=y.exec(i);)switch(r=u[0]){case"[":p++;break;case"]":p--;break;default:if(0!==p)break;switch(u.index>h&&(s=i.slice(h,u.index).trim())&&(")"===l&&S(m,f,c),c.push(l=s)),r){case"(":g[f]||(g[f]=[]),g[f].push({f:c.length,s:-1}),!l||"("===l||O[l]>0||(i[u.index-1].trim()&&"NaN"!==l&&""+ +l=="NaN"?(a=g[f]&&e(g[f]))&&a.f--:(S(m,f,c),(a=g[f]&&e(g[f]))&&a.f++)),f++;break;case")":(a=g[--f]&&e(g[f]))&&(a.s=c.length,(N[f]||(N[f]=[])).push(g[f].pop()));break;default:switch(")"!==l||O[r]>0||(S(m,f,c),l="*"),r){case",":w[f]||(w[f]=[]),w[f].push(c.length);break;case"?":x[f]||(x[f]=[]),x[f].push({f:c.length,s:-1});break;case":":(a=x[f]&&e(x[f]))&&(a.s=c.length,(v[f]||(v[f]=[])).push(x[f].pop()));break;default:if("("===l||O[l]>0){if("-"!==r&&"!"!==r&&"~"!==r){h=u.index+r.length;continue}o=++A}else o=O[r];L(m,f,o,c)}}h=u.index+r.length,c.push(l=8===O[r]?r[0]+"="+(r[2]||""):r)}for(var b in m){C[b]=[];for(var k=m[b],R=k.length;R-- >0;)k[R]&&t.push.apply(C[b],k[R])}return new d(e(n(F(c.slice(1,-1),1,1,N,v,w,C))))}var R={"(":"Opening parenthesis",")":"Closing parenthesis","!":"Logical NOT","~":"Bitwise NOT","**":"Exponentiation","*":"Multiplication","/":"Division","%":"Remainder","+":"Addition","-":"Subtraction","<<":"Bitwise left shift",">>":"Bitwise right shift",">>>":"Bitwise unsigned right shift","<":"Less than","<=":"Less than or equal",">":"Greater than",">=":"Greater than or equal","=":"Equality","==":"Equality","!=":"Inequality","===":"Strict equality","!==":"Strict inequality","&":"Bitwise AND","^":"Bitwise XOR","|":"Bitwise OR","&&":"Logical AND","||":"Logical OR","??":"Coalescing NaN","?":"Conditional TRUE",":":"Conditional FALSE",",":"Comma"};export{x as ConditionalNode,A as ConstantNode,m as FunctionNode,R as OPERATORS,b as OperatorNode,v as ParenthesisNode,d as ProgramNode,N as add,k as create,k as default,f as div,c as exp,l as mul,o as num2raw,u as raw2num,p as rem,g as sub};
