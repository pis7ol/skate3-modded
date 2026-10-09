// A master mixer for every Web Audio output, saved between sessions.
let volume = 1;
try { const saved=localStorage.getItem('skate-master-volume'); if(saved!==null) volume=Math.max(0,Math.min(1,Number(saved))); } catch {}
const mixers=new Map();
if(globalThis.AudioNode){
 const connect=AudioNode.prototype.connect;
 AudioNode.prototype.connect=function(destination,...args){
  if(globalThis.AudioDestinationNode && destination instanceof AudioDestinationNode){
   let gain=mixers.get(this.context);
   if(!gain){gain=this.context.createGain();gain.gain.value=volume;connect.call(gain,this.context.destination);mixers.set(this.context,gain);}
   return connect.call(this,gain,...args);
  }
  return connect.call(this,destination,...args);
 };
}
function apply(value){
 volume=value;
 for(const [context,gain] of mixers)gain.gain.setTargetAtTime(value,context.currentTime,.015);
 for(const media of document.querySelectorAll('audio,video'))media.volume=value;
 try { localStorage.setItem('skate-master-volume',String(value)); } catch {}
}
const dialog=document.createElement('dialog');dialog.id='sound-settings';dialog.setAttribute('aria-label','Sound settings');
dialog.innerHTML='<h1>SOUND SETTINGS</h1><label for="master-volume">Master volume</label><div class="volume-row"><input id="master-volume" type="range" min="0" max="100" step="1"><output for="master-volume"></output></div><p>Controls all game sounds. Set to 0% to mute.</p><button type="button">Back</button>';
const slider=dialog.querySelector('input'),output=dialog.querySelector('output');slider.value=Math.round(volume*100);output.textContent=slider.value+'%';
slider.addEventListener('input',()=>{apply(Number(slider.value)/100);output.textContent=slider.value+'%';});
dialog.querySelector('button').onclick=()=>dialog.close();
for(const type of ['keydown','keyup','pointerdown','pointerup'])dialog.addEventListener(type,e=>e.stopPropagation());
const style=document.createElement('style');style.textContent='#sound-settings{color:#eef7ff;background:#0b1c28;border:1px solid #40b9ee;width:min(420px,calc(100vw - 64px));padding:26px;font:16px monospace}#sound-settings::backdrop{background:#040609dd}#sound-settings h1{font-size:25px}#sound-settings .volume-row{display:flex;gap:20px;align-items:center;margin-top:20px}#master-volume{flex:1;accent-color:#40b9ee}#sound-settings button{padding:10px 24px;background:#194c57;color:white;border:1px solid #66d9d9;cursor:pointer}#sound-settings p{font-size:13px;color:#a6bfcc}';document.head.append(style);document.body.append(dialog);
const button=document.createElement('button');button.textContent='Sound';button.setAttribute('aria-label','Sound settings');button.onclick=()=>dialog.showModal();document.getElementById('mapbar').append(button);
