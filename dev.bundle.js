(()=>{"use strict";const e=[{id:"r",name:"red"},{id:"o",name:"orange"},{id:"y",name:"yellow"},{id:"g",name:"green"},{id:"c",name:"cyan"},{id:"b",name:"blue"},{id:"v",name:"violet"}],t="f",s="-",a="x",r=e=>(t,s,a)=>{const r=a.value;a.value=function(...t){const s=performance.now(),a=r.apply(this,t),l=performance.now();return console.log(`[INFO] Module { ${e} } took: ${l-s} ms.`),a}};class l{static getRandomInt(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e))+e}static getRandomIntInclusive(e,t){return e=Math.ceil(e),t=Math.floor(t),Math.floor(Math.random()*(t-e+1))+e}static removeArrayDuplicates(e){return e.filter(((e,t,s)=>s.findIndex((t=>JSON.stringify(t)===JSON.stringify(e)))===t))}}var i=function(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)};console.log("Loaded: Collider.ts");class n{constructor(e,t){this.board={height:e,width:t}}checkAllAxis(e){let t=[];return t=t.concat(this.checkAxis(e,"column")),t=t.concat(this.checkAxis(e,"row")),t=t.concat(this.checkSlants(e)),t=l.removeArrayDuplicates(t),t}checkAxis(e,t){let s,a,r=[];switch(t){case"column":s=this.board.width,a=this.board.height;break;case"row":s=this.board.height,a=this.board.width}for(let l=0;l<s;l++){let s=0,i="column"===t?e[0][l]:e[l][0],n=i.color,o=!1,h=[];for(let d=0;d<a;d++){let a,c;switch(t){case"column":a=l,c=d;break;case"row":a=d,c=l}let f=e[c][a];n&&f.color===n?(s++,h.push(f),s>=3&&(o=!0)):(s=1,i=e[c][a],n=i.color,o=!1,h=[i]),o&&(r=r.concat(h))}}return r}checkSlant(e,t,s,a,r){let l=[],i=1,n=e[s][t],o=n.color,h=!1,d=[n];for(;r&&!(t+a>this.board.width-1||t+a<0||s+1>this.board.height-1);){let r=e[s+1][t+a];o&&o===r.color?(i++,d.push(r),i>=3&&(h=!0)):(i=1,n=e[s+1][t+a],o=n.color,d=[n]),h&&(h=!1,l=l.concat(d),d=[]),1===a?t++:t--,s++}return l}checkSlants(e){let t=[];for(let s=0;s<this.board.width-2;s++)t=t.concat(this.checkSlant(e,s,0,1,this.board.width-1)),t=t.concat(this.checkSlant(e,this.board.width-1,this.board.height-3-s,-1,this.board.height-1));for(let s=0;s<this.board.height;s++)t=t.concat(this.checkSlant(e,0,s,1,this.board.width-1)),t=t.concat(this.checkSlant(e,s,0,-1,this.board.height-1));return t}}!function(e,t,s,a){var r,l=arguments.length,i=l<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,s):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,s,a);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(i=(l<3?r(i):l>3?r(t,s,i):r(t,s))||i);l>3&&i&&Object.defineProperty(t,s,i)}([r("pattern detection"),i("design:type",Function),i("design:paramtypes",[Array]),i("design:returntype",Array)],n.prototype,"checkAllAxis",null);var o=function(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)};console.log("Loaded: Pathfinder.ts");class h{constructor(e,t){this.board={height:e,width:t},this.debugMode=!1,this.searchOffsetArr=[{x:0,y:-1},{x:-1,y:0},{x:1,y:0},{x:0,y:1}]}checkIfEndPointsAreNeighbors(e){for(let t=0;t<this.searchOffsetArr.length;t++)if(!this.checkOffsetOutOfIndex(this.finish,t)&&"s"===e[this.finish.y+this.searchOffsetArr[t].y][this.finish.x+this.searchOffsetArr[t].x].type)return!0;return!1}checkOffsetOutOfIndex(e,t){return e.x+this.searchOffsetArr[t].x<0||e.x+this.searchOffsetArr[t].x>this.board.width-1||e.y+this.searchOffsetArr[t].y<0||e.y+this.searchOffsetArr[t].y>this.board.height-1}findPath(e){let r=[];for(let l=0;l<this.board.height;l++){r.push([]);for(let i=0;i<this.board.width;i++)switch(r[l].push({pathHelper:-1,x:i,y:l,wasSearched:!1}),e[l][i].type){case t:r[l][i].type=t,this.finish=r[l][i];break;case s:r[l][i].type=s;break;case a:r[l][i].type=a;break;case"s":Object.assign(r[l][i],{type:"s",wasSearched:!0}),this.start=r[l][i];break;default:console.error(`[ERROR] Board corrupted. x: ${l} y: ${i}, type: ${e[l][i]}`,e)}}let l=!1,i=0,n=[r[this.start.y][this.start.x]];for(;!l;){let e=[...n];for(let s=0;s<e.length;s++){let o=e[s];for(let e=0;e<this.searchOffsetArr.length;e++){if(this.checkOffsetOutOfIndex(o,e))continue;let s=r[o.y+this.searchOffsetArr[e].y][o.x+this.searchOffsetArr[e].x];if(!s.wasSearched&&(s.wasSearched=!0,s.type!==a&&(s.pathHelper=i,n.push(s),s.type===t))){l=!0;break}}n.splice(n.indexOf(o),1)}if(0===n.length)break;i++}return this.reverseSearch(r)}reverseSearch(e){let t=[this.finish];if(this.checkIfEndPointsAreNeighbors(e))return t;let s=this.finish,a=!1;for(;!a;){let r=s;for(let r=0;r<this.searchOffsetArr.length;r++){if(this.checkOffsetOutOfIndex(s,r))continue;let l=e[s.y+this.searchOffsetArr[r].y][s.x+this.searchOffsetArr[r].x];if(l.pathHelper===s.pathHelper-1&&(t.push(l),s=l),0===l.pathHelper){a=!0;break}}if(s===r)return this.debugMode&&console.log("[DEBUG] Hovered tile cannot be accessed."),a=!0,[]}return this.debugMode&&console.log("[DEBUG] Shortest path length:",t.length),t}}(function(e,t,s,a){var r,l=arguments.length,i=l<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,s):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,s,a);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(i=(l<3?r(i):l>3?r(t,s,i):r(t,s))||i);l>3&&i&&Object.defineProperty(t,s,i)})([r("pathfinding"),o("design:type",Function),o("design:paramtypes",[Array]),o("design:returntype",Array)],h.prototype,"findPath",null),console.log("Loaded: Renderer.ts");class d{constructor(e,t,s){this.board={height:t,instance:e,width:s},this.renderPathFlag=!1,this.selectedStart=null,this.endPoints={finish:null,start:null},this.lastRenderedPath=[]}static clearAndAppendDisplay(e){let t=document.getElementById("js-display");for(;t.firstChild;)t.removeChild(t.firstChild);t.appendChild(e)}static clearDeletedBalls(e){for(let t=0;t<e.length;t++)document.querySelector(`[data-x="${e[t].x}"][data-y="${e[t].y}"]`).firstChild.remove()}clearLastRenderedPath(e,t){let s=[...this.lastRenderedPath];for(let a=0;a<s.length;a++){let r=document.querySelector(`[data-x="${s[a].x}"][data-y="${s[a].y}"]`);e?(r.classList.add("ball--path-afterimage"),r.classList.remove("ball--path"),setTimeout((()=>{for(let e=0;e<s.length;e++)r.classList.remove("ball--path-afterimage")}),t)):r.classList.remove("ball--path")}this.lastRenderedPath=[]}renderBoard(){let e=document.createElement("table");e.classList.add("board");for(let t=0;t<this.board.height;t++){let s=document.createElement("tr");for(let e=0;e<this.board.width;e++){let a=document.createElement("td");a.classList.add("board__cell"),a.setAttribute("data-x",e.toString()),a.setAttribute("data-y",t.toString()),this.setTileEvents(a),s.appendChild(a)}e.appendChild(s)}d.clearAndAppendDisplay(e)}static renderBalls(e){for(let t=0;t<e.length;t++){let s=e[t],a=document.createElement("div");a.classList.add("ball","ball-color--"+s.color),document.querySelector(`[data-x="${s.x}"][data-y="${s.y}"]`).appendChild(a)}}renderPath(e){this.clearLastRenderedPath();let t={finish:{x:parseInt(e.dataset.x),y:parseInt(e.dataset.y)},start:this.endPoints.start},s=this.board.instance.getPath(t);this.lastRenderedPath=[...s];for(let e=0;e<s.length;e++)document.querySelector(`[data-x="${s[e].x}"][data-y="${s[e].y}"]`).classList.add("ball--path")}setRenderForBoardEvents(){this.board.instance.eventInterface.addEventListener("deletedBalls",(e=>{d.clearDeletedBalls(e.detail.balls);let t=document.getElementById("js-points-count");t.innerText=(parseInt(t.innerText)+e.detail.points).toString()})),this.board.instance.eventInterface.addEventListener("gameEnded",(e=>{this.clearLastRenderedPath(),d.renderBalls(e.detail.lastBalls),Array.from(document.getElementsByTagName("td")).forEach((e=>{e.onclick=null,e.onmouseenter=null,e.onmouseout=null})),console.log(`[INFO] Game lasted: ${Math.round(e.detail.elapsedTime/36e5)}h ${Math.round(e.detail.elapsedTime/6e4)}m ${Math.round(e.detail.elapsedTime/1e3)}s`),alert("Koniec gry. Twój wynik to: "+e.detail.points)})),this.board.instance.eventInterface.addEventListener("generatedBalls",(e=>d.renderBalls(e.detail))),this.board.instance.eventInterface.addEventListener("previewedBalls",(e=>{let t=document.getElementById("js-color-preview");for(;t.firstChild;)t.removeChild(t.firstChild);for(let s=0;s<e.detail.length;s++){let a=document.createElement("div");a.className="ball ball-color--"+e.detail[s],t.appendChild(a)}}))}setTileEvents(e){e.onclick=()=>{let t=[{x:0,y:-1},{x:-1,y:0},{x:1,y:0},{x:0,y:1}],a=0;for(let r=0;r<t.length;r++)parseInt(e.dataset.x)+t[r].x>=0&&parseInt(e.dataset.x)+t[r].x<this.board.width&&parseInt(e.dataset.y)+t[r].y>=0&&parseInt(e.dataset.y)+t[r].y<this.board.height?this.board.instance.getBoardMapTile(parseInt(e.dataset.x)+t[r].x,parseInt(e.dataset.y)+t[r].y).type!==s&&a++:a++;if(4!==a||this.selectedStart)if(this.selectedStart||this.board.instance.getBoardMapTile(parseInt(e.dataset.x),parseInt(e.dataset.y)).type===s){if(this.selectedStart===e)Object.assign(this.endPoints,{start:null,end:null}),this.renderPathFlag=!1,this.selectedStart.children[0].classList.remove("ball--selected"),this.selectedStart=null;else if(this.selectedStart&&this.board.instance.getBoardMapTile(parseInt(e.dataset.x),parseInt(e.dataset.y)).type!==s)this.endPoints.start={x:parseInt(e.dataset.x),y:parseInt(e.dataset.y)},this.selectedStart.children[0].classList.remove("ball--selected"),this.selectedStart=e,e.children[0].classList.add("ball--selected");else if(this.selectedStart&&this.board.instance.getBoardMapTile(parseInt(e.dataset.x),parseInt(e.dataset.y)).type===s){if(this.endPoints.finish={x:parseInt(e.dataset.x),y:parseInt(e.dataset.y)},0===this.board.instance.getPath(this.endPoints).length)return this.endPoints.finish=null;this.renderPathFlag=!1,this.selectedStart.children[0].classList.remove("ball--selected"),this.selectedStart=null;let t=document.querySelector(`[data-x="${this.endPoints.start.x}"][data-y="${this.endPoints.start.y}"]`),s=document.querySelector(`[data-x="${this.endPoints.finish.x}"][data-y="${this.endPoints.finish.y}"]`);s.appendChild(t.firstChild),this.board.instance.moveBall(this.endPoints)?(this.selectedStart=null,this.clearLastRenderedPath(!0,500)):(console.log("[ERROR] Corrupted move. Trying to restore last known layout."),t.appendChild(s.firstChild))}}else this.endPoints.start={x:parseInt(e.dataset.x),y:parseInt(e.dataset.y)},this.renderPathFlag=!0,this.selectedStart&&this.selectedStart.children[0].classList.remove("ball--selected"),this.selectedStart=e,e.children[0].classList.add("ball--selected")},e.oncontextmenu=e=>{e.preventDefault(),Object.assign(this.endPoints,{start:null,end:null}),this.renderPathFlag=!1,this.selectedStart&&(this.selectedStart.children[0].classList.remove("ball--selected"),this.selectedStart=null),this.clearLastRenderedPath()},document.getElementById("js-display").oncontextmenu=e.oncontextmenu,e.onmouseenter=()=>{this.renderPathFlag&&this.renderPath(e)},e.onmouseout=()=>{this.renderPathFlag&&this.clearLastRenderedPath()}}}var c=function(e,t,s,a){var r,l=arguments.length,i=l<3?t:null===a?a=Object.getOwnPropertyDescriptor(t,s):a;if("object"==typeof Reflect&&"function"==typeof Reflect.decorate)i=Reflect.decorate(e,t,s,a);else for(var n=e.length-1;n>=0;n--)(r=e[n])&&(i=(l<3?r(i):l>3?r(t,s,i):r(t,s))||i);return l>3&&i&&Object.defineProperty(t,s,i),i},f=function(e,t){if("object"==typeof Reflect&&"function"==typeof Reflect.metadata)return Reflect.metadata(e,t)};console.log("Loaded: Board.ts");class p{constructor(e,t,a){this.height=e,this.width=t,this.boardMap=[],this.freeTiles=[];for(let e=0;e<this.height;e++){let t=[];for(let a=0;a<this.width;a++){let r={color:null,type:s,x:a,y:e};this.freeTiles.push(Object.assign({},r)),t.push(r)}this.boardMap.push(t)}this.eventInterface=new EventTarget,this.points=0,this.startTimestamp=new Date,this.ballsColorPreview=[],this.generateBallsColorPreview(a||3),this.hasFinish=!1,this.hasStart=!1,this.finish={x:null,y:null},this.start={x:null,y:null},this.collider=new n(this.height,this.width),this.pathfinder=new h(this.height,this.width),this.renderer=new d(this,this.height,this.width)}checkBoardThenDeleteBalls(){let e=JSON.parse(JSON.stringify(this.boardMap)),t=this.collider.checkAllAxis(e);if(t.length>0){this.points+=t.length;let e=new CustomEvent("deletedBalls",{detail:{balls:t,points:t.length}});this.eventInterface.dispatchEvent(e);for(let e=0;e<t.length;e++)this.updateFreeTiles(t[e].x,t[e].y,t[e].color,"add"),this.writeBoardMap(t[e].x,t[e].y,null,s)}}generateBalls(e){let t=e,r=[];for(;e;){let t=this.freeTiles[l.getRandomIntInclusive(0,this.freeTiles.length-1)];if(this.readBoardMap(t.x,t.y).type===s?(r.push({color:this.ballsColorPreview[e-1],type:a,x:t.x,y:t.y}),this.updateFreeTiles(t.x,t.y,this.ballsColorPreview[e-1],"delete"),this.writeBoardMap(t.x,t.y,this.ballsColorPreview[e-1],a),e--):console.error(`tile ${t.x} ${t.y} wasn't free`),this.freeTiles.length<=0){let e=localStorage.getItem("balls_record");(!e||this.points>parseInt(e))&&localStorage.setItem("balls_record",this.points.toString());let t=new CustomEvent("gameEnded",{detail:{elapsedTime:Date.now()-this.startTimestamp.getTime(),lastBalls:r,points:this.points}});return void this.eventInterface.dispatchEvent(t)}}this.generateBallsColorPreview(t);let i=new CustomEvent("generatedBalls",{detail:r});this.eventInterface.dispatchEvent(i)}generateBallsColorPreview(t){let s=[];for(let a=0;a<t;a++)s.push(e[l.getRandomIntInclusive(0,e.length-1)].id);this.ballsColorPreview=s;let a=new CustomEvent("previewedBalls",{detail:s});this.eventInterface.dispatchEvent(a)}getBoardMapTile(e,t){return this.readBoardMap(e,t)}getPath(e){if(this.readBoardMap(e.finish.x,e.finish.y).type===a)return[];let s=JSON.parse(JSON.stringify(this.boardMap));return s[e.finish.y][e.finish.x].type=t,s[e.start.y][e.start.x].type="s",this.pathfinder.findPath(s)}moveBall(e){if(this.boardMap[e.finish.y][e.finish.x].type!==s)return!1;if(0===this.getPath(e).length)return!1;let t=this.readBoardMap(e.start.x,e.start.y);return this.updateFreeTiles(e.finish.x,e.finish.y,t.color,"delete"),this.updateFreeTiles(e.start.x,e.start.y,null,"add"),this.writeBoardMap(e.finish.x,e.finish.y,t.color,t.type),this.writeBoardMap(e.start.x,e.start.y,null,s),this.checkBoardThenDeleteBalls(),this.generateBalls(3),!0}readBoardMap(e,t){return JSON.parse(JSON.stringify(this.boardMap))[t][e]}updateFreeTiles(e,t,s,r){if("add"===r)this.freeTiles.push({color:s,type:a,x:e,y:t});else{let s=this.freeTiles.find((s=>s.x===e&&s.y===t));s?this.freeTiles.splice(this.freeTiles.indexOf(s),1):console.error("Data corrupted!")}}startGame(e){this.renderer.renderBoard(),this.renderer.setRenderForBoardEvents(),this.generateBalls(e)}writeBoardMap(e,t,s,a){Object.assign(this.boardMap[t][e],{color:s,type:a})}}c([r("balls generation"),f("design:type",Function),f("design:paramtypes",[Number]),f("design:returntype",void 0)],p.prototype,"generateBalls",null),c([function(e,t,s){console.log("[INFO] Creating board. Loading data.")},f("design:type",Function),f("design:paramtypes",[Number]),f("design:returntype",void 0)],p.prototype,"startGame",null),globalThis.dev=class{static fixLength(e,t){if(e.length===t){for(let s=0;s<t;s++)e+=" ";return e}return e}static logBoardMap(e,t){let s="";switch(t){case"color":for(let t=0;t<e.length;t++){for(let a=0;a<e[t].length;a++)s+=" "+(null===e[t][a].color?"-":e[t][a].color);s+="\n"}console.log(s);break;case"pathHelper":for(let t=0;t<e.length;t++){for(let a=0;a<e[t].length;a++)s+=" "+e[t][a].pathHelper.toString();s+="\n"}console.log(s);break;case"type":for(let t=0;t<e.length;t++){for(let a=0;a<e[t].length;a++)s+=" "+e[t][a].type;s+="\n"}console.log(s);break;case"xy":for(let t=0;t<e.length;t++){s+="| ";for(let a=0;a<e[t].length;a++)s+=this.fixLength(e[t][a].x.toString(),e.length.toString().length)+" ",s+=this.fixLength(e[t][a].y.toString(),e[t].length.toString().length)+" | ";s+="\n"}console.log(s);break;case"wasSearched":for(let t=0;t<e.length;t++)for(let a=0;a<e[t].length;a++)s+=" "+e[t][a].wasSearched;s+="\n",console.log(s)}}static runCustomInput(){document.getElementById("js-custom-input").classList.remove("js-hide");let e=document.getElementById("js-board__x"),t=document.getElementById("js-board__y"),s=document.getElementById("js-board__obstacles");document.getElementById("js-board__generate").onclick=()=>parseInt(e.value)<5&&parseInt(t.value)<5?alert("Board to small."):parseInt(e.value)*parseInt(t.value)<parseInt(s.value)-3?alert("Too many obstacles."):(new p(parseInt(e.value),parseInt(t.value),parseInt(s.value)).startGame(parseInt(s.value)),void document.getElementById("js-custom-input").classList.add("js-hide"))}}})();
//# sourceMappingURL=dev.bundle.js.map