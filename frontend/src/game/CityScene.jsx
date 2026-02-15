import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo } from 'react';

function AvatarMesh({ player, isSelf }) {
  return (
    <group position={[player.position.x, 0.5, player.position.z]}>
      <mesh>
        <boxGeometry args={[0.6, 1, 0.4]} />
        <meshStandardMaterial color={isSelf ? player.avatar?.shirt || '#4d9eff' : '#f97316'} />
      </mesh>
      <mesh position={[0, 0.8, 0]}>
        <boxGeometry args={[0.45, 0.45, 0.45]} />
        <meshStandardMaterial color={player.avatar?.skin || '#f1c27d'} />
      </mesh>
      <Text position={[0, 1.4, 0]} fontSize={0.2} color="white" anchorX="center">
        {player.name}
      </Text>
    </group>
  );
}

function Plot({ plot, onBuy }) {
  const color = plot.ownerId ? '#16a34a' : plot.buyable ? '#1d4ed8' : '#334155';
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[plot.x, 0, plot.z]} onClick={() => onBuy(plot)}>
      <planeGeometry args={[0.95, 0.95]} />
      <meshStandardMaterial color={color} transparent opacity={0.7} />
    </mesh>
  );
}

function Building({ building }) {
  const tex = useMemo(() => {
    if (!building.wallTexture) return null;
    const texture = new THREE.TextureLoader().load(building.wallTexture);
    texture.magFilter = THREE.NearestFilter;
    return texture;
  }, [building.wallTexture]);

  return (
    <group position={[building.x, 0.5, building.z]}>
      <mesh>
        <boxGeometry args={[0.8, building.level, 0.8]} />
        <meshStandardMaterial color="gray" map={tex} />
      </mesh>
      <Text position={[0, building.level / 2 + 0.45, 0]} fontSize={0.15} anchorX="center">
        {building.type} L{building.level}
      </Text>
    </group>
  );
}

export default function CityScene({ snapshot, selfId, onBuyPlot }) {
  return (
    <Canvas camera={{ position: [8, 9, 8], fov: 50 }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[5, 10, 5]} intensity={1} />
      <OrbitControls minPolarAngle={0.2} maxPolarAngle={Math.PI / 2.2} target={[0, 0, 0]} />
      <group rotation={[0, Math.PI / 4, 0]}>
        {snapshot.plots.map((plot) => (
          <Plot key={`plot-${plot.x}-${plot.z}`} plot={plot} onBuy={onBuyPlot} />
        ))}
        {snapshot.buildings.map((b) => (
          <Building key={b.id} building={b} />
        ))}
        {snapshot.roads.map((road) => (
          <mesh key={`road-${road.x}-${road.z}`} rotation={[-Math.PI / 2, 0, 0]} position={[road.x, 0.01, road.z]}>
            <planeGeometry args={[0.3, 0.9]} />
            <meshStandardMaterial color="#111827" />
          </mesh>
        ))}
      </group>
      {snapshot.players.map((player) => (
        <AvatarMesh key={player.id} player={player} isSelf={player.id === selfId} />
      ))}
    </Canvas>
  );
}
