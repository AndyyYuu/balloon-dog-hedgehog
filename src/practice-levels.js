// Safe practice rooms append to the campaign. Existing rooms keep their indices.
LEVELS.push(
 {name:'先认识两位朋友',practice:true,lesson:'move',memo:true,world:'practice',kind:'练习 1 / 3',width:1200,softSky:true,budget:.28,dogGas:.14,dogX:170,hogX:360,
  solids:[{x:-200,y:460,w:1600,h:300}],objects:[{id:'walkHog',type:'lesson',x:-1000,y:0},{id:'walkDog',type:'lesson',x:-1000,y:0},{id:'jumpHog',type:'lesson',x:-1000,y:0},{id:'jumpDog',type:'lesson',x:-1000,y:0}],checkpoints:[],goal:{x:1040,y:380,w:110,h:80,requires:['walkHog','walkDog','jumpHog','jumpDog']},
  zones:[{x:0,title:'先练一只，再练另一只',hint:'看画面上方，一次只学一个动作。这个房间没有尖刺。'}]},
 {name:'气和绳子怎么用',practice:true,lesson:'air',memo:true,world:'practice',kind:'练习 2 / 3',width:1250,softSky:true,budget:.84,dogGas:.14,dogX:170,hogX:350,
  solids:[{x:-200,y:460,w:1650,h:300}],objects:[{id:'give',type:'lesson',x:-1000,y:0},{id:'vent',type:'lesson',x:-1000,y:0},{id:'return',type:'lesson',x:-1000,y:0},{id:'reel',type:'lesson',x:-1000,y:0}],pumps:[{x:280,y:460,cap:.84}],checkpoints:[],goal:{x:1090,y:380,w:110,h:80,requires:['give','vent','return','reel']},
  zones:[{x:0,title:'一根管子，两边分气',hint:'W 给狗气，S 放气，↓ 把气还给刺猬，0 按住收绳。跟着上方提示做。'}]},
 {name:'苹果和各自的操作',practice:true,lesson:'apple',memo:true,world:'practice',kind:'练习 3 / 3',width:1320,softSky:true,budget:.24,dogGas:.14,dogX:150,hogX:260,
  solids:[{x:-200,y:460,w:1720,h:300}],apples:[{x:365,y:447}],objects:[{id:'lamp',type:'lamp',x:725,y:378,apples:1,duration:1.1,label:'狗 / 关掉台灯'},{id:'fridge',type:'fridge',x:980,y:420,label:'刺猬 F 打开冰箱'}],checkpoints:[],goal:{x:1170,y:380,w:110,h:80,requires:['lamp','fridge']},
  zones:[{x:0,title:'靠近就能坐，操作各管各',hint:'先用刺猬滚过苹果，再让狗靠近。苹果会自动托住小狗。'}]}
);
