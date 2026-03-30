import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from 'firebase/firestore';

const C = { navy:'#0D1B2A', gold:'#C9A84C', amber:'#D97706', green:'#15803D', red:'#DC2626', gray:'#6B7280', lgray:'#F3F4F6', border:'#E5E7EB', white:'#fff', blue:'#1D4ED8', purple:'#7C3AED' };

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [tab, setTab] = useState('hoje');

  useEffect(()=>{
    const start = new Date(); start.setHours(0,0,0,0);
    const q = query(collection(db,'timeRecords'), orderBy('createdAt','desc'), limit(50));
    const unsub = onSnapshot(q, snap=>{
      setRecords(snap.docs.map(d=>({id:d.id,...d.data()})));
    });
    return ()=>unsub();
  },[]);

  const todayRecords = records.filter(r=>{
    if(!r.createdAt) return false;
    const d = r.createdAt.toDate ? r.createdAt.toDate() : new Date(r.createdAt);
    const today = new Date(); today.setHours(0,0,0,0);
    return d >= today;
  });

  const totalExtrasHours = records.reduce((s,r)=>{
    if(!r.extras) return s;
    return s + r.extras.reduce((ss,e)=>ss+(parseFloat(e.hours)||0),0);
  },0);

  const totalFuelCost = records.reduce((s,r)=>{
    if(!r.fuels) return s;
    return s + r.fuels.reduce((ss,f)=>ss+(parseFloat(f.gallons)||0)*(parseFloat(f.pricePerGal)||0),0);
  },0);

  const tabStyle = t => ({
    flex:1, border:'none', borderBottom: tab===t?`3px solid ${C.gold}`:`3px solid transparent`,
    background:'none', color: tab===t?C.gold:'#94A3B8', fontWeight: tab===t?'bold':'normal',
    fontSize:12, padding:'12px 4px', cursor:'pointer', fontFamily:'Georgia,serif', letterSpacing:0.5
  });

  return (
    <div style={{fontFamily:'Georgia,serif', background:C.lgray, minHeight:'100vh', paddingBottom:80}}>
      {/* HEADER */}
      <div style={{background:C.navy, padding:'16px 16px 0', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 12px rgba(0,0,0,0.3)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12}}>
          <div>
            <div style={{color:C.gold, fontSize:10, fontFamily:'monospace', letterSpacing:2}}>GC HOME IMPROVEMENT LLC</div>
            <div style={{color:C.white, fontSize:18, fontWeight:'bold'}}>⏱ GC Clock Pro Track</div>
            <div style={{color:'#94A3B8', fontSize:11}}>👔 {user?.name} — Admin</div>
          </div>
          <div style={{textAlign:'right'}}>
            <div style={{color:C.gold, fontSize:22, fontWeight:'bold'}}>{todayRecords.length}</div>
            <div style={{color:'#94A3B8', fontSize:10}}>registros hoje</div>
            <button onClick={()=>{logout();navigate('/login');}} style={{background:'none',border:'none',color:'#94A3B8',fontSize:11,cursor:'pointer',marginTop:2}}>Sair</button>
          </div>
        </div>
        <div style={{display:'flex', borderBottom:`1px solid rgba(255,255,255,0.1)`}}>
          {[['hoje','📅 Hoje'],['equipe','👷 Equipe'],['relatorios','📊 Relatórios'],['mapa','🗺️ Mapa']].map(([t,l])=>(
            <button key={t} style={tabStyle(t)} onClick={()=>{ if(t==='mapa'){navigate('/admin/map');}else{setTab(t);}}}>{l}</button>
          ))}
        </div>
      </div>

      <div style={{padding:'12px 12px 0'}}>

        {/* ── STATS CARDS ── */}
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:10}}>
          {[
            { icon:'👷', label:'Ativos hoje', val: todayRecords.length, color: C.green },
            { icon:'⏱', label:'Horas extras', val: `${totalExtrasHours}h`, color: C.amber },
            { icon:'⛽', label:'Combustível', val: `$${totalFuelCost.toFixed(0)}`, color: C.blue },
            { icon:'📋', label:'Total registros', val: records.length, color: C.purple },
          ].map((s,i)=>(
            <div key={i} style={{background:C.white, borderRadius:12, padding:16, border:`1px solid ${C.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
              <div style={{fontSize:22, marginBottom:6}}>{s.icon}</div>
              <div style={{fontSize:22, fontWeight:'bold', color:s.color}}>{s.val}</div>
              <div style={{fontSize:11, color:C.gray, marginTop:2}}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* ── TAB HOJE ── */}
        {tab==='hoje' && (
          <div>
            <div style={{fontSize:11, color:C.gray, fontWeight:'bold', letterSpacing:1, marginBottom:8}}>ATIVIDADE DE HOJE</div>
            {todayRecords.length===0 && <div style={{background:C.white, borderRadius:12, padding:24, textAlign:'center', color:C.gray, border:`1px solid ${C.border}`}}>Nenhum registro hoje ainda.</div>}
            {todayRecords.map(r=>(
              <div key={r.id} style={{background:C.white, borderRadius:12, padding:16, marginBottom:10, border:`1px solid ${C.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.06)'}}>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10}}>
                  <div>
                    <div style={{fontWeight:'bold', color:C.navy, fontSize:15}}>👷 {r.employeeName}</div>
                    <div style={{fontSize:11, color:C.gray, marginTop:2}}>{r.project}</div>
                  </div>
                  <div style={{background: r.checkout ? '#FEF2F2' : '#F0FDF4', borderRadius:8, padding:'4px 10px', fontSize:11, fontWeight:'bold', color: r.checkout ? C.red : C.green}}>
                    {r.checkout ? '🔴 Saiu' : '🟢 Ativo'}
                  </div>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10}}>
                  <div style={{background:C.lgray, borderRadius:8, padding:10}}>
                    <div style={{fontSize:10, color:C.gray, marginBottom:2}}>CHECK-IN</div>
                    <div style={{fontSize:13, fontWeight:'bold', color:C.green}}>{r.checkin?.time || '—'}</div>
                    {r.checkin?.coords && <div style={{fontSize:9, color:C.gray, marginTop:2}}>📍 {r.checkin.coords.lat}, {r.checkin.coords.lng}</div>}
                  </div>
                  <div style={{background:C.lgray, borderRadius:8, padding:10}}>
                    <div style={{fontSize:10, color:C.gray, marginBottom:2}}>CHECK-OUT</div>
                    <div style={{fontSize:13, fontWeight:'bold', color: r.checkout ? C.red : C.gray}}>{r.checkout?.time || 'Pendente'}</div>
                    {r.checkout?.coords && <div style={{fontSize:9, color:C.gray, marginTop:2}}>📍 {r.checkout.coords.lat}, {r.checkout.coords.lng}</div>}
                  </div>
                </div>
                {/* Checklist progress */}
                {r.checklist && <div style={{marginBottom:8}}>
                  <div style={{fontSize:10, color:C.gray, marginBottom:4}}>PROGRESSO CHECKLIST</div>
                  <div style={{background:C.lgray, borderRadius:4, height:8, overflow:'hidden'}}>
                    <div style={{height:'100%', background:C.gold, width:`${Math.round(Object.values(r.checklist).filter(Boolean).length/19*100)}%`}}/>
                  </div>
                  <div style={{fontSize:10, color:C.gray, marginTop:2}}>{Object.values(r.checklist).filter(Boolean).length}/19 itens</div>
                </div>}
                {/* Extras */}
                {r.extras?.filter(e=>e.desc.trim()).length>0 && <div style={{background:'#FFFBEB', borderRadius:8, padding:8, border:`1px solid #FDE68A`, marginBottom:6}}>
                  <div style={{fontSize:10, color:C.amber, fontWeight:'bold', marginBottom:4}}>⚠️ EXTRAS ({r.extras.filter(e=>e.desc.trim()).length})</div>
                  {r.extras.filter(e=>e.desc.trim()).map((e,i)=><div key={i} style={{fontSize:11, color:C.navy}}>• {e.desc} {e.hours?`(${e.hours}h)`:''}</div>)}
                </div>}
                {/* Fuel */}
                {r.fuels?.length>0 && <div style={{background:'#EFF6FF', borderRadius:8, padding:8, border:`1px solid #BFDBFE`}}>
                  <div style={{fontSize:10, color:C.blue, fontWeight:'bold', marginBottom:4}}>⛽ ABASTECIMENTO ({r.fuels.length})</div>
                  {r.fuels.map((f,i)=>{ const c=(parseFloat(f.gallons)||0)*(parseFloat(f.pricePerGal)||0); return <div key={i} style={{fontSize:11, color:C.navy}}>• {f.gallons} gal @ ${f.pricePerGal} = ${c.toFixed(2)}</div>; })}
                </div>}
              </div>
            ))}
          </div>
        )}

        {/* ── TAB EQUIPE ── */}
        {tab==='equipe' && (
          <div>
            <div style={{fontSize:11, color:C.gray, fontWeight:'bold', letterSpacing:1, marginBottom:8}}>EQUIPE DE CAMPO</div>
            {[{id:'moacir', name:'Moacir Santana', project:'PO-1466 — 1856 Thee Street', role:'Framing Sub'}].map(emp=>{
              const lastRecord = records.find(r=>r.employeeId===emp.id);
              return (
                <div key={emp.id} style={{background:C.white, borderRadius:12, padding:16, marginBottom:10, border:`1px solid ${C.border}`}}>
                  <div style={{display:'flex', alignItems:'center', gap:12}}>
                    <div style={{width:48, height:48, borderRadius:24, background:C.navy, display:'flex', alignItems:'center', justifyContent:'center', color:C.gold, fontSize:20, fontWeight:'bold'}}>M</div>
                    <div style={{flex:1}}>
                      <div style={{fontWeight:'bold', color:C.navy, fontSize:15}}>{emp.name}</div>
                      <div style={{fontSize:11, color:C.gray}}>{emp.project}</div>
                      <div style={{fontSize:11, color:C.gray}}>{emp.role}</div>
                    </div>
                    <div style={{background: lastRecord?.checkin && !lastRecord?.checkout ? '#F0FDF4' : C.lgray, borderRadius:8, padding:'6px 12px', fontSize:12, fontWeight:'bold', color: lastRecord?.checkin && !lastRecord?.checkout ? C.green : C.gray}}>
                      {lastRecord?.checkin && !lastRecord?.checkout ? '🟢 Ativo' : '⚪ Inativo'}
                    </div>
                  </div>
                  {lastRecord && <div style={{marginTop:12, background:C.lgray, borderRadius:8, padding:10, fontSize:12, color:C.gray}}>
                    Último registro: {lastRecord.checkin?.date} {lastRecord.checkin?.time}
                  </div>}
                </div>
              );
            })}
          </div>
        )}

        {/* ── TAB RELATÓRIOS ── */}
        {tab==='relatorios' && (
          <div>
            <div style={{fontSize:11, color:C.gray, fontWeight:'bold', letterSpacing:1, marginBottom:8}}>TODOS OS REGISTROS</div>
            {records.length===0 && <div style={{background:C.white, borderRadius:12, padding:24, textAlign:'center', color:C.gray, border:`1px solid ${C.border}`}}>Nenhum registro ainda.</div>}
            {records.map(r=>(
              <div key={r.id} style={{background:C.white, borderRadius:12, padding:14, marginBottom:8, border:`1px solid ${C.border}`}}>
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <div>
                    <div style={{fontWeight:'bold', color:C.navy, fontSize:13}}>{r.employeeName}</div>
                    <div style={{fontSize:11, color:C.gray}}>{r.checkin?.date} · {r.checkin?.time} → {r.checkout?.time || 'Em andamento'}</div>
                  </div>
                  <div style={{fontSize:12, color: r.checkout ? C.red : C.green, fontWeight:'bold'}}>{r.checkout ? '✓ Concluído' : '● Ativo'}</div>
                </div>
                {r.extras?.filter(e=>e.desc.trim()).length>0 && <div style={{marginTop:6, fontSize:11, color:C.amber}}>⚠️ {r.extras.filter(e=>e.desc.trim()).length} extra(s)</div>}
                {r.fuels?.length>0 && <div style={{fontSize:11, color:C.blue}}>⛽ {r.fuels.length} abastecimento(s)</div>}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
