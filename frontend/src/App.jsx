import { useEffect, useMemo, useState } from 'react';
import AvatarCreator from './components/AvatarCreator';
import PixelWallEditor from './components/PixelWallEditor';
import CityScene from './game/CityScene';
import { socket } from './network/socket';

const defaultSnapshot = { players: [], plots: [], buildings: [], roads: [] };

export default function App() {
  const [snapshot, setSnapshot] = useState(defaultSnapshot);
  const [selfId, setSelfId] = useState('');
  const [avatar, setAvatar] = useState({ skin: '#f1c27d', shirt: '#4d9eff', pants: '#2c3e50', hair: '#2d1c13' });
  const [selectedType, setSelectedType] = useState('Pizza Place');
  const [wallTexture, setWallTexture] = useState(null);

  useEffect(() => {
    setSelfId(socket.id || '');

    socket.on('city:snapshot', (payload) => setSnapshot(payload));
    socket.on('player:joined', () => setSelfId(socket.id || ''));
    socket.on('player:moved', ({ id, position }) => {
      setSnapshot((prev) => ({
        ...prev,
        players: prev.players.map((p) => (p.id === id ? { ...p, position } : p))
      }));
    });

    const move = (event) => {
      const me = snapshot.players.find((p) => p.id === socket.id);
      if (!me) return;
      const delta = 0.2;
      const next = { ...me.position };
      if (event.key === 'ArrowUp') next.z -= delta;
      if (event.key === 'ArrowDown') next.z += delta;
      if (event.key === 'ArrowLeft') next.x -= delta;
      if (event.key === 'ArrowRight') next.x += delta;
      socket.emit('player:move', next);
    };

    window.addEventListener('keydown', move);
    return () => {
      socket.off('city:snapshot');
      socket.off('player:moved');
      window.removeEventListener('keydown', move);
    };
  }, [snapshot.players]);

  const myOwnedPlots = useMemo(() => {
    const me = snapshot.players.find((p) => p.id === socket.id);
    return me?.ownedPlots || [];
  }, [snapshot.players]);

  const handleBuyPlot = (plot) => socket.emit('plot:buy', { x: plot.x, z: plot.z });

  const handlePlaceBuilding = () => {
    const target = myOwnedPlots[0];
    if (!target) return;
    socket.emit('building:place', { type: selectedType, x: target.x, z: target.z, wallTexture });
  };

  return (
    <div className="layout">
      <aside>
        <h2>BlockCity Empire MVP</h2>
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
          <p className="hint">Click blue tiles to buy plots. Arrow keys move avatar.</p>
        </div>
      </aside>
      <main>
        <CityScene snapshot={snapshot} selfId={selfId} onBuyPlot={handleBuyPlot} />
      </main>
    </div>
  );
}
