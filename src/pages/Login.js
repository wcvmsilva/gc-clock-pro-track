import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const C = { navy:'#0D1B2A', gold:'#C9A84C', gray:'#6B7280', lgray:'#F3F4F6', white:'#fff', red:'#DC2626' };

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const user = await login(email, password);
      navigate(user.role === 'admin' ? '/admin' : '/employee');
    } catch(err) {
      setError(err.message);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', background:C.navy, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Georgia,serif', padding:16 }}>
      <div style={{ background:C.white, borderRadius:20, padding:'40px 32px', width:'100%', maxWidth:380, boxShadow:'0 20px 60px rgba(0,0,0,0.4)' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:64, height:64, background:C.navy, borderRadius:16, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:28 }}>⏱</div>
          <div style={{ fontSize:22, fontWeight:'bold', color:C.navy }}>GC Clock Pro Track</div>
          <div style={{ fontSize:12, color:C.gray, marginTop:4 }}>GC Home Improvement LLC</div>
        </div>
        <form onSubmit={handle}>
          <div style={{ marginBottom:16 }}>
            <label style={{ fontSize:11, fontWeight:'bold', color:C.gray, letterSpacing:1, display:'block', marginBottom:6 }}>EMAIL</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              style={{ width:'100%', border:'1.5px solid #E5E7EB', borderRadius:8, padding:'11px 14px', fontSize:14, color:C.navy, fontFamily:'inherit', boxSizing:'border-box' }}
              placeholder="seu@email.com"/>
          </div>
          <div style={{ marginBottom:24 }}>
            <label style={{ fontSize:11, fontWeight:'bold', color:C.gray, letterSpacing:1, display:'block', marginBottom:6 }}>SENHA</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required
              style={{ width:'100%', border:'1.5px solid #E5E7EB', borderRadius:8, padding:'11px 14px', fontSize:14, color:C.navy, fontFamily:'inherit', boxSizing:'border-box' }}
              placeholder="••••••••"/>
          </div>
          {error && <div style={{ background:'#FEF2F2', color:C.red, borderRadius:8, padding:'10px 14px', fontSize:13, marginBottom:16, border:'1px solid #FECACA' }}>{error}</div>}
          <button type="submit" disabled={loading}
            style={{ width:'100%', background:loading?C.gray:C.navy, color:C.white, border:'none', borderRadius:10, padding:'13px', fontSize:15, fontWeight:'bold', cursor:loading?'not-allowed':'pointer', fontFamily:'inherit' }}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}
