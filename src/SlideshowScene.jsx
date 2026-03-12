/* eslint-disable */
import { useRef, useMemo, useEffect, Suspense, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const vert = `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
  }
`;
const frag = `
  uniform sampler2D uTex;
  uniform float     uAlpha;
  uniform float     uVig;
  varying vec2 vUv;
  void main(){
    vec4 c = texture2D(uTex, vUv);
    
    // Vignette
    vec2 uv2 = vUv * 2.0 - 1.0;
    float v = 1.0 - dot(uv2, uv2) * uVig;
    c.rgb *= v;
    
    // Micro contrast adjustment
    c.rgb = (c.rgb - 0.5) * 1.06 + 0.5;
    
    gl_FragColor = vec4(c.rgb, uAlpha);
  }
`;

function SlidePlane({ url, active }) {
  const mesh = useRef();
  const mat = useRef();
  const tex = useTexture(url);
  const { viewport } = useThree();
  
  // Slightly larger than viewport to accommodate Ken Burns zoom without showing edges
  const pW = viewport.width * 1.15;
  const pH = viewport.height * 1.15;

  useEffect(() => {
    if (!tex) return;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.magFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    if (mat.current) mat.current.uniforms.uTex.value = tex;
  }, [tex]);

  const uniforms = useMemo(() => ({
    uTex:   { value: tex },
    uAlpha: { value: 0 },
    uVig:   { value: 0.25 },
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []); 

  useFrame((_, delta) => {
    if (!mat.current || !mesh.current) return;
    
    const targetAlpha = active ? 1 : 0;
    const alpha = mat.current.uniforms.uAlpha.value;
    
    // Crossfade interpolation (lowered the multiplier for a slower, smoother blend)
    mat.current.uniforms.uAlpha.value += (targetAlpha - alpha) * 1.2 * delta;
    
    // Scale remains constant to prevent zooming out effect during transitions
    mesh.current.scale.setScalar(1.0);

    // Slight Z layering based on alpha prevents Z-fighting
    mesh.current.position.z = mat.current.uniforms.uAlpha.value * 0.1;
    mesh.current.visible = mat.current.uniforms.uAlpha.value > 0.001 || active;
  });

  return (
    <mesh ref={mesh}>
      <planeGeometry args={[pW, pH]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vert}
        fragmentShader={frag}
        uniforms={uniforms}
        transparent
        depthTest={false}
      />
    </mesh>
  );
}

export function SlideshowScene({ imageUrls, currentIndex }) {
  const historyRef = useRef([]);

  const nextIndex = (currentIndex + 1) % imageUrls.length;
  const prevIndex = (currentIndex - 1 + imageUrls.length) % imageUrls.length;
  
  const newSet = new Set([...historyRef.current, prevIndex, currentIndex, nextIndex]);
  
  const toKeep = new Set();
  for (let i = -2; i <= 2; i++) {
    toKeep.add((currentIndex + i + imageUrls.length) % imageUrls.length);
  }
  
  historyRef.current = Array.from(newSet).filter(idx => toKeep.has(idx));

  return (
    <>
      {historyRef.current.map(idx => (
        <Suspense key={imageUrls[idx]} fallback={null}>
          <SlidePlane url={imageUrls[idx]} active={idx === currentIndex} />
        </Suspense>
      ))}
      <color attach="background" args={['#020408']} />
    </>
  );
}
