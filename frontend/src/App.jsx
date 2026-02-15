import { useEffect, useMemo, useState } from 'react';
import { io } from 'socket.io-client';
import AvatarCreator from './components/AvatarCreator';
import PixelWallEditor from './components/PixelWallEditor';
import CityScene from './game/CityScene';

const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || API;
const defaultSnapshot = { players: [], plots: [], buildings: [], roads: [] };

export default function App() {
  const [snapshot, setSnapshot] = useState(defaultSnapshot);
  const [socket, setSocket] = useState(null);
  const [selfId, setSelfId] = useState('');
  const [token, setToken] = useState(localStorage.getItem('bc_token') || '');
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [authError, setAuthError] = useState('');
  const [step, setStep] = useState(token ? 'world' : 'auth');
  const [menuOpen, setMenuOpen] = useState(false);
  const [avatar, setAvatar] = useState({ skin: '#f1c27d', shirt: '#4d9eff', pants: '#2c3e50', hair: '#2d1c13' });
  const [selectedType, setSelectedType] = useState('Pizza Place');
  const [wallTexture, setWallTexture] = useState(null);

  useEffect(() => {
    if (!token || step === 'auth') return;

    const s = io(SOCKET_URL, {
      auth: { token, avatar }
    });

    setSocket(s);
    s.on('connect', () => setSelfId(s.id));
    s.on('city:snapshot', (payload) => setSnapshot(payload));
    s.on('player:moved', ({ id, position }) => {
      setSnapshot((prev) => ({
        ...prev,
        players: prev.players.map((p) => (p.id === id ? { ...p, position } : p))
      }));
    });

    return () => s.disconnect();
  }, [token, step, avatar]);

  const onAuthSubmit = async () => {
    setAuthError('');
    const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
    const body = authMode === 'register' ? authForm : { email: authForm.email, password: authForm.password };

    try {
      const response = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!response.ok) {
        setAuthError(data.error || 'Auth failed');
        return;
      }

      localStorage.setItem('bc_token', data.token);
      setToken(data.token);
      if (data.profile?.avatar) setAvatar(data.profile.avatar);
      setStep(data.isNew ? 'avatar' : 'world');
    } catch (_error) {
      setAuthError('Server unavailable');
    }
  };

  const saveAvatarAndEnter = async () => {
    await fetch(`${API}/api/auth/avatar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, avatar })
    });
    setStep('world');
  };

  const myOwnedPlots = useMemo(() => {
    const me = snapshot.players.find((p) => p.id === selfId);
    return me?.ownedPlots || [];
  }, [snapshot.players, selfId]);

  const handleBuyPlot = (plot) => socket?.emit('plot:buy', { x: plot.x, z: plot.z });

  const handlePlaceBuilding = () => {
    const target = myOwnedPlots[0];
    if (!target || !socket) return;
    socket.emit('building:place', { type: selectedType, x: target.x, z: target.z, wallTexture });
  };

  if (step === 'auth') {
    return (
      <div className="auth-screen">
        <div className="card">
          <h1>BlockCity Empire</h1>
          <p>{authMode === 'register' ? 'Регистрация' : 'Авторизация'}</p>
          {authMode === 'register' && (
            <input placeholder="Name" value={authForm.name} onChange={(e) => setAuthForm((p) => ({ ...p, name: e.target.value }))} />
          )}
          <input placeholder="Email" value={authForm.email} onChange={(e) => setAuthForm((p) => ({ ...p, email: e.target.value }))} />
          <input
            placeholder="Password"
            type="password"
            value={authForm.password}
            onChange={(e) => setAuthForm((p) => ({ ...p, password: e.target.value }))}
          />
          <button onClick={onAuthSubmit}>{authMode === 'register' ? 'Зарегистрироваться' : 'Войти'}</button>
          <button className="ghost" onClick={() => setAuthMode((m) => (m === 'register' ? 'login' : 'register'))}>
            {authMode === 'register' ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Регистрация'}
          </button>
          {authError ? <p className="error">{authError}</p> : null}
        </div>
      </div>
    );
  }

  if (step === 'avatar') {
    return (
      <div className="auth-screen">
        <div className="card">
          <h2>Создание персонажа</h2>
          <AvatarCreator avatar={avatar} onChange={setAvatar} />
          <button onClick={saveAvatarAndEnter}>Войти в мир</button>
        </div>
      </div>
    );
  }

  return (
    <div className="world-layout">
      <button className="menu-toggle" onClick={() => setMenuOpen((v) => !v)}>
        {menuOpen ? '✕' : '☰'}
      </button>

      {menuOpen && (
        <aside className="floating-menu">
          <AvatarCreator avatar={avatar} onChange={setAvatar} />
          <PixelWallEditor onTextureChange={setWallTexture} />
          <div className="panel">
            <h3>Place Building</h3>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              {['Bakery', 'Coffee Shop', 'Supermarket', 'Hair Salon', 'Gym', 'Pizza Place', 'Clothing Store', 'Flower Shop'].map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
            <button onClick={handlePlaceBuilding}>Place on first owned plot</button>
            <p className="hint">ЛКМ по земле: перемещение. ЛКМ по синей плитке: купить участок.</p>
          </div>
        </aside>
      )}

      <CityScene
        snapshot={snapshot}
        selfId={selfId}
        onBuyPlot={handleBuyPlot}
        onMoveSelf={(point) => socket?.emit('player:move', { x: point.x, z: point.z })}
      />
    </div>
  );
}
