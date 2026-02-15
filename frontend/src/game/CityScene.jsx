import { Canvas } from '@react-three/fiber';
import { Sky, Text, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { useMemo, useRef } from 'react';

function AvatarMesh({ player, isSelf }) {
  return (
    <group position={[player.position.x, 0.2, player.position.z]}>
      <mesh>
        <boxGeometry args={[0.24, 0.32, 0.18]} />
        <meshStandardMaterial color={isSelf ? player.avatar?.shirt || '#4d9eff' : '#fb923c'} />
      </mesh>
      <mesh position={[0, 0.22, 0]}>
        <boxGeometry args={[0.16, 0.16, 0.16]} />
        <meshStandardMaterial color={player.avatar?.skin || '#f1c27d'} />
      </mesh>
      <Text position={[0, 0.45, 0]} fontSize={0.08} color="black" anchorX="center">
        {player.name}
      </Text>
    </group>
  );
}

function Plot({ plot, onBuy }) {
  const color = plot.ownerId ? '#22c55e' : plot.buyable ? '#3b82f6' : '#64748b';
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[plot.x, 0.01, plot.z]} onClick={() => onBuy(plot)}>
      <planeGeometry args={[0.95, 0.95]} />
      <meshStandardMaterial color={color} transparent opacity={0.75} />
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
    </group>
  );
}

export default function CityScene({ snapshot, selfId, onBuyPlot, onMoveSelf }) {
  const controlsRef = useRef(null);

  return (
    <Canvas camera={{ position: [8, 10, 8], fov: 45 }}>
      <Sky distance={450000} sunPosition={[1, 1, 0]} inclination={0.5} azimuth={0.2} />
      <ambientLight intensity={0.8} />
      <directionalLight position={[8, 12, 2]} intensity={1} />

      <OrbitControls
        ref={controlsRef}
        enableRotate={false}
        enableZoom={false}
        enablePan
        screenSpacePanning
        minPolarAngle={1.05}
        maxPolarAngle={1.05}
      />

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} onClick={(e) => onMoveSelf(e.point)}>
        <planeGeometry args={[120, 120]} />
        <meshStandardMaterial color="#84cc16" />
      </mesh>

      <group rotation={[0, Math.PI / 4, 0]}>
        {snapshot.plots.map((plot) => (
          <Plot key={`plot-${plot.x}-${plot.z}`} plot={plot} onBuy={onBuyPlot} />
        ))}
        {snapshot.buildings.map((b) => (
          <Building key={b.id} building={b} />
        ))}
        {snapshot.roads.map((road) => (
          <mesh key={`road-${road.x}-${road.z}`} rotation={[-Math.PI / 2, 0, 0]} position={[road.x, 0.02, road.z]}>
            <planeGeometry args={[0.3, 0.9]} />
            <meshStandardMaterial color="#1f2937" />
          </mesh>
        ))}
      </group>

      {snapshot.players.map((player) => (
        <AvatarMesh key={player.id} player={player} isSelf={player.id === selfId} />
      ))}
    </Canvas>
  );
}
