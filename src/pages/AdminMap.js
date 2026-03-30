import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

const C = { navy:'#0D1B2A', gold:'#C9A84C', green:'#15803D', red:'#DC2626', gray:'#6B7280', lgray:'#F3F4F6', border:'#E5E7EB', white:'#fff' };

export default function AdminMap() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [records, setRecords] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(()=>{
    const q = query(collection(db,'timeRecords'), orderBy('createdAt','desc'), limit(20));
    const unsub = onSnapshot(q, snap=>{ setRecords(snap.docs.map(d=>({id:d.id,...d.data()}))); });
    return ()=>unsub();
  },[]);

  // Build map URL with pins
  const buildMapUrl = () => {
    const pins = [];
    records.forEach(r=>{
      if(r.checkin?.coords) pins.push(`color:green|label:I|${r.checkin.coords.lat},${r.checkin.coords.lng}`);
      if(r.checkout?.coords) pins.push(`color:red|label:O|${r.checkout.coords.lat},${r.checkout.coords.lng}`);
    });
    if(pins.length===0) return null;
    const markers = pins.map(p=>`markers=${encodeURIComponent(p)}`).join('&');
    return `https://maps.googleapis.com/maps/api/staticmap?size=600x400&${markers}&key=YOUR_KEY`;
  };

  // Fallback: OpenStreetMap iframe
  const defaultLat = 32.7631;
  const defaultLng = -79.8375;
  const mapLat = records[0]?.checkin?.coords?.lat || defaultLat;
  const mapLng = records[0]?.checkin?.coords?.lng || defaultLng;

  return (
    <div style={{fontFamily:'Georgia,serif', background:C.lgray, minHeight:'100vh', paddingBottom:80}}>
      <div style={{background:C.navy, padding:'16px 16px 14px', position:'sticky', top:0, zIndex:100, boxShadow:'0 2px 12px rgba(0,0,0,0.3)'}}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div>
            <div style={{color:C.gold, fontSize:10, fontFamily:'monospace', letterSpacing:2}}>GC CLOCK PRO TRACK</div>
            <div style={{color:C.white, fontSize:17, fontWeight:'bold'}}>🗺️ Mapa de Equipe</div>
          </div>
          <button onClick={()=>navigate('/admin')} style={{background:'none', border:`1px solid rgba(255,255,255,0.2)`, color:C.white, borderRadius:8, padding:'6px 14px', fontSize:12, cursor:'pointer', fontFamily:'inherit'}}>← Dashboard</button>
        </div>
      </div>

      <div style={{padding:'12px 12px 0'}}>

        {/* MAP */}
        <div style={{background:C.white, borderRadius:12, overflow:'hidden', marginBottom:10, border:`1px solid ${C.border}`, boxShadow:'0 1px 4px rgba(0,0,0,0.08)'}}>
          <div style={{padding:'12px 16px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
            <div style={{fontWeight:'bold', color:C.navy, fontSize:13}}>📍 Localização em Tempo Real</div>
            <div style={{fontSize:11, color:C.gray}}>{records.length} registro(s)</div>
          </div>
          <iframe
            title="map"
            width="100%" height="300"
            style={{border:'none', display:'block'}}
            src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(mapLng)-0.01}%2C${parseFloat(mapLat)-0.01}%2C${parseFloat(mapLng)+0.01}%2C${parseFloat(mapLat)+0.01}&layer=mapnik&marker=${mapLat}%2C${mapLng}`}
          />
          <div style={{padding:'10px 16px', background:C.lgray, fontSize:11, color:C.gray, display:'flex', gap:16}}>
            <span>🟢 Check-in</span><span>🔴 Check-out</span>
            <span style={{marginLeft:'auto'}}>Sullivans Island, SC</span>
          </div>
        </div>

        {/* LEGEND */}
        <div style={{background:C.white, borderRadius:12, padding:16, marginBottom:10, border:`1px solid ${C.border}`}}>
          <div style={{fontWeight:'bold', color:C.navy, fontSize:13, marginBottom:12}}>REGISTROS COM GPS</div>
          {records.length===0 && <div style={{color:C.gray, fontSize:12, textAlign:'center', padding:16}}>Nenhum registro com GPS ainda.</div>}
          {records.map(r=>(
            <div key={r.id} style={{marginBottom:12, padding:12, background:C.lgray, borderRadius:10, cursor:'pointer', border: selected===r.id?`2px solid ${C.gold}`:`1px solid ${C.border}`}} onClick={()=>setSelected(selected===r.id?null:r.id)}>
              <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:6}}>
                <span style={{fontWeight:'bold', color:C.navy, fontSize:13}}>👷 {r.employeeName}</span>
                <span style={{fontSize:11, color:C.gray}}>{r.checkin?.date}</span>
              </div>
              {r.checkin?.coords && <div style={{fontSize:11, color:C.green, marginBottom:3}}>🟢 IN: {r.checkin.coords.lat}, {r.checkin.coords.lng} · {r.checkin.time}</div>}
              {r.checkout?.coords && <div style={{fontSize:11, color:C.red}}>🔴 OUT: {r.checkout.coords.lat}, {r.checkout.coords.lng} · {r.checkout.time}</div>}
              {!r.checkout?.coords && r.checkin && <div style={{fontSize:11, color:C.gray}}>⚪ Check-out pendente</div>}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
