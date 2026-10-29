// كل صنف: [المفتاح, الاسم, الإيموجي, الأنواع الفرعية [المفتاح, الاسم, الإيموجي]]
const CATS=[
['top','بلوزة','👕',[['tee','بلوزة عادية','👚'],['sweater','كنزة','🧶'],['shirt','قميص','👔']]],
['bottom','بنطال','👖',[['pants','بنطال','👖'],['skirt','تنورة','👗'],['overall','أفرول','🥻']]],
['jacket','جاكيت','🧥',[]],
['hijab','حجاب','🧕',[['hj','حجاب عادي','🧕'],['shawl','شال','🧣'],['scarf','إيشارب','🧣'],['bonnet','بونيه','🧢']]],
['shoes','حذاء','👟',[['heel','كعب','👠'],['sport','رياضي','👟'],['ballet','باليرينا','🩰']]],
['acc','إكسسوار','🧢',[['neck','قلادة','📿'],['nscarf','شال رقبة','🧣'],['watch','ساعة','⌚'],['ring','خاتم','💍'],['ear','أقراط','💫'],['brace','أسوارة','🔗'],['glass','نظارة','👓'],['bag','حقيبة','👜'],['hat','قبعة','🧢'],['belt','حزام','🎗️']]]
];
const MULTI=['top','hijab','acc']; // أصناف بتسمح بأكتر من قطعة باللبسة (كنزة فوق قميص، قلادة + ساعة…)
const WX=[['hot','☀️ حار'],['mild','🌤️ معتدل'],['rain','🌧️ مطر'],['cold','❄️ بارد']];
const VIEWS=[['wardrobe','خزانتي'],['stylist','المصمّمة ✨'],['build','ركّب لبسة'],['tomorrow','لبسة بكرا']];
const $=s=>document.querySelector(s);
const esc=t=>String(t).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let S={items:[],outfits:[],tm:{ids:[],w:'mild',ok:[]}},view='wardrobe',filter='all',sf='all',sel={},pending=null,sampleFn=null,ai={busy:false,res:null,occ:'uni',err:''};
try{const d=JSON.parse(localStorage.getItem('lbsty'));if(d)S=Object.assign(S,d)}catch(e){}
function save(){try{localStorage.setItem('lbsty',JSON.stringify(S))}catch(e){toast('المساحة امتلت، احذف قطع قديمة')}}
function toast(t){const e=$('#toast');e.textContent=t;e.classList.add('on');clearTimeout(toast.t);toast.t=setTimeout(()=>e.classList.remove('on'),2200)}
const catOf=c=>CATS.find(x=>x[0]==c)||[];
const subsOf=c=>catOf(c)[3]||[];
const subOf=(c,s)=>subsOf(c).find(x=>x[0]==s);
const emo=(c,s)=>(subOf(c,s)||catOf(c))[2]||'👕';
const slot=i=>MULTI.includes(i.cat)?i.cat+':'+(i.sub||'x'):i.cat;
const ci=c=>CATS.findIndex(x=>x[0]==c);
const selIds=()=>Object.values(sel).filter(id=>id&&byId(id)).sort((a,b)=>ci(byId(a).cat)-ci(byId(b).cat));
const subTag=i=>{const s=subOf(i.cat,i.sub);return s?`<small>${s[1]}</small>`:''};
function fillSub(c,v){const s=$('#sb');if(!s)return;const l=subsOf(c);s.innerHTML=l.length?l.map(x=>`<option value="${x[0]}">${x[2]} ${x[1]}</option>`).join(''):'<option value="">— بدون نوع —</option>';s.disabled=!l.length;if(v&&l.some(x=>x[0]==v))s.value=v}
const byId=id=>S.items.find(i=>i.id==id);
const thumb=i=>i.img?`<img src="${i.img}" alt="${esc(i.name)}">`:`<span class="ph">${emo(i.cat,i.sub)}</span>`;
function fit(file){return new Promise(r=>{const fr=new FileReader();fr.onload=()=>{const im=new Image();im.onload=()=>{const s=Math.min(1,480/Math.max(im.width,im.height)),c=document.createElement('canvas');c.width=im.width*s;c.height=im.height*s;c.getContext('2d').drawImage(im,0,0,c.width,c.height);r(c.toDataURL('image/jpeg',.72))};im.src=fr.result};fr.readAsDataURL(file)})}

function nav(){$('#nav').innerHTML=VIEWS.map(v=>`<button data-v="${v[0]}" aria-current="${view==v[0]}">${v[1]}</button>`).join('')}

function wardrobe(){
const list=S.items.filter(i=>(filter=='all'||i.cat==filter)&&(sf=='all'||i.sub==sf));
return `<h2>ضيف قطعة</h2><div class="card add">
<label class="photo" id="ph"><input type="file" accept="image/*" id="file">📷 صوّر القطعة أو اختار صورة</label>
<input type="text" id="nm" placeholder="اسم القطعة (مثلاً: هودي رمادي)" maxlength="40">
<select id="ct" aria-label="الصنف">${CATS.map(c=>`<option value="${c[0]}">${c[2]} ${c[1]}</option>`).join('')}</select>
<select id="sb" aria-label="النوع"></select>
<button class="btn" data-act="add">ضيفها</button></div>
<h2>خزانتي</h2>
<div class="chips"><button class="chip" data-f="all" aria-pressed="${filter=='all'}">الكل</button>${CATS.map(c=>`<button class="chip" data-f="${c[0]}" aria-pressed="${filter==c[0]}">${c[1]}</button>`).join('')}</div>
${subsOf(filter).length?`<div class="chips" role="group" aria-label="النوع"><button class="chip" data-sf="all" aria-pressed="${sf=='all'}">الكل</button>${subsOf(filter).map(s=>`<button class="chip" data-sf="${s[0]}" aria-pressed="${sf==s[0]}">${s[2]} ${s[1]}</button>`).join('')}</div>`:''}
${list.length?`<div class="grid">${list.map(i=>`<div class="item"><div class="pic">${thumb(i)}</div><b>${esc(i.name)}</b>${subTag(i)}<button class="del" data-del="${i.id}" aria-label="احذف ${esc(i.name)}">×</button></div>`).join('')}</div>`:`<div class="card empty">الخزانة فاضية. ضيف أول قطعة من فوق.</div>`}`}

const pickBtn=i=>`<button class="pick" data-pick="${i.id}" aria-pressed="${sel[slot(i)]==i.id}"><div class="pic">${thumb(i)}</div><span>${esc(i.name)}</span></button>`;
function pickers(c){const l=S.items.filter(i=>i.cat==c[0]);if(!l.length)return `<p class="empty">ما في قطع هون. ضيفها من خزانتي.</p>`;const subs=subsOf(c[0]);if(!subs.length)return `<div class="row">${l.map(pickBtn).join('')}</div>`;
const gs=[...subs.map(s=>[s[2]+' '+s[1],l.filter(i=>i.sub==s[0])]),['أخرى',l.filter(i=>!subs.some(s=>s[0]==i.sub))]].filter(g=>g[1].length);
return gs.map(g=>`<h3>${g[0]}</h3><div class="row">${g[1].map(pickBtn).join('')}</div>`).join('')}
function build(){
const chosen=selIds().map(byId);
return `<div class="build"><div><h2>لبستك</h2><div class="card"><div class="stage">${chosen.length?chosen.map(i=>`<div class="item"><div class="pic">${thumb(i)}</div><b>${esc(i.name)}</b></div>`).join(''):`<div class="empty" style="grid-column:1/-1">اختار قطع من اليمين وشوف اللبسة هون.</div>`}</div>
<div class="actions"><button class="btn" data-act="tomorrow">خليها لبكرا</button><button class="btn alt" data-act="saveo">احفظها</button></div></div></div>
<div>${CATS.filter(c=>c[0]!='hijab'||S.items.some(i=>i.cat=='hijab')).map(c=>`<h2>${c[2]} ${c[1]}</h2>${pickers(c)}`).join('')}</div></div>`}

function tomorrow(){
const items=S.tm.ids.map(byId).filter(Boolean),d=new Date(Date.now()+864e5).toLocaleDateString('ar',{weekday:'long',day:'numeric',month:'long'});
const n=items.filter(i=>S.tm.ok.includes(i.id)).length,hasJ=items.some(i=>i.cat=='jacket'),w=S.tm.w;
let tip='';
if(w=='cold'&&!hasJ)tip=['bad','الجو بارد وما في جاكيت باللبسة. ضيف واحد.'];
else if(w=='hot'&&hasJ)tip=['bad','الجو حار، الجاكيت ممكن يتعبك. فكّر تشيله.'];
else if(w=='rain')tip=['bad','ممكن تشتي. جهّز شمسية أو جاكيت يتحمل المي.'];
else if(items.length)tip=['good','اللبسة مناسبة للجو.'];
return `<h2>لبسة بكرا</h2><p class="tag">${d}</p>
${tempBox()}<div class="wx" role="group" aria-label="الجو">${WX.map(x=>`<button class="chip" data-w="${x[0]}" aria-pressed="${w==x[0]}">${x[1]}</button>`).join('')}</div>
${items.length?`${tip?`<div class="tip ${tip[0]}">${tip[1]}</div>`:''}
<div class="card"><div class="grid">${items.map(i=>`<div class="item"><div class="pic">${thumb(i)}</div><b>${esc(i.name)}</b><button class="ready" data-ok="${i.id}" aria-pressed="${S.tm.ok.includes(i.id)}">${S.tm.ok.includes(i.id)?'✓ جاهزة':'جاهزة؟'}</button></div>`).join('')}</div>
<p style="margin:14px 0 6px;font-weight:700">${n==items.length?'كل شي جاهز، نام مرتاح':`جاهز ${n} من ${items.length}`}</p><div class="bar"><i style="width:${n/items.length*100}%"></i></div></div>`
:`<div class="card empty">ما اخترت لبسة لبكرا. روح لتبويب "ركّب لبسة".</div>`}
<h2>لبساتي المحفوظة</h2><div class="card">${S.outfits.length?S.outfits.map(o=>`<div class="saved"><div class="mini">${o.ids.map(byId).filter(Boolean).map(i=>`<span>${thumb(i)}</span>`).join('')}</div><b>${esc(o.name)}</b><button class="btn alt" data-use="${o.id}">لبكرا</button><button class="btn alt" data-delo="${o.id}">احذف</button></div>`).join(''):`<div class="empty">لسا ما حفظت ولا لبسة.</div>`}</div>`}

function render(){nav();$('#app').innerHTML={wardrobe,stylist,build,tomorrow}[view]();const f=$('#file');if(f)f.onchange=()=>onFile(f);if($('#ct'))fillSub($('#ct').value)}
function toBlob(d){const b=atob(d.split(',')[1]),a=new Uint8Array(b.length);for(let i=0;i<b.length;i++)a[i]=b.charCodeAt(i);return new Blob([a],{type:'image/jpeg'})}
async function onFile(f){if(!f.files[0])return;pending=await fit(f.files[0]);$('#ph').innerHTML=`<input type="file" accept="image/*" id="file"><img src="${pending}" alt="">`;$('#file').onchange=()=>onFile($('#file'));autotag()}
async function autotag(){const nm=$('#nm');if(!sampleFn||!nm)return;nm.placeholder='عم أتعرّف على القطعة…';try{const lim=await sampleFn.limits();if(lim.images){const r=await sampleFn(`هاي صورة قطعة ملابس. ردّ بـ JSON فقط بدون أي شي ثاني: {"name":"اسم قصير بالعربي مع اللون مثل: هودي رمادي","cat":"top|bottom|jacket|hijab|shoes|acc","sub":"النوع الفرعي من القائمة تحت، أو فاضي"}. الأنواع الفرعية: ${CATS.filter(c=>c[3].length).map(c=>c[0]+': '+c[3].map(s=>s[0]).join('|')).join(' ; ')}`,{images:[toBlob(pending)],modelTier:'quick',cache:false});const j=JSON.parse((r.text.match(/\{[\s\S]*\}/)||['{}'])[0]);const n2=$('#nm');if(n2&&j.name&&!n2.value)n2.value=j.name;if($('#ct')&&CATS.some(c=>c[0]==j.cat)){$('#ct').value=j.cat;fillSub(j.cat,j.sub)}}}catch(e){}const n3=$('#nm');if(n3)n3.placeholder='اسم القطعة (مثلاً: هودي رمادي)'}
const OCC=[['uni','🎓 جامعة'],['out','🍔 طلعة مع الشلة'],['fm','🎩 مناسبة رسمية'],['sp','🏃 رياضة']];
function tempBox(){return `<label class="temp">🌡️ حرارة بكرا <input type="number" id="tp" inputmode="numeric" min="-10" max="50" placeholder="22" value="${S.tm.t==null?'':S.tm.t}"> °م <small>شوفها من تطبيق الطقس واكتبها، وأنا بضبط الجو</small></label>`}
const KW={fm:/قميص|رسمي|كلاسيك|سترة|بدلة|جلد/,sp:/رياض|ترنج|شورت|سبور|كوتشي/,out:/جينز|هودي|سنيكرز|كاجوال|تيشرت/,uni:/جينز|هودي|تيشرت|قميص|سنيكرز|كوتشي/};
const SB={fm:['shirt','heel','skirt'],sp:['sport','tee','pants'],out:['sport','sweater','tee','pants','skirt'],uni:['sweater','shirt','sport','ballet','pants']};
function ruleStyle(base=[]){const w=S.tm.w,oc=ai.occ,ids=base.filter(byId);
const best=(cat,ok)=>{const l=S.items.filter(i=>i.cat==cat&&!ids.includes(i.id)&&(!ok||ok(i)));if(!l.length)return;const sc=new Map(l.map(i=>[i.id,(KW[oc].test(i.name)?2:0)+(SB[oc].includes(i.sub)?2:0)+Math.random()-(ai.res&&ai.res.ids.includes(i.id)?1.5:0)]));return l.sort((a,b)=>sc.get(b.id)-sc.get(a.id))[0]};
const add=x=>{if(x)ids.push(x.id);return x};
const has=(cat,sub)=>ids.some(id=>{const i=byId(id);return i.cat==cat&&(!sub||i.sub==sub)});
// بنطال / تنورة / أفرول
if(!has('bottom'))add(best('bottom'));
const ov=has('bottom','overall');
// بلوزة: الأفرول غالباً بدون بلوزة، والكنزة بتنضاف بالبرد
if(!has('top')&&(!ov||Math.random()<.5)){if(!add(best('top',i=>i.sub!='sweater')))add(best('top'))}
if(w=='cold'&&!has('top','sweater'))add(best('top',i=>i.sub=='sweater'));
// حجاب: بونيه + حجاب + شال أو إيشارب (واحد منهم)
['bonnet','hj'].forEach(k=>{if(!has('hijab',k))add(best('hijab',i=>i.sub==k))});
if(!has('hijab','shawl')&&!has('hijab','scarf'))add(best('hijab',i=>i.sub=='shawl'||i.sub=='scarf'));
if(!has('hijab'))add(best('hijab'));
// حذاء + جاكيت
if(!has('shoes'))add(best('shoes'));
if(!has('jacket')&&w!='hot'&&oc!='sp'&&(w=='cold'||w=='rain'||Math.random()<.4))add(best('jacket'));
// إكسسوارات: قطعة من كل نوع موجود عند المستخدم
subsOf('acc').forEach(s=>{const k=s[0];if(has('acc',k))return;if(k=='hat'&&(has('hijab')||oc=='fm'))return;if(k=='nscarf'&&w=='hot')return;add(best('acc',i=>i.sub==k))});
if(!has('acc')&&Math.random()<.5)add(best('acc'));
const T={hot:'الجو حار فاخترتلك قطع خفيفة بدون جاكيت.',cold:'الجو بارد فحطيت جاكيت للدفا إذا عندك.',rain:'ممكن تشتي فاخترت لبسة عملية مع جاكيت إذا متوفر.',mild:'الجو معتدل فاللبسة مريحة وبتناسب النهار.'};
return {ids,why:T[w]+' ومرتّبة على مناسبة "'+OCC.find(o=>o[0]==ai.occ)[1].replace(/^\S+\s/,'')+'".'}}
function stylist(){
if(S.items.length<2)return `<h2>المصمّمة ✨</h2><div class="card empty">ضيف كم قطعة لخزانتك أول، وبعدها بنسّقلك.</div>`;
const items=ai.res?ai.res.ids.map(byId).filter(Boolean):[];
return `<h2>المصمّمة ✨</h2><p class="tag">قلّها شو رايح تعمل وأنا بنسّقلك من خزانتك.</p>
<div class="wx" role="group" aria-label="المناسبة">${OCC.map(o=>`<button class="chip" data-o="${o[0]}" aria-pressed="${ai.occ==o[0]}">${o[1]}</button>`).join('')}</div>
${tempBox()}<div class="wx" role="group" aria-label="الجو">${WX.map(x=>`<button class="chip" data-w="${x[0]}" aria-pressed="${S.tm.w==x[0]}">${x[1]}</button>`).join('')}</div>
<div class="actions"><button class="btn" data-act="style" ${ai.busy?'disabled':''}>${ai.busy?'عم فكّر…':(ai.res?'غيّرلي التنسيقة':'نسّقلي لبسة')}</button></div>
${ai.err?`<div class="tip bad">${ai.err}</div>`:''}
${items.length?`<div class="card" style="margin-top:14px"><div class="grid">${items.map(i=>`<div class="item"><div class="pic">${thumb(i)}</div><b>${esc(i.name)}</b></div>`).join('')}</div><p style="font-weight:600">${esc(ai.res.why)}</p><div class="actions"><button class="btn" data-act="aitm">خليها لبكرا</button><button class="btn alt" data-act="aisave">احفظها</button></div></div>`:''}`}
async function style(){
if(ai.busy)return;if(!sampleFn){ai.err='';ai.res=ruleStyle();if(!ai.res.ids.length)ai.err='ضيف قطع أكتر لخزانتك.';return render()}ai.busy=true;ai.err='';render();
const oc=OCC.find(o=>o[0]==ai.occ)[1],wx=WX.find(x=>x[0]==S.tm.w)[1],list=S.items.map(i=>({id:i.id,name:i.name,cat:i.cat,sub:i.sub||''}));
const q=`إنتِ مصمّمة أزياء شبابية بتنسّق للشباب والبنات. هاي قطع خزانة شخص (JSON): ${JSON.stringify(list)}. المناسبة: ${oc}. الجو: ${wx}. ${ai.res?'اللبسة السابقة كانت '+JSON.stringify(ai.res.ids)+'، جرّب تركيبة مختلفة. ':''}اختار لبسة وحدة من هالقطع بس، ركّبي لبسة كاملة: من كل صنف (top,bottom,jacket,hijab,shoes,acc) عند الشخص قطع منه اختاري قطعة مناسبة، ومن كل نوع إكسسوار موجود (قلادة، خاتم، ساعة، أقراط، شال رقبة…) اختاري قطعة. مسموح كنزة فوق قميص. الأفرول (overall) بيحل مكان البنطال وغالباً بدون بلوزة. إذا ما عنده قطع من صنف أو نوع تخطّيه ولا تخترعي قطع مو بالقائمة. ما تحطي قبعة مع حجاب. انتبه للألوان وللجو. ردّ بـ JSON فقط بدون أي شي ثاني: {"ids":["..."],"why":"جملتين بالعربي المحكي ليش هالتنسيقة حلوة"}`;
try{const r=await sampleFn(q,{modelTier:'quick',cache:false});const j=JSON.parse(r.text.match(/\{[\s\S]*\}/)[0]);const ids=(j.ids||[]).map(String).filter(x=>byId(x));if(!ids.length)throw 0;ai.res={ids:ruleStyle(ids).ids,why:j.why||''}}catch(e){ai.res=ruleStyle();if(!ai.res.ids.length)ai.err='ما زبطت معي، جرّب مرة ثانية.'}
ai.busy=false;if(view=='stylist')render()}
if(window.claude)claude.use('sample').then(f=>{if(f){sampleFn=f;if(view=='stylist')render()}}).catch(()=>{});
function go(v){view=v;render();scrollTo(0,0)}

document.addEventListener('change',e=>{if(e.target.id=='ct')return fillSub(e.target.value);if(e.target.id!='tp')return;const v=e.target.value.trim(),t=v===''?null:Number(v);if(t!==null&&isNaN(t))return;S.tm.t=t;if(t!==null&&S.tm.w!='rain')S.tm.w=t>=27?'hot':t<=14?'cold':'mild';save();render()});
document.addEventListener('click',async e=>{
const t=e.target.closest('button');if(!t)return;const D=t.dataset;
if(D.v)return go(D.v);
if(D.f){filter=D.f;sf='all';return render()}
if(D.sf){sf=D.sf;return render()}
if(D.o){ai.occ=D.o;return render()}
if(D.act=='style')return style();
if(D.act=='aitm'){S.tm={ids:ai.res.ids,w:S.tm.w,ok:[]};save();return go('tomorrow')}
if(D.act=='aisave'){S.outfits.push({id:String(Date.now()),name:'لبسة '+(S.outfits.length+1),ids:ai.res.ids});save();return toast('انحفظت اللبسة')}
if(D.pick){const i=byId(D.pick);sel[slot(i)]=sel[slot(i)]==i.id?null:i.id;return render()}
if(D.w){S.tm.w=D.w;save();return render()}
if(D.ok){const k=S.tm.ok,x=k.indexOf(D.ok);x<0?k.push(D.ok):k.splice(x,1);save();return render()}
if(D.del){S.items=S.items.filter(i=>i.id!=D.del);save();return render()}
if(D.use){const o=S.outfits.find(o=>o.id==D.use);S.tm={ids:o.ids,w:S.tm.w,ok:[]};save();toast('صارت لبسة بكرا');return render()}
if(D.delo){S.outfits=S.outfits.filter(o=>o.id!=D.delo);save();return render()}
if(D.act=='add'){const nm=$('#nm').value.trim();if(!nm)return toast('اكتب اسم القطعة');S.items.push({id:String(Date.now()),name:nm,cat:$('#ct').value,sub:$('#sb').value||null,img:pending});pending=null;save();toast('انضافت للخزانة');return render()}
if(D.act=='tomorrow'||D.act=='saveo'){const ids=selIds();if(!ids.length)return toast('اختار قطعة وحدة على الأقل');
if(D.act=='saveo'){S.outfits.push({id:String(Date.now()),name:'لبسة '+(S.outfits.length+1),ids});save();return toast('انحفظت اللبسة')}
S.tm={ids,w:S.tm.w,ok:[]};save();return go('tomorrow')}
});
render();

const STEPS=[['📸','صوّر قطعك','صوّر كل قطعة من خزانتك مرة وحدة، والموقع بيسمّيها ويصنّفها (بلوزة، كنزة، قميص، حجاب، حذاء، إكسسوار…) وبتضل محفوظة على جهازك.'],['✨','خلّي المصمّمة تنسّق','اختار المناسبة وطقس بكرا، والمصمّمة بتركّبلك لبسة من قطعك. بتقدر تغيّرها لحد ما تعجبك.'],['🌙','جهّز لبسة بكرا','اعتمد اللبسة الليلة وعلّم كل قطعة "جاهزة" حتى تكويها. هيك الصبح ما بتضيع وقتك.']];
function showGuide(){const g=$('#guide');let i=0;const close=()=>{g.hidden=true;document.removeEventListener('keydown',esc);try{localStorage.setItem('grwm_seen','1')}catch(x){}};const esc=e=>{if(e.key=='Escape')close()};
const draw=()=>{const s=STEPS[i],last=i==STEPS.length-1;g.innerHTML=`<div class="gcard"><div class="gem" aria-hidden="true">${s[0]}</div><h2 id="gt">${s[1]}</h2><p>${s[2]}</p><div class="dots" aria-hidden="true">${STEPS.map((_,k)=>`<i class="${k==i?'on':''}"></i>`).join('')}</div><div class="gact">${last?'':'<button class="btn alt" data-g="skip">تخطّي</button>'}<button class="btn" data-g="next" id="gn">${last?'يلا نبدأ':'التالي'}</button></div></div>`;$('#gn').focus()};
g.hidden=false;draw();document.addEventListener('keydown',esc);g.onclick=e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.g=='next'&&i<STEPS.length-1){i++;return draw()}close()}}
$('#help').onclick=showGuide;
(function(){const sp=$('#splash');let seen=null,gone=false;try{seen=localStorage.getItem('grwm_seen')}catch(e){}
const done=()=>{if(gone)return;gone=true;sp.classList.add('out');setTimeout(()=>sp.remove(),600);if(!seen)showGuide()};
const t=setTimeout(done,1900);sp.onclick=()=>{clearTimeout(t);done()}})();