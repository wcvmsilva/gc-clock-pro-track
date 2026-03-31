import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db, storage } from '../firebase';
import { collection, addDoc, updateDoc, setDoc, doc, getDoc, query, where, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import emailjs from '@emailjs/browser';

const PROJECTS = [
  { id:'PO-1466', label:'PO-1466 — Sea Island Builders', address:'1856 Thee Street, Sullivans Island' },
  { id:'PO-1467', label:'PO-1467 — Projeto Novo',        address:'A definir' },
];

emailjs.init("JjwWbxdfvurMmHj19");

const C = { navy:'#0D1B2A', gold:'#C9A84C', amber:'#D97706', green:'#15803D', red:'#DC2626', gray:'#6B7280', lgray:'#F3F4F6', border:'#E5E7EB', white:'#fff', purple:'#7C3AED', blue:'#1D4ED8' };

const SECTIONS = [
  { id:'demo',    title:'1. Demolição Restante',        icon:'🔨', items:[{id:'d1',text:'Demolição — lado oceânico'},{id:'d2',text:'Demolição breezeway / elevador (fase posterior)'}]},
  { id:'framing', title:'2. Estrutura / Framing',       icon:'🪵', items:[{id:'f1',text:'Framing completo — plantas Rev.1'},{id:'f2',text:'Subflooring 3/4" T&G — pregos anel + cola'},{id:'f3',text:'Sheathing paredes/telhado: CDX'},{id:'f4',text:'Sheathing porches/decks: PT'},{id:'f5',text:'Sheathing intersecções parede-telhado: PT'},{id:'f6',text:'Steel flitch plates (HVAC) — materiais Sea Island'},{id:'f7',text:'Blocking / nailer para dry wall'},{id:'f8',text:'Soffits e false ceiling vaults'},{id:'f9',text:'Walk-through blocking de hardware'},{id:'f10',text:'Instalação de crickets'}]},
  { id:'windows', title:'3. Janelas e Portas',          icon:'🪟', items:[{id:'w1',text:'Janelas — especificações fabricante + plantas'},{id:'w2',text:'Portas externas — especificações fabricante + plantas'}]},
  { id:'wrap',    title:'4. House Wrap / Impermeab.',   icon:'🛡️', items:[{id:'hw1',text:'House wrap — especificações fabricante'},{id:'hw2',text:'Impermeabilização aberturas (opening waterproofing)'}]},
  { id:'cleanup', title:'5. Limpeza de Obra',           icon:'🧹', items:[{id:'c1',text:'Limpeza diária do canteiro'},{id:'c2',text:'Limpeza semanal completa'},{id:'c3',text:'Cobrir materiais com lonas ao fim da semana'}]},
];
const ALL_IDS = SECTIONS.flatMap(s=>s.items.map(i=>i.id));

function getLocation(cb) {
  if (!navigator.geolocation) { cb(null); return; }
  navigator.geolocation.getCurrentPosition(
    p => cb({ lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6), acc: Math.round(p.coords.accuracy) }),
    () => cb(null),
    { enableHighAccuracy:true, timeout:8000 }
  );
}

export default function EmployeeDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab]           = useState('checklist');
  const [checked, setChecked]   = useState({});
  const [notes, setNotes]       = useState({});
  const [openSec, setOpenSec]   = useState(null);
  const [extras, setExtras]     = useState([{id:1,desc:'',hours:'',date:''}]);
  const [extCounter, setExtCounter] = useState(2);
  const [fuels, setFuels]       = useState([]);
  const [fuelCounter, setFuelCounter] = useState(1);
  const [checkinData, setCheckinData]   = useState(null);
  const [checkoutData, setCheckoutData] = useState(null);
  const [sending, setSending]   = useState(false);
  const [toast, setToast]       = useState(null);
  const [selectedProject, setSelectedProject] = useState(PROJECTS[0]);
  const [showProjectPicker, setShowProjectPicker] = useState(false);
  const [firestoreDocId, setFirestoreDocId] = useState(null);

  const totalDone = ALL_IDS.filter(id=>checked[id]).length;
  const pct = Math.round(totalDone/ALL_IDS.length*100);

  // Alerts 4:45 + 5:00
  useEffect(()=>{
    const now = new Date();
    const a1 = new Date(); a1.setHours(16,45,0,0);
    const a2 = new Date(); a2.setHours(17,0,0,0);
    if(a1>now) setTimeout(()=>showToast('⏰ Faltam 15 min para encerrar o expediente!','purple'),a1-now);
    if(a2>now) setTimeout(()=>showToast('🔴 São 5:00pm — Hora do check-out!','red'),a2-now);
  },[]);

  const showToast = (msg,type='success') => {
    setToast({msg,type});
    setTimeout(()=>setToast(null),4000);
  };

  // Load saved progress from Firestore on login
  useEffect(()=>{
    if (!user?.id) return;
    const obraKey = user.id + '_' + new Date().toISOString().split('T')[0];
    getDoc(doc(db, 'obraProgress', obraKey)).then(snap => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.checklist && Object.keys(data.checklist).length > 0) {
          setChecked(data.checklist);
          showToast('📋 Progresso carregado!', 'success');
        }
        if (data.notes) setNotes(data.notes);
        if (data.extras && data.extras.length > 0) setExtras(data.extras);
        if (data.fuels && data.fuels.length > 0) setFuels(data.fuels);
      }
    }).catch(e => console.error('Load progress error:', e));
  }, [user?.id]);


  // CHECK-IN
  const doCheckin = () => {
    const now = new Date();
    getLocation(async coords=>{
      const data = { time: now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}), date: now.toLocaleDateString('pt-BR'), coords };
      setCheckinData(data);
      // Write checkin event to Firestore — triggers push to admin
      try {
        // Create Firestore record on check-in so dashboard sees it immediately
        const docRef = await addDoc(collection(db,'timeRecords'),{
          employeeId: user.id, employeeName: user.name,
          checkin: data, checkout: null,
          checklist: {}, notes: {}, extras: [], fuels: [],
          project: selectedProject.label,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        setFirestoreDocId(docRef.id);
        // Notification event
        await addDoc(collection(db,'notifications'),{
          type: 'checkin',
          employeeId: user.id, employeeName: user.name,
          project: selectedProject.label,
          time: data.time, date: data.date,
          coords: coords || null,
          read: false, createdAt: serverTimestamp(),
        });
      } catch(e){ console.error('Check-in Firestore error:', e); }
      showToast('✅ Check-in registrado!','success');
    });
  };

  // CHECK-OUT
  const doCheckout = async () => {
    const now = new Date();
    getLocation(async coords=>{
      const data = { time: now.toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit',second:'2-digit'}), date: now.toLocaleDateString('pt-BR'), coords };
      setCheckoutData(data);
      // Update Firestore record on checkout
      try {
        if (firestoreDocId) {
          await updateDoc(doc(db,'timeRecords', firestoreDocId),{
            checkout: data, checklist: checked, notes, extras, fuels,
            status: 'completed', updatedAt: serverTimestamp(),
          });
        } else {
          // Fallback if no checkin doc (e.g. page was refreshed)
          await addDoc(collection(db,'timeRecords'),{
            employeeId: user.id, employeeName: user.name,
            checkin: checkinData, checkout: data,
            checklist: checked, notes, extras, fuels,
            project: selectedProject.label, status: 'completed',
            createdAt: serverTimestamp(), updatedAt: serverTimestamp(),
          });
        }
      } catch(e){ console.error('Checkout Firestore error:', e); }
      // Send email
      await sendReport('eod', data);
      showToast('✅ Check-out registrado! Bom descanso!','success');
    });
  };

  // SEND REPORT — syncs obra data to Firestore independently of check-in/out
  const sendReport = async (type, coData=null) => {
    setSending(true);
    // Sync obra data — works with or without check-in
    try {
      const { enableNetwork } = await import('firebase/firestore');
      await enableNetwork(db);
      const obraKey = user.id + '_' + new Date().toISOString().split('T')[0];
      const obraRef = doc(db, 'obraProgress', obraKey);
      const payload = {
        employeeId: user.id,
        employeeName: user.name,
        project: selectedProject.label,
        checklist: checked,
        notes: notes,
        extras: extras,
        fuels: fuels,
        pct: pct,
        totalDone: totalDone,
        lastProgressAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };
      await setDoc(obraRef, payload, { merge: true });
      showToast('✅ Sincronizado com dashboard!', 'success');
      if (firestoreDocId) {
        await updateDoc(doc(db,'timeRecords', firestoreDocId),{
          checklist: checked, notes, extras, fuels,
          updatedAt: serverTimestamp(),
        });
      }
    } catch(e){
      console.error('Progress sync error:', e);
      showToast('ERRO Firestore: ' + e.message, 'red');
    }
    const now = new Date().toLocaleString('pt-BR',{timeZone:'America/New_York'});
    const label = type==='progress' ? 'PROGRESSO' : 'FIM DE DIA';
    let lines = [`📋 RELATÓRIO ${label} — PO-1466`,`🏠 1856 Thee Street, Sullivans Island`,`⏰ ${now}`,`📊 Progresso: ${pct}% (${totalDone}/${ALL_IDS.length} itens)`,``];
    SECTIONS.forEach(sec=>{
      lines.push(`${sec.icon} ${sec.title}`);
      sec.items.forEach(item=>{
        const n = notes[item.id] ? ` — Obs: ${notes[item.id]}` : '';
        lines.push(`  ${checked[item.id]?'✅':'⬜'} ${item.text}${n}`);
      });
      lines.push('');
    });
    const fe = extras.filter(e=>e.desc.trim());
    if(fe.length){ lines.push('⚠️ EXTRAS:'); fe.forEach((e,i)=>{ lines.push(`  #${i+1}: ${e.desc}`); if(e.hours) lines.push(`    ⏱ ${e.hours}h`); if(e.date) lines.push(`    📅 ${e.date}`); }); }
    if(fuels.length){ lines.push('','⛽ ABASTECIMENTOS:'); fuels.forEach((f,i)=>{ const miles=(parseFloat(f.odoAfter)||0)-(parseFloat(f.odoBefore)||0); const cost=(parseFloat(f.gallons)||0)*(parseFloat(f.pricePerGal)||0); lines.push(`  #${i+1}: ${f.gallons}gal @ $${f.pricePerGal} = $${cost.toFixed(2)} | ${miles}mi`); }); }
    if(checkinData){ lines.push('','📍 PONTO:',`  Check-in: ${checkinData.date} ${checkinData.time}${checkinData.coords?` GPS:${checkinData.coords.lat},${checkinData.coords.lng}`:''}`); }
    const co = coData || checkoutData;
    if(co){ lines.push(`  Check-out: ${co.date} ${co.time}${co.coords?` GPS:${co.coords.lat},${co.coords.lng}`:''}`); }
    lines.push('','— '+user.name+' / GC Home Improvement LLC');
    try {
      await emailjs.send('service_ya0s8v9','template_i7anu9n',{ to_email:'wscolumbia25@gmail.com', subject:`${type==='progress'?'📊 Progresso':'🏁 Fim de Dia'} — PO-1466 — ${pct}% — ${new Date().toLocaleDateString('pt-BR')}`, message: lines.join('\n') });
      showToast(`✅ Relatório enviado para Wellington!`,'success');
    } catch(e){ showToast('❌ Erro ao enviar email','red'); }
    setSending(false);
  };

  // FUEL
  const addFuel = () => { setFuels(p=>[...p,{id:fuelCounter,odoBefore:'',odoAfter:'',gallons:'',pricePerGal:'',project:selectedProject.id,date:new Date().toISOString().split('T')[0],photo:null}]); setFuelCounter(c=>c+1); };
  const removeFuel = id => setFuels(p=>p.filter(f=>f.id!==id));
  const updateFuel = (id,field,val) => setFuels(p=>p.map(f=>f.id===id?{...f,[field]:val}:f));
  const handleFuelPhoto = async (id, file) => {
    if (!file) return;
    // Show preview immediately
    const reader = new FileReader();
    reader.onload = e => updateFuel(id, 'photoPreview', e.target.result);
    reader.readAsDataURL(file);
    // Upload to Firebase Storage
    try {
      const ts = Date.now();
      const path = `fuel-photos/${user.id}/${ts}_${file.name}`;
      const snap = await uploadBytes(storageRef(storage, path), file);
      const url  = await getDownloadURL(snap.ref);
      updateFuel(id, 'photo', url);
      updateFuel(id, 'photoTimestamp', new Date().toISOString());
      showToast('📸 Foto salva!', 'success');
    } catch(e) {
      showToast('Foto salva localmente', 'amber');
    }
  };

  const totalFuelCost = fuels.reduce((s,f)=>s+(parseFloat(f.gallons)||0)*(parseFloat(f.pricePerGal)||0),0);
  const totalFuelMiles= fuels.reduce((s,f)=>s+Math.max(0,(parseFloat(f.odoAfter)||0)-(parseFloat(f.odoBefore)||0)),0);

  const tabStyle = (t) => ({ flex:1, border:'none', borderBottom: tab===t ? `3px solid ${C.gold}` : `3px solid transparent`, background:'none', color: tab===t ? C.navy : C.gray, fontWeight: tab===t ? 'bold':'normal', fontSize:12, padding:'12px 4px', cursor:'pointer', fontFamily:'Georgia,serif', letterSpacing:0.5 });

  return (
    <div style={{fontFamily:'Georgia,serif', background:C.lgray, minHeight:'100vh', paddingBottom:80}}>
      {/* HEADER */}
      <div style={{background:C.navy, padding:'16px 16px 12px', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 12px rgba(0,0,0,0.3)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start'}}>
          <div>
            <div style={{color:C.gold, fontSize:10, fontFamily:'monospace', letterSpacing:2}}>PO-1466 · SEA ISLAND BUILDERS</div>
            <div style={{color:C.white, fontSize:17, fontWeight:'bold'}}>1856 Thee Street</div>
            <div style={{color:'#94A3B8', fontSize:11}}>👷 {user?.name}</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{color:C.gold, fontSize:26, fontWeight:'bold'}}>{pct}%</div>
            <div style={{color:'#94A3B8', fontSize:10}}>{totalDone}/{ALL_IDS.length} itens</div>
            <button onClick={()=>{logout();navigate('/login');}} style={{background:'none',border:'none',color:'#94A3B8',fontSize:11,cursor:'pointer',marginTop:2}}>Sair</button>
          </div>
        </div>
        <div style={{marginTop:8, background:'rgba(255,255,255,0.1)', borderRadius:4, height:5, overflow:'hidden'}}>
          <div style={{height:'100%', width:`${pct}%`, background:C.gold, transition:'width 0.4s'}}/>
        </div>
        {/* TABS */}
        <div style={{display:'flex', marginTop:10, borderBottom:`1px solid rgba(255,255,255,0.1)`}}>
          {[['checklist','✅ Checklist'],['ponto','📍 Ponto'],['extras','⚠️ Extras'],['fuel','⛽ Van']].map(([t,l])=>(
            <button key={t} style={{...tabStyle(t), color: tab===t?C.gold:'#94A3B8'}} onClick={()=>setTab(t)}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{padding:'12px 12px 0'}}>

        {/* ── NOTIFY ── */}
        <div style={{background:C.white, borderRadius:12, padding:14, marginBottom:10, border:`1px solid ${C.border}`}}>
          <div style={{fontSize:11, color:C.gray, fontWeight:'bold', letterSpacing:1, marginBottom:10}}>NOTIFICAR WELLINGTON</div>
          <div style={{display:'flex', gap:8}}>
            <button disabled={sending} onClick={()=>sendReport('progress')}
              style={{flex:1, border:'none', borderRadius:10, padding:'13px 8px', background: sending?C.lgray:C.navy, color: sending?C.gray:C.white, fontWeight:'bold', fontSize:13, cursor: sending?'not-allowed':'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
              📊 Enviar Progresso
            </button>
            <button disabled={sending} onClick={()=>sendReport('eod')}
              style={{flex:1, border:'none', borderRadius:10, padding:'13px 8px', background: sending?C.lgray:C.amber, color: sending?C.gray:C.white, fontWeight:'bold', fontSize:13, cursor: sending?'not-allowed':'pointer', fontFamily:'inherit', display:'flex', alignItems:'center', justifyContent:'center', gap:6}}>
              🏁 Fim de Dia
            </button>
          </div>
        </div>

        {/* ── TAB: CHECKLIST ── */}
        {tab==='checklist' && SECTIONS.map(sec=>{
          const done=sec.items.filter(i=>checked[i.id]).length;
          const allDone=done===sec.items.length;
          const isOpen=openSec===sec.id;
          return (
            <div key={sec.id} style={{background:C.white, borderRadius:12, overflow:'hidden', marginBottom:10, border:`1px solid ${allDone?C.green:C.border}`}}>
              <button onClick={()=>setOpenSec(isOpen?null:sec.id)} style={{width:'100%', background:'none', border:'none', padding:'14px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', cursor:'pointer', textAlign:'left'}}>
                <div style={{display:'flex', alignItems:'center', gap:10}}>
                  <span style={{fontSize:20}}>{sec.icon}</span>
                  <div>
                    <div style={{fontWeight:'bold', color:C.navy, fontSize:14}}>{sec.title}</div>
                    <div style={{fontSize:11, color:allDone?C.green:C.gray, marginTop:2}}>{allDone?'✓ Concluído':`${done} de ${sec.items.length} feitos`}</div>
                  </div>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:8}}>
                  <div style={{background:allDone?C.green:C.navy, color:C.white, borderRadius:20, padding:'2px 10px', fontSize:12, fontWeight:'bold'}}>{done}/{sec.items.length}</div>
                  <span style={{color:C.gold, fontSize:18, display:'inline-block', transform:isOpen?'rotate(180deg)':'rotate(0)', transition:'transform 0.2s'}}>▾</span>
                </div>
              </button>
              {isOpen && <div style={{borderTop:`1px solid ${C.border}`}}>
                {sec.items.map((item,idx)=>(
                  <div key={item.id}>
                    <div onClick={()=>setChecked(p=>({...p,[item.id]:!p[item.id]}))} style={{display:'flex', alignItems:'flex-start', gap:12, padding:'12px 16px', background:checked[item.id]?'#F0FDF4':C.white, cursor:'pointer', borderBottom: idx<sec.items.length-1?`1px solid ${C.border}`:'none'}}>
                      <div style={{width:24, height:24, borderRadius:6, border:`2px solid ${checked[item.id]?C.green:C.border}`, background:checked[item.id]?C.green:C.white, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1, fontSize:13, color:C.white, fontWeight:'bold'}}>{checked[item.id]?'✓':''}</div>
                      <span style={{fontSize:13, color:checked[item.id]?C.gray:C.navy, lineHeight:1.5, textDecoration:checked[item.id]?'line-through':'none'}}>{item.text}</span>
                    </div>
                    {checked[item.id] && <div style={{padding:'0 16px 10px 52px'}} onClick={e=>e.stopPropagation()}>
                      <input placeholder="Observação..." value={notes[item.id]||''} onChange={e=>setNotes(p=>({...p,[item.id]:e.target.value}))} style={{width:'100%', border:`1px solid ${C.border}`, borderRadius:6, padding:'6px 10px', fontSize:12, color:C.navy, fontFamily:'inherit', boxSizing:'border-box'}}/>
                    </div>}
                  </div>
                ))}
              </div>}
            </div>
          );
        })}

        {/* ── TAB: PONTO ── */}
        {tab==='ponto' && (
          <div style={{background:C.white, borderRadius:12, overflow:'hidden', marginBottom:10, border:`2px solid ${C.purple}`}}>
            <div style={{padding:'14px 16px', background:'#F5F3FF', borderBottom:`1px solid #DDD6FE`, display:'flex', alignItems:'center', gap:8}}>
              <span style={{fontSize:20}}>📍</span>
              <div>
                <div style={{fontWeight:'bold', color:C.purple, fontSize:14}}>Ponto — Check-in / Check-out</div>
                <div style={{fontSize:11, color:C.gray, marginTop:2}}>Alerta automático às 4:45pm e 5:00pm</div>
              </div>
            </div>
            <div style={{padding:'16px'}}>

              {/* PROJECT SELECTOR */}
              {!checkinData && (
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11, color:C.gray, fontWeight:'bold', marginBottom:6}}>PROJETO / JOB</div>
                  <div style={{position:'relative'}}>
                    <button onClick={()=>setShowProjectPicker(p=>!p)} style={{
                      width:'100%', border:`2px solid ${C.purple}`, borderRadius:10, padding:'12px 14px',
                      background:'#F5F3FF', color:C.purple, fontWeight:'bold', fontSize:13,
                      cursor:'pointer', fontFamily:'inherit', textAlign:'left', display:'flex',
                      justifyContent:'space-between', alignItems:'center'
                    }}>
                      <span>📌 {selectedProject.label}</span>
                      <span style={{fontSize:10}}>{showProjectPicker?'▲':'▼'}</span>
                    </button>
                    {showProjectPicker && (
                      <div style={{
                        position:'absolute', top:'calc(100% + 4px)', left:0, right:0,
                        background:C.white, border:`1px solid ${C.border}`, borderRadius:10,
                        boxShadow:'0 4px 16px rgba(0,0,0,0.12)', zIndex:50, overflow:'hidden'
                      }}>
                        {PROJECTS.map(p=>(
                          <div key={p.id} onClick={()=>{setSelectedProject(p);setShowProjectPicker(false);}} style={{
                            padding:'12px 14px', cursor:'pointer',
                            background:selectedProject.id===p.id?'#F5F3FF':C.white,
                            borderBottom:`1px solid ${C.border}`
                          }}>
                            <div style={{fontWeight:'bold', color:C.navy, fontSize:13}}>📌 {p.id}</div>
                            <div style={{fontSize:11, color:C.gray, marginTop:2}}>{p.address}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{fontSize:10, color:C.gray, marginTop:5}}>📍 {selectedProject.address}</div>
                </div>
              )}

              {checkinData && (
                <div style={{background:'#EDE9FE', borderRadius:8, padding:'8px 12px', marginBottom:12, display:'flex', alignItems:'center', gap:8}}>
                  <span style={{fontSize:14}}>📌</span>
                  <div>
                    <div style={{fontSize:11, color:C.purple, fontWeight:'bold'}}>{selectedProject.label}</div>
                    <div style={{fontSize:10, color:'#7C3AED'}}>{selectedProject.address}</div>
                  </div>
                </div>
              )}

              {/* Check-in status */}
              <div style={{background:'#F0FDF4', borderRadius:10, padding:12, marginBottom:12, border:`1px solid #BBF7D0`, textAlign:'center'}}>
                <div style={{fontSize:11, color:C.gray, marginBottom:4}}>CHECK-IN</div>
                <div style={{color:C.green, fontSize:16, fontWeight:'bold'}}>{checkinData ? `${checkinData.date} — ${checkinData.time}` : 'Não registrado'}</div>
                {checkinData?.coords && <div style={{fontSize:10, color:C.gray, marginTop:3}}>📍 {checkinData.coords.lat}, {checkinData.coords.lng}</div>}
              </div>
              {/* Check-out status */}
              {checkoutData && <div style={{background:'#FEF2F2', borderRadius:10, padding:12, marginBottom:12, border:`1px solid #FECACA`, textAlign:'center'}}>
                <div style={{fontSize:11, color:C.gray, marginBottom:4}}>CHECK-OUT ✓</div>
                <div style={{color:C.red, fontSize:16, fontWeight:'bold'}}>{checkoutData.date} — {checkoutData.time}</div>
                {checkoutData?.coords && <div style={{fontSize:10, color:C.gray, marginTop:3}}>📍 {checkoutData.coords.lat}, {checkoutData.coords.lng}</div>}
              </div>}
              {/* Buttons */}
              {!checkinData && <button onClick={doCheckin} style={{width:'100%', border:'none', borderRadius:12, padding:16, background:C.green, color:C.white, fontWeight:'bold', fontSize:15, cursor:'pointer', fontFamily:'inherit', marginBottom:8}}>🟢 Registrar Check-in</button>}
              {checkinData && !checkoutData && <button onClick={doCheckout} style={{width:'100%', border:'none', borderRadius:12, padding:16, background:C.red, color:C.white, fontWeight:'bold', fontSize:15, cursor:'pointer', fontFamily:'inherit'}}>🔴 Encerrar Expediente — Check-out</button>}
              {checkoutData && <div style={{background:C.lgray, borderRadius:10, padding:12, textAlign:'center', color:C.gray, fontSize:13}}>✅ Expediente encerrado. Bom descanso!</div>}
            </div>
          </div>
        )}

        {/* ── TAB: EXTRAS ── */}
        {tab==='extras' && (
          <div style={{background:C.white, borderRadius:12, overflow:'hidden', marginBottom:10, border:`1px solid ${C.amber}`}}>
            <div style={{padding:'14px 16px', background:'#FFFBEB', borderBottom:`1px solid #FDE68A`, display:'flex', alignItems:'center', gap:8}}>
              <span style={{fontSize:20}}>⚠️</span>
              <div>
                <div style={{fontWeight:'bold', color:C.amber, fontSize:14}}>Extras / Serviços Adicionais</div>
                <div style={{fontSize:11, color:C.gray, marginTop:2}}>Requer autorização escrita prévia do GC</div>
              </div>
            </div>
            <div style={{padding:'12px 16px'}}>
              {extras.map((e,idx)=>(
                <div key={e.id} style={{marginBottom:14, padding:12, background:'#FFFBEB', borderRadius:10, border:`1px dashed ${C.amber}`}}>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:8}}>
                    <span style={{fontWeight:'bold', color:C.amber, fontSize:13}}>Extra #{idx+1}</span>
                    {extras.length>1 && <button onClick={()=>setExtras(p=>p.filter(x=>x.id!==e.id))} style={{background:'none', border:'none', color:C.red, fontSize:22, cursor:'pointer', padding:0}}>×</button>}
                  </div>
                  <label style={{fontSize:11, color:C.gray, display:'block', marginBottom:4, fontWeight:'bold'}}>DESCRIÇÃO</label>
                  <textarea rows={2} placeholder="Descreva o serviço extra..." value={e.desc} onChange={ev=>setExtras(p=>p.map(x=>x.id===e.id?{...x,desc:ev.target.value}:x))} style={{width:'100%', border:`1px solid #FDE68A`, borderRadius:6, padding:'8px 10px', fontSize:13, color:C.navy, fontFamily:'inherit', resize:'vertical', background:C.white, boxSizing:'border-box'}}/>
                  <div style={{display:'flex', gap:8, marginTop:8}}>
                    <div style={{flex:1}}>
                      <label style={{fontSize:11, color:C.gray, display:'block', marginBottom:4, fontWeight:'bold'}}>HORAS</label>
                      <input type="number" placeholder="0" value={e.hours} onChange={ev=>setExtras(p=>p.map(x=>x.id===e.id?{...x,hours:ev.target.value}:x))} style={{width:'100%', border:`1px solid #FDE68A`, borderRadius:6, padding:'8px 10px', fontSize:13, color:C.navy, fontFamily:'inherit', background:C.white, boxSizing:'border-box'}}/>
                    </div>
                    <div style={{flex:1}}>
                      <label style={{fontSize:11, color:C.gray, display:'block', marginBottom:4, fontWeight:'bold'}}>DATA</label>
                      <input type="date" value={e.date} onChange={ev=>setExtras(p=>p.map(x=>x.id===e.id?{...x,date:ev.target.value}:x))} style={{width:'100%', border:`1px solid #FDE68A`, borderRadius:6, padding:'8px 10px', fontSize:13, color:C.navy, fontFamily:'inherit', background:C.white, boxSizing:'border-box'}}/>
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={()=>{setExtras(p=>[...p,{id:extCounter,desc:'',hours:'',date:''}]); setExtCounter(c=>c+1);}} style={{width:'100%', border:`2px dashed ${C.amber}`, background:'none', borderRadius:8, padding:10, color:C.amber, fontWeight:'bold', fontSize:13, cursor:'pointer', fontFamily:'inherit'}}>+ Adicionar Extra</button>
            </div>
          </div>
        )}

        {/* ── TAB: VAN / FUEL ── */}
        {tab==='fuel' && (
          <div style={{background:C.white, borderRadius:12, overflow:'hidden', marginBottom:10, border:`1px solid ${C.blue}`}}>
            <div style={{padding:'14px 16px', background:'#EFF6FF', borderBottom:`1px solid #BFDBFE`, display:'flex', alignItems:'center', gap:8}}>
              <span style={{fontSize:20}}>⛽</span>
              <div>
                <div style={{fontWeight:'bold', color:C.blue, fontSize:14}}>Controle de Abastecimento — Van</div>
                <div style={{fontSize:11, color:C.gray, marginTop:2}}>Registre cada abastecimento com foto</div>
              </div>
            </div>
            <div style={{padding:'12px 16px'}}>
              {/* Stats */}
              {fuels.length>0 && <div style={{background:'#1E3A5F', borderRadius:10, padding:12, marginBottom:12}}>
                <div style={{color:C.gold, fontSize:11, fontWeight:'bold', letterSpacing:1, marginBottom:8}}>RESUMO</div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}><span style={{color:'#94A3B8',fontSize:12}}>Abastecimentos</span><span style={{color:C.gold,fontWeight:'bold',fontSize:12}}>{fuels.length}</span></div>
                <div style={{display:'flex', justifyContent:'space-between', marginBottom:4}}><span style={{color:'#94A3B8',fontSize:12}}>Total milhas</span><span style={{color:C.gold,fontWeight:'bold',fontSize:12}}>{totalFuelMiles} mi</span></div>
                <div style={{display:'flex', justifyContent:'space-between', borderTop:'1px solid rgba(255,255,255,0.1)', paddingTop:6, marginTop:4}}><span style={{color:C.white,fontWeight:'bold',fontSize:13}}>💰 Total combustível</span><span style={{color:C.gold,fontWeight:'bold',fontSize:15}}>${totalFuelCost.toFixed(2)}</span></div>
              </div>}
              {fuels.map((f,idx)=>{
                const miles=(parseFloat(f.odoAfter)||0)-(parseFloat(f.odoBefore)||0);
                const cost=(parseFloat(f.gallons)||0)*(parseFloat(f.pricePerGal)||0);
                const mpg=miles>0&&parseFloat(f.gallons)>0?(miles/parseFloat(f.gallons)).toFixed(1):null;
                return (
                  <div key={f.id} style={{marginBottom:14, padding:12, background:'#EFF6FF', borderRadius:10, border:`1px solid #BFDBFE`}}>
                    <div style={{display:'flex', justifyContent:'space-between', marginBottom:10}}>
                      <span style={{fontWeight:'bold', color:C.blue, fontSize:13}}>⛽ Abastecimento #{idx+1} · <span style={{color:C.gray,fontSize:11}}>{f.date}</span></span>
                      <button onClick={()=>removeFuel(f.id)} style={{background:'none',border:'none',color:C.red,fontSize:20,cursor:'pointer',padding:0}}>×</button>
                    </div>
                    <div style={{display:'flex', gap:8, marginBottom:8}}>
                      <div style={{flex:1}}><label style={{fontSize:11,color:C.gray,display:'block',marginBottom:4,fontWeight:'bold'}}>ODO ANTES (mi)</label><input type="number" placeholder="45230" value={f.odoBefore} onChange={e=>updateFuel(f.id,'odoBefore',e.target.value)} style={{width:'100%',border:`1px solid #BFDBFE`,borderRadius:6,padding:'8px 10px',fontSize:13,fontFamily:'inherit',background:C.white,boxSizing:'border-box'}}/></div>
                      <div style={{flex:1}}><label style={{fontSize:11,color:C.gray,display:'block',marginBottom:4,fontWeight:'bold'}}>ODO DEPOIS (mi)</label><input type="number" placeholder="45480" value={f.odoAfter} onChange={e=>updateFuel(f.id,'odoAfter',e.target.value)} style={{width:'100%',border:`1px solid #BFDBFE`,borderRadius:6,padding:'8px 10px',fontSize:13,fontFamily:'inherit',background:C.white,boxSizing:'border-box'}}/></div>
                    </div>
                    <div style={{display:'flex', gap:8, marginBottom:8}}>
                      <div style={{flex:1}}><label style={{fontSize:11,color:C.gray,display:'block',marginBottom:4,fontWeight:'bold'}}>GALÕES</label><input type="number" step="0.01" placeholder="12.5" value={f.gallons} onChange={e=>updateFuel(f.id,'gallons',e.target.value)} style={{width:'100%',border:`1px solid #BFDBFE`,borderRadius:6,padding:'8px 10px',fontSize:13,fontFamily:'inherit',background:C.white,boxSizing:'border-box'}}/></div>
                      <div style={{flex:1}}><label style={{fontSize:11,color:C.gray,display:'block',marginBottom:4,fontWeight:'bold'}}>$ / GALÃO</label><input type="number" step="0.01" placeholder="3.49" value={f.pricePerGal} onChange={e=>updateFuel(f.id,'pricePerGal',e.target.value)} style={{width:'100%',border:`1px solid #BFDBFE`,borderRadius:6,padding:'8px 10px',fontSize:13,fontFamily:'inherit',background:C.white,boxSizing:'border-box'}}/></div>
                    </div>
                    {(miles>0||cost>0) && <div style={{background:C.blue,color:C.white,borderRadius:8,padding:'8px 12px',marginBottom:8,fontSize:12,fontFamily:'inherit'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}><span>Milhas rodadas</span><span>{miles} mi</span></div>
                      {mpg && <div style={{display:'flex',justifyContent:'space-between',marginBottom:2}}><span>Rendimento</span><span>{mpg} mpg</span></div>}
                      <div style={{display:'flex',justifyContent:'space-between',borderTop:'1px solid rgba(255,255,255,0.2)',paddingTop:4,marginTop:2,fontWeight:'bold'}}><span>💰 Custo total</span><span>${cost.toFixed(2)}</span></div>
                    </div>}
                    <input type="file" accept="image/*" capture="environment" id={`photo-${f.id}`} style={{display:'none'}} onChange={e=>handleFuelPhoto(f.id,e.target.files[0])}/>
                    {(f.photoPreview||f.photo) && (
                      <div style={{marginBottom:8,borderRadius:8,overflow:'hidden',border:`2px solid ${C.green}`}}>
                        <img src={f.photoPreview||f.photo} alt="bomba" style={{width:'100%',maxHeight:160,objectFit:'cover',display:'block'}}/>
                        <div style={{padding:'4px 8px',background:f.photo?'#DCFCE7':'#FFF7ED',fontSize:10,color:f.photo?C.green:C.amber,fontWeight:'bold'}}>
                          {f.photo ? `✓ Salvo — ${f.photoTimestamp ? new Date(f.photoTimestamp).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'}) : ''}` : '⏳ Fazendo upload...'}
                        </div>
                      </div>
                    )}
                    <button onClick={()=>document.getElementById(`photo-${f.id}`).click()} style={{width:'100%',border:`2px dashed ${f.photo?C.green:C.blue}`,background:'none',borderRadius:8,padding:10,color:f.photo?C.green:C.blue,fontWeight:'bold',fontSize:13,cursor:'pointer',fontFamily:'inherit',display:'flex',alignItems:'center',justifyContent:'center',gap:6}}>
                      {f.photo ? '📸 Foto salva no Firebase ✓' : f.photoPreview ? '⏳ Salvando...' : '📸 Tirar Foto da Bomba'}
                    </button>
                    {f.photo && <img src={f.photo} alt="bomba" style={{width:'100%',borderRadius:8,marginTop:8,maxHeight:160,objectFit:'cover'}}/>}
                  </div>
                );
              })}
              <button onClick={addFuel} style={{width:'100%',border:`2px dashed ${C.blue}`,background:'none',borderRadius:8,padding:10,color:C.blue,fontWeight:'bold',fontSize:13,cursor:'pointer',fontFamily:'inherit'}}>+ Registrar Abastecimento</button>
            </div>
          </div>
        )}

        <div style={{textAlign:'center',color:C.gray,fontSize:11,padding:'8px 0 0'}}>
          GC Home Improvement LLC · PO-1466<br/>PM Sea Island: Jason Fowler (843) 200-6157
        </div>
      </div>

      {/* TOAST */}
      {toast && <div style={{position:'fixed',bottom:24,left:12,right:12,zIndex:999,background: toast.type==='success'?C.green: toast.type==='red'?C.red: toast.type==='purple'?'#7C3AED':C.amber,color:C.white,borderRadius:12,padding:'14px 16px',fontWeight:'bold',fontSize:14,textAlign:'center',boxShadow:'0 4px 20px rgba(0,0,0,0.3)',fontFamily:'inherit'}}>
        {toast.msg}
      </div>}
    </div>
  );
}
