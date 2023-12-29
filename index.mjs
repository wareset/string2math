/* eslint-disable */
var t=Array.prototype.concat;function r(){return t.apply([],arguments)}function e(t){return t[t.length-1]}var a=Array.prototype.push;function n(t){return"function"==typeof t}var s=Object.prototype.hasOwnProperty,i=Object.hasOwn||function(t,r){return s.call(t,r)};function u(t){return t?t.toArray():["NaN"]}function c(t,r){return t?t.calculate(r):NaN}class ProgramNode{constructor(t){this.type="Program",this.data=t}toArray(){return u(this.data)}toString(){return""+(this.data||NaN)}calculate(t){return c(this.data,t)}}class GroupingNode{constructor(t){this.type="Grouping",this.data=t}toArray(){return u(this.data)}toString(){return""+(this.data||NaN)}calculate(t){return c(this.data,t)}}class ConditionNode{constructor(t,r,e){this.type="Condition",this.data=e,this.dataTrue=r,this.dataFalse=t}toArray(){return r("(",u(this.data),"?",u(this.dataTrue),":",u(this.dataFalse),")")}toString(){return`(${this.data||NaN} ? ${this.dataTrue||NaN} : ${this.dataFalse||NaN})`}calculate(t){return c(this.data,t)?c(this.dataTrue,t):c(this.dataFalse,t)}}class ArgumentNode{constructor(t){this.type="Argument",this.data=t}toArray(){return[this.data]}toString(){return""+this.data}calculate(t){var r=this.data,e=+r;if(e!=e&&"NaN"!==r&&t)for(var a,n=t.length;n-- >0;)if(i(a=t[n],r))return a[r];return e}}function o(t,e){return 0===e?t.toArray():r(",",t.toArray())}function h(t){return t.calculate(this)}class FunctionNode{constructor(t,r){this.type="Function",this.data=t,this.dataArgs=r}toArray(){return r(this.data+"(",t.apply([],this.dataArgs.map(o)),")")}toString(){return`${this.data}(${this.dataArgs.join(", ")})`}calculate(t){var r=this.data;if(t)for(var e,a=t.length;a-- >0;)if(i(e=t[a],r)&&n(e=e[r]))return e.apply(void 0,this.dataArgs.map(h,t));return NaN}}class OperationNode{constructor(t,r,e){this.type="Operation",this.data=t,this.dataLeft=e,this.dataRight=r}toArray(){var t=this.data,e=this.dataLeft,a=this.dataRight,n=u(e),s=u(a);return a?e?"!"===t||"~"===t?["NaN"]:r("(",n,t,s,")"):"!"===t||"~"===t||"-"===t?r(t,s):s:n}toString(){var t=this.data,r=this.dataLeft,e=this.dataRight,a=""+(r||NaN),n=""+(e||NaN);return e?r?"!"===t||"~"===t?"NaN":`(${a} ${t} ${n})`:"!"===t||"~"===t||"-"===t?t+n:n:a}calculate(t){var r,e=this.data,a=this.dataLeft,s=this.dataRight,u=c(a,t),o=c(s,t);if(!s)return u;if(t)for(var h,d=t.length;d-- >0;)if(i(h=t[d],e)&&n(h=h[e])){r=h;break}if(!a){switch(e){case"!":return r?r(o):+!+o;case"~":return r?r(o):~+o;case"+":return r?r(0,o):+o;case"-":return r?r(0,o):-+o}return o}if(r)return r(u,o);switch(u=+u,o=+o,e){case"**":return Math.pow(u,o);case"*":return u*o;case"/":return u/o;case"%":return u%o;case"+":return u+o;case"-":return u-o;case"<<":return u<<o;case">>":return u>>o;case">>>":return u>>>o;case"<":return u<o?1:0;case"<=":return u<=o?1:0;case">":return u>o?1:0;case">=":return u>=o?1:0;case"=":case"==":return u==o?1:0;case"===":return u===o?1:0;case"!=":return u!=o?1:0;case"!==":return u!==o?1:0;case"&":return u&o;case"^":return u^o;case"|":return u|o;case"&&":return u?o:u;case"||":return u||o;case"??":return u==u?u:o}return NaN}}var d=/\?\??|\|\|?|\*\*?|&&?|<<|>>>?|[!=]=?=?|[<>]=?|(?<!\d\.?[eE])[-+]|[,:~^%/()[\]]/g,l={"!":14,"~":14,"**":13,"*":12,"/":12,"%":12,"+":11,"-":11,"<<":10,">>":10,">>>":10,"<":9,"<=":9,">":9,">=":9,"=":8,"==":8,"!=":8,"===":8,"!==":8,"&":7,"^":6,"|":5,"&&":4,"||":3,"??":3,"?":2,":":2,",":1};function f(t,a,n,s,i,u,c){if(u[a]&&u[a].length)for(var o,h=u[a],d=h.length;d-- >0;)if((o=h[d]-n)>-1&&o<t.length)return h.splice(d,1),r(f(t.slice(0,o),a,n,s,i,u,c),f(t.slice(o+1),a,n+o+1,s,i,u,c));if(i[a]&&i[a].length)for(var l,g,p=i[a],N=p.length;N-- >0;)if(l=p[N].f-n,g=p[N].s-n,l>-1&&l<t.length&&g>l)return p.splice(N,1),new ConditionNode(e(r(f(t.slice(g+1),a,n+g+1,s,i,u,c))),e(r(f(t.slice(l+1,g),a,n+l+1,s,i,u,c))),e(r(f(t.slice(0,l),a,n,s,i,u,c))));if(c[a]&&c[a].length)for(var y,v=c[a],A=v.length;A-- >0;)if((y=v[A]-n)>-1&&y<t.length)return v.splice(A,1),new OperationNode(t[y],e(r(f(t.slice(y+1),a,n+y+1,s,i,u,c))),e(r(f(t.slice(0,y),a,n,s,i,u,c))));if(s[a]&&s[a].length)for(var w,m,b=s[a],k=b.length;k-- >0;)if(w=b[k].f-n,m=b[k].s-n,w>-1&&w<t.length&&m>w)return b.splice(k,1),"("===t[w]?new GroupingNode(e(r(f(t.slice(w+1,m),a+1,n+w+1,s,i,u,c)))):new FunctionNode(t[w],r(f(t.slice(w+2,m),a+1,n+w+2,s,i,u,c)));var x=t.join("");return x?new ArgumentNode(x):[]}function g(t,r,e,a){t[r]||(t[r]=[]),t[r][e]||(t[r][e]=[]),t[r][e][e===l["**"]?"unshift":"push"](a.length)}function p(t,r,e){g(t,r,l["*"],e),e.push("*")}function N(t){t="("+t+")";var n,s,i,u,c,o=[],h=0,N="",y=0,v=0,A={},w={},m={},b={},k=l["!"],x={},F={},O={};for(d.lastIndex=0;c=d.exec(t);)switch(n=c[0]){case"[":v++;break;case"]":v--;break;default:if(0!==v)break;switch(c.index>h&&(s=t.slice(h,c.index).trim())&&(")"===N&&p(O,y,o),o.push(N=s)),n){case"(":w[y]||(w[y]=[]),w[y].push({f:o.length,s:-1}),!N||"("===N||l[N]>0||(t[c.index-1].trim()&&"NaN"!==N&&""+ +N=="NaN"?(i=w[y]&&e(w[y]))&&i.f--:(p(O,y,o),(i=w[y]&&e(w[y]))&&i.f++)),y++;break;case")":(i=w[--y]&&e(w[y]))&&(i.s=o.length,(A[y]||(A[y]=[])).push(w[y].pop()));break;default:switch(")"!==N||l[n]>0||(p(O,y,o),N="*"),n){case",":x[y]||(x[y]=[]),x[y].push(o.length);break;case"?":b[y]||(b[y]=[]),b[y].push({f:o.length,s:-1});break;case":":(i=b[y]&&e(b[y]))&&(i.s=o.length,(m[y]||(m[y]=[])).push(b[y].pop()));break;default:if("("===N||l[N]>0){if("-"!==n&&"!"!==n&&"~"!==n){h=c.index+n.length;continue}u=++k}else u=l[n];g(O,y,u,o)}}h=c.index+n.length,o.push(N=n)}for(var $ in O){F[$]=[];for(var S=O[$],P=S.length;P-- >0;)S[P]&&a.apply(F[$],S[P])}return new ProgramNode(e(r(f(o.slice(1,-1),1,1,A,m,x,F))))}export{ArgumentNode,ConditionNode,FunctionNode,GroupingNode,OperationNode,ProgramNode,N as create};
