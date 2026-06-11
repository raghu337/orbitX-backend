import { useFrame } from '@react-three/fiber/native';
import { useRef } from 'react';

const PlanetMesh = ({ planet, scale, distance, onSelect, orbitSpeed, rotationSpeed, isSelected }) => {
  const meshRef = useRef();
  const pivotRef = useRef();

  useFrame((state, delta) => {
    if (!pivotRef.current || !meshRef.current) return;
    pivotRef.current.rotation.y += orbitSpeed * delta;
    meshRef.current.rotation.y += rotationSpeed * delta;
    const angle = pivotRef.current.rotation.y;
    const x = distance * Math.sin(angle);
    const z = distance * Math.cos(angle);
    meshRef.current.position.set(x, 0, z);
  });

  return (
    <group ref={pivotRef}>
      <mesh
        ref={meshRef}
        position={[distance, 0, 0]}
        castShadow
        receiveShadow
        onPointerDown={(event) => {
          event.stopPropagation();
          onSelect(planet);
        }}
      >
        <sphereGeometry args={[scale, 48, 48]} />
        <meshStandardMaterial
          color={planet.color}
          roughness={0.8}
          metalness={0.1}
          emissive={planet.emissive || '#000000'}
          emissiveIntensity={planet.emissive ? 0.25 : 0}
        />
      </mesh>
      {isSelected && (
        <mesh position={[distance, 0, 0]}>
          <ringGeometry args={[scale + 0.15, scale + 0.25, 64]} />
          <meshBasicMaterial color="#00E5FF" transparent opacity={0.3} side={2} />
        </mesh>
      )}
    </group>
  );
};

export default PlanetMesh;
