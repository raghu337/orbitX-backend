import { useMemo } from 'react';

const SpaceBackground = ({ starCount = 200 }) => {
  const positions = useMemo(() => {
    const array = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i += 1) {
      array[i * 3] = (Math.random() - 0.5) * 200;
      array[i * 3 + 1] = (Math.random() - 0.5) * 120;
      array[i * 3 + 2] = (Math.random() - 0.5) * 200;
    }
    return array;
  }, [starCount]);

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
      </bufferGeometry>
      <pointsMaterial size={0.7} color="#FFFFFF" sizeAttenuation transparent opacity={0.78} />
    </points>
  );
};

export default SpaceBackground;
