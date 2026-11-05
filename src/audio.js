let ac=null,master=null,jetGain=null,nbuf=null;
function initAudio(){
  if(ac){if(ac.state==='suspended')ac.resume();return;}
  try{
    ac=new (window.AudioContext||window.webkitAudioContext)();
    master=ac.createGain();master.gain.value=muted?0:.32;master.connect(ac.destination);
    const o=ac.createOscillator();o.type='sawtooth';o.frequency.value=150;
    const lfo=ac.createOscillator();lfo.frequency.value=17;const lg=ac.createGain();lg.gain.value=60;lfo.connect(lg);lg.connect(o.frequency);
    const f=ac.createBiquadFilter();f.type='lowpass';f.frequency.value=900;
    jetGain=ac.createGain();jetGain.gain.value=0;o.connect(f);f.connect(jetGain);jetGain.connect(master);o.start();lfo.start();
  }catch(e){ac=null;}
}
function setJet(on){if(ac&&jetGain)jetGain.gain.setTargetAtTime(on?.16:0,ac.currentTime,.03);}
function tone(type,f0,f1,dur,vol){if(!ac)return;const t=ac.currentTime,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+dur);g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.02);}
function noise(dur,vol,type,f0,f1){if(!ac)return;if(!nbuf){nbuf=ac.createBuffer(1,ac.sampleRate,ac.sampleRate);const d=nbuf.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;}const t=ac.currentTime,s=ac.createBufferSource();s.buffer=nbuf;const f=ac.createBiquadFilter();f.type=type;f.frequency.setValueAtTime(f0,t);f.frequency.exponentialRampToValueAtTime(f1,t+dur);const g=ac.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.001,t+dur);s.connect(f);f.connect(g);g.connect(master);s.start(t);s.stop(t+dur+.02);}
const sPop=()=>{noise(.2,.9,'highpass',1400,400);tone('sine',180,50,.18,.6);};
const sSmallPop=()=>{noise(.1,.5,'highpass',1800,600);};
const sPump=()=>noise(.28,.35,'bandpass',500,1600);
const sThud=()=>tone('sine',110,45,.12,.4);
const sHop=()=>tone('square',300,520,.08,.05);
const sBoing=()=>tone('sine',380,760,.14,.18);
const sSqueak=()=>tone('triangle',900,1400,.09,.15);
const sGrab=()=>tone('triangle',700,1000,.07,.12);
const sCurl=()=>tone('triangle',520,300,.09,.12);
const sBonk=()=>tone('sine',260,140,.07,.18);
const sCork=()=>{tone('sine',600,200,.08,.3);noise(.05,.3,'bandpass',2000,1000);};
const sFlat=()=>tone('sawtooth',160,70,.25,.08);
const sFall=()=>tone('sine',500,90,.5,.2);
const sCreak=()=>tone('sawtooth',230,170,.12,.04);
const sWin=()=>[523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone('triangle',f,f*1.001,.2,.18),i*110));

