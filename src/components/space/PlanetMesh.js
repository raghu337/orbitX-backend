import { useFrame } from '@react-three/fiber/native';
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { TextureLoader } from 'expo-three';

const PLANET_TEXTURES = {
  mercury: 'https://raw.githubusercontent.com/KyleGough/solar-system/master/textures/mercury.jpg',
  venus: 'https://raw.githubusercontent.com/KyleGough/solar-system/master/textures/venus.jpg',
  earth: require('../../../assets/images/earth.png'),
  mars: require('../../../assets/images/mars.png'),
  jupiter: 'https://raw.githubusercontent.com/KyleGough/solar-system/master/textures/jupiter.jpg',
  saturn: 'https://raw.githubusercontent.com/KyleGough/solar-system/master/textures/saturn.jpg',
  uranus: 'https://raw.githubusercontent.com/KyleGough/solar-system/master/textures/uranus.jpg',
  neptune: 'https://raw.githubusercontent.com/KyleGough/solar-system/master/textures/neptune.jpg',
  moon: require('../../../assets/images/moon.png'),
};

const PlanetMesh = ({
  planet,
  scale,
  distance,
  onSelect,
  orbitSpeed,
  rotationSpeed,
  isSelected,
  planetPositionsRef,
  isScanning,
}) => {
  const pivotRef = useRef();
  const groupRef = useRef();
  const scanRingRef = useRef();
  const phobosRef = useRef();
  const deimosRef = useRef();

  const [texture, setTexture] = useState(null);
  const [specularMap, setSpecularMap] = useState(null);

  // Set initial orbital position angle
  useEffect(() => {
    if (pivotRef && pivotRef.current && planet && planet.initialAngle !== undefined) {
      pivotRef.current.rotation.y = planet.initialAngle;
    }
  }, [planet]);

  const pointsPhobos = React.useMemo(() => {
    const segments = 64;
    const positions = new Float32Array((segments + 1) * 3);
    const radius = scale * 1.6;
    for (let i = 0; i <= segments; i += 1) {
      const theta = (i / segments) * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = Math.sin(theta) * radius;
    }
    return positions;
  }, [scale]);

  const pointsDeimos = React.useMemo(() => {
    const segments = 64;
    const positions = new Float32Array((segments + 1) * 3);
    const radius = scale * 2.3;
    for (let i = 0; i <= segments; i += 1) {
      const theta = (i / segments) * Math.PI * 2;
      positions[i * 3] = Math.cos(theta) * radius;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = Math.sin(theta) * radius;
    }
    return positions;
  }, [scale]);

  useEffect(() => {
    if (!planet || !planet.id) return;
    const textureSource = PLANET_TEXTURES[planet.id];
    if (!textureSource) return;

    try {
      const loader = new TextureLoader();
      const tex = loader.load(textureSource);
      tex.generateMipmaps = false;
      tex.minFilter = THREE.LinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    } catch (e) {
      console.warn(`Failed to resolve asset texture for ${planet.id}:`, e);
    }

    // Load Earth specular map
    if (planet.id === 'earth') {
      try {
        const loader = new TextureLoader();
        const specTex = loader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/planets/earth_specular_2048.jpg');
        specTex.generateMipmaps = false;
        specTex.minFilter = THREE.LinearFilter;
        specTex.magFilter = THREE.LinearFilter;
        setSpecularMap(specTex);
      } catch (err) {
        console.warn('Error loading Earth specular map:', err);
      }
    }
  }, [planet]);

  useFrame((state, delta) => {
    // 1. Pivot rotation (revolution around the Sun)
    if (pivotRef && pivotRef.current) {
      pivotRef.current.rotation.y += orbitSpeed * delta;
    }
    
    // 2. Planet rotation (spin) and position tracking
    if (planet && groupRef && groupRef.current) {
      groupRef.current.rotation.y += rotationSpeed * delta;

      // Save world position in shared reference
      if (planetPositionsRef && planetPositionsRef.current) {
        const worldPos = new THREE.Vector3();
        groupRef.current.getWorldPosition(worldPos);
        planetPositionsRef.current[planet.id] = { x: worldPos.x, y: worldPos.y, z: worldPos.z };
      }
    }

    // 3. Animate 3D scanning ring
    if (isScanning && scanRingRef && scanRingRef.current) {
      const time = state.clock.getElapsedTime();
      scanRingRef.current.position.y = Math.sin(time * 6) * scale;
    }

    // 4. Animate Phobos & Deimos if this is Mars
    if (planet && planet.id === 'mars') {
      const time = state.clock.getElapsedTime();
      if (phobosRef && phobosRef.current) {
        const phobosAngle = time * 2.2;
        phobosRef.current.position.set(
          Math.cos(phobosAngle) * scale * 1.6,
          0,
          Math.sin(phobosAngle) * scale * 1.6
        );
      }
      if (deimosRef && deimosRef.current) {
        const deimosAngle = time * 1.0;
        deimosRef.current.position.set(
          Math.cos(deimosAngle) * scale * 2.3,
          0,
          Math.sin(deimosAngle) * scale * 2.3
        );
      }
    }
  });

  if (!planet) return null;

  const isEarth = planet.id === 'earth';

  // Apply scientific surface roughness & metallic reflection properties
  let roughness = 0.8;
  let metalness = 0.0;

  if (planet.id === 'mercury') {
    roughness = 1.0; // Matte, unreflective slate-gray
    metalness = 0.0;
  } else if (planet.id === 'venus') {
    roughness = 0.15; // Yellowish-cream uniform reflective cloud layers
    metalness = 0.15;
  } else if (planet.id === 'earth') {
    roughness = 0.4; // Shiny oceans, matte land
    metalness = 0.1;
  } else if (planet.id === 'mars') {
    roughness = 0.95; // Dusty matte iron-rust surface
    metalness = 0.0;
  } else if (planet.id === 'jupiter') {
    roughness = 0.65;
    metalness = 0.0;
  } else if (planet.id === 'saturn') {
    roughness = 0.55;
    metalness = 0.0;
  } else if (planet.id === 'uranus') {
    roughness = 0.45;
    metalness = 0.0;
  } else if (planet.id === 'neptune') {
    roughness = 0.45;
    metalness = 0.0;
  }

  const standardProps = {
    color: texture ? '#FFFFFF' : planet.color,
    map: texture || null,
    roughness: roughness,
    metalness: metalness,
    emissive: planet.emissive || '#000000',
    emissiveIntensity: planet.emissive ? 0.25 : 0,
  };

  const phongProps = {
    color: texture ? '#FFFFFF' : planet.color,
    map: texture || null,
    specularMap: specularMap || null,
    specular: new THREE.Color(0x1a3b8b),
    shininess: 30,
    emissive: planet.emissive || '#000000',
    emissiveIntensity: planet.emissive ? 0.25 : 0,
  };

  return (
    <group ref={pivotRef}>
      <group
        ref={groupRef}
        position={[distance, 0, 0]}
      >
        {/* Planet sphere mesh with direct gesture responder */}
        <mesh 
          castShadow 
          receiveShadow
          onPointerDown={(event) => {
            event.stopPropagation();
            onSelect(planet);
          }}
        >
          <sphereGeometry args={[scale, 48, 48]} />
          {isEarth ? (
            <meshPhongMaterial {...phongProps} />
          ) : (
            <meshStandardMaterial {...standardProps} />
          )}
        </mesh>

        {/* Atmospheric scattering layer for Earth and Venus */}
        {(planet.id === 'earth' || planet.id === 'venus') && (
          <mesh>
            <sphereGeometry args={[scale * 1.12, 32, 32]} />
            <meshBasicMaterial
              color={planet.id === 'earth' ? '#8BE1F0' : '#E3D1B5'}
              transparent
              opacity={0.25}
              blending={THREE.AdditiveBlending}
              side={THREE.BackSide}
            />
          </mesh>
        )}

        {/* Saturn rings */}
        {planet.id === 'saturn' && (
          <mesh rotation={[Math.PI / 2.5, 0, 0]} castShadow receiveShadow>
            <ringGeometry args={[scale * 1.4, scale * 2.5, 64]} />
            <meshStandardMaterial
              color="#8A8A8A" // Gorgeous semi-translucent dust-gray rings
              transparent
              opacity={0.5}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Uranus rings */}
        {planet.id === 'uranus' && (
          <mesh rotation={[0, 0, Math.PI / 2.2]} castShadow receiveShadow>
            <ringGeometry args={[scale * 1.3, scale * 1.8, 64]} />
            <meshStandardMaterial
              color="#4BB8BC"
              transparent
              opacity={0.4}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* 3D Scanning Line Overlay */}
        {isScanning && (
          <mesh ref={scanRingRef} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[scale * 0.98, scale * 1.05, 64]} />
            <meshBasicMaterial
              color="#00E5FF"
              transparent
              opacity={0.85}
              side={THREE.DoubleSide}
            />
          </mesh>
        )}

        {/* Selection Indicator Ring */}
        {isSelected && (
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[scale + 0.15, scale + 0.25, 64]} />
            <meshBasicMaterial color="#00E5FF" transparent opacity={0.4} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Mars Moons: Phobos & Deimos */}
        {planet.id === 'mars' && (
          <>
            {/* Phobos Orbit Line */}
            <line rotation={[-Math.PI / 2, 0, 0]}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={pointsPhobos.length / 3}
                  array={pointsPhobos}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#00E5FF" transparent opacity={0.25} linewidth={1} />
            </line>
            
            {/* Phobos Mesh */}
            <mesh ref={phobosRef}>
              <sphereGeometry args={[scale * 0.12, 16, 16]} />
              <meshStandardMaterial color="#8E8E8E" roughness={0.8} />
            </mesh>

            {/* Deimos Orbit Line */}
            <line rotation={[-Math.PI / 2, 0, 0]}>
              <bufferGeometry>
                <bufferAttribute
                  attach="attributes-position"
                  count={pointsDeimos.length / 3}
                  array={pointsDeimos}
                  itemSize={3}
                />
              </bufferGeometry>
              <lineBasicMaterial color="#00E5FF" transparent opacity={0.2} linewidth={1} />
            </line>

            {/* Deimos Mesh */}
            <mesh ref={deimosRef}>
              <sphereGeometry args={[scale * 0.08, 16, 16]} />
              <meshStandardMaterial color="#A5A5A5" roughness={0.8} />
            </mesh>
          </>
        )}
      </group>
    </group>
  );
};

export default PlanetMesh;
