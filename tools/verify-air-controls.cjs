const assert=require('node:assert/strict');
const s=require('./simulation.cjs')();
function key(seconds,...codes){s.clearHeld();for(const k of codes)s.setPlayerHeld(k,'air-check',true);for(let i=0;i<Math.round(seconds*120);i++){s.update(1/120);s.just.clear();}s.clearHeld();}
const close=(a,b,label)=>assert(Math.abs(a-b)<1e-8,`${label}: ${a} vs ${b}`);
// Check both engines: S returns all withdrawn air, W reverses it, and Down is inert.
for(const room of [0,8]){
 s.loadLevel(room);key(.1);if(!s.level.memo)key(3.4,'KeyW');
 const quantity=()=>s.level.memo?s.memoTotalAir():s.dog.air+(s.hog.storedAir||0);
 const stored=()=>s.level.memo?s.hog.gas:(s.hog.storedAir||0);
 let air=s.dog.air,pig=stored(),total=quantity(),spent=s.stats.spent||0;
 key(.3,'ArrowDown');close(s.dog.air,air,'Down must not transfer air');close(stored(),pig,'Down must not inflate hedgehog');
 key(.3,'KeyS');assert(s.dog.air<air-.07,'S shrinks dog');assert(stored()>pig+.07,'S gives withdrawn air to hedgehog');close(quantity(),total,'S conserves shared air');close(s.stats.spent||0,spent,'S does not vent air');assert(!s.hog.jet,'S is not a jet action');
 air=s.dog.air;pig=stored();key(.2,'KeyW');assert(s.dog.air>air+.04,'W gives air to dog');assert(stored()<pig-.04,'W takes it from hedgehog');close(quantity(),total,'W recycles stored air');
 air=s.dog.air;pig=stored();key(.3,'KeyW','KeyS');close(s.dog.air,air,'opposite keys cancel');close(stored(),pig,'opposite keys do not create air');
 key(3,'KeyS');close(s.dog.air,0,'S can fully deflate dog even when hedgehog is visually full');close(quantity(),total,'holding S retains all air');
 key(.2,'KeyF');close(s.dog.air,0,'F does not inflate dog');key(2,'KeyW');assert(s.dog.air>.04,'W reinflates the dog after a full return');assert(s.hog.bloat<.9,'W can shrink the inflated hedgehog again');
}
// The tutorial teaches W, S, rope, exit; no separate vent/Down lesson remains.
s.loadLevel(17);key(1.05,'KeyW');assert(s.memo.objects.find(p=>p.id==='give').done);assert(s.getRoomGuide().keys.includes('S'));
const total=s.memoTotalAir();key(1.4,'KeyS');close(s.memoTotalAir(),total,'tutorial S retains total air');assert(s.memo.objects.find(p=>p.id==='vent').done&&s.memo.objects.find(p=>p.id==='return').done);assert(s.getRoomGuide().keys.includes('0'));assert.equal(s.getRoomGuide().total,4);
console.log('W/S bidirectional air, full return, conservation, opposite-key cancellation, disabled Down, F isolation and four-step tutorial passed.');
