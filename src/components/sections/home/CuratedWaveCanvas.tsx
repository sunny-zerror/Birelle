"use client";

import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const noRaycast = () => {};
// The GL canvas overhangs the card by this much (fraction of card height) above and below, so the card's
// outline has room to bulge past its box. Must be at least STRETCH / 2 in the shader.
const PAD = 0.08;

const vertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// The current image sits left of the wave front, the next one right of it. uProgress (0 → 1) is the track's
// position between the two slides, so the front sweeps right → left exactly as the cards move.
// Around the straight, vertical front the whole card bulges: its top and bottom edges swell outward and the
// image is magnified with them like a lens, with a slight R/G/B split.
const fragment = /* glsl */ `
  uniform sampler2D uFrom;
  uniform sampler2D uTo;
  uniform vec2 uFromSize;
  uniform vec2 uToSize;
  uniform vec2 uPlane; // card size, px
  uniform float uPad;
  uniform float uProgress;
  varying vec2 vUv;

  const float PI = 3.14159265;
  const float BAND = 0.3;    // half-width of the bulge, in card widths
  const float BULGE = 0.245; // how strongly the bulge magnifies across
  const float STRETCH = 0.05; // how much taller the card grows at the peak
  const float SPLIT = 0.005; // R/B channel offset at the peak
  const float EDGE = 0.025;  // softness of the old → new seam; kept tight so it wipes rather than double-exposes

  // object-fit: cover
  vec2 coverUv(vec2 uv, vec2 img) {
    float rp = uPlane.x / uPlane.y;
    float ri = img.x / img.y;
    vec2 s = rp > ri ? vec2(1.0, ri / rp) : vec2(rp / ri, 1.0);
    return (uv - 0.5) * s + 0.5;
  }

  vec3 rgbSample(sampler2D tex, vec2 size, vec2 uv, float shift) {
    vec2 c = coverUv(uv, size);
    vec2 o = vec2(shift, 0.0);
    return vec3(texture2D(tex, c + o).r, texture2D(tex, c).g, texture2D(tex, c - o).b);
  }

  void main() {
    // Canvas space → card space (the canvas overhangs the card above and below)
    vec2 uv = vec2(vUv.x, vUv.y * (1.0 + 2.0 * uPad) - uPad);
    float strength = sin(uProgress * PI); // 0 at rest, full mid-way between slides

    // One straight vertical front, travelling from past the right edge to past the left
    float front = mix(1.0 + BAND, -BAND, uProgress);
    float d = uv.x - front;

    // Smooth bell around the front: the card grows taller there and samples are pulled towards the front,
    // so the band reads as a single bulge in both the outline and the image
    float t = clamp(d / BAND, -1.0, 1.0);
    float bump = (1.0 - t * t) * (1.0 - t * t) * strength;
    float y = (uv.y - 0.5) / (1.0 + STRETCH * bump) + 0.5;
    vec2 warped = vec2(front + d * (1.0 - BULGE * bump), y);
    float shift = SPLIT * bump;

    // Card outline, anti-aliased over about a pixel
    float px = 1.0 / uPlane.y;
    float alpha = smoothstep(-px, px, y) * smoothstep(-px, px, 1.0 - y);
    if (alpha <= 0.0) discard;

    vec3 from = rgbSample(uFrom, uFromSize, warped, shift);
    vec3 to = rgbSample(uTo, uToSize, warped, -shift);
    float mask = smoothstep(-EDGE, EDGE, d);

    gl_FragColor = vec4(mix(from, to, mask), alpha);
  }
`;

const sizeOf = (tex: THREE.Texture, out: THREE.Vector2) => {
  const img = tex.image as HTMLImageElement;
  return out.set(img.naturalWidth || img.width || 1, img.naturalHeight || img.height || 1);
};

const mod = (n: number, m: number) => ((n % m) + m) % m;

type Props = {
  srcs: string[];
  // Track position in slides (fractional while moving), written by the carousel every frame it moves
  position: RefObject<number>;
  // Hands the carousel a redraw trigger to call after it moves (the canvas only renders on demand); null on unmount
  onWake: (redraw: (() => void) | null) => void;
};

const WavePlane = ({ srcs, position, onWake }: Props) => {
  const { size, invalidate } = useThree();
  const textures = useRef(new Map<string, THREE.Texture>());
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uFrom: { value: null as THREE.Texture | null },
      uTo: { value: null as THREE.Texture | null },
      uFromSize: { value: new THREE.Vector2(1, 1) },
      uToSize: { value: new THREE.Vector2(1, 1) },
      uPlane: { value: new THREE.Vector2(1, 1) },
      uPad: { value: PAD },
      uProgress: { value: 0 },
    }),
    [],
  );

  // Load every image up front so a swap never waits on the network
  useEffect(() => {
    const loader = new THREE.TextureLoader();
    const map = textures.current;
    new Set(srcs).forEach((src) => {
      if (map.has(src)) return;
      loader.load(src, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.generateMipmaps = false;
        map.set(src, tex);
        invalidate();
      });
    });
  }, [srcs, invalidate]);

  useEffect(() => {
    const map = textures.current;
    return () => map.forEach((tex) => tex.dispose());
  }, []);

  useEffect(() => {
    onWake(() => invalidate());
    invalidate();
    return () => onWake(null);
  }, [onWake, invalidate]);

  useFrame(() => {
    const material = materialRef.current;
    const pos = position.current ?? 0;
    const base = Math.floor(pos);
    const from = textures.current.get(srcs[mod(base, srcs.length)]);
    const to = textures.current.get(srcs[mod(base + 1, srcs.length)]);
    if (!from || !to || !material) return; // hold the plain image until both are decoded

    const u = material.uniforms;
    u.uFrom.value = from;
    u.uTo.value = to;
    sizeOf(from, u.uFromSize.value);
    sizeOf(to, u.uToSize.value);
    u.uPlane.value.set(size.width, size.height / (1 + 2 * PAD));
    u.uProgress.value = pos - base;
  });

  return (
    <mesh raycast={noRaycast} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertex}
        fragmentShader={fragment}
        uniforms={uniforms}
        transparent
        depthTest={false}
        depthWrite={false}
      />
    </mesh>
  );
};

// WebGL layer for the centre canvas: a single bulging RGB wave carries one product into the next, driven by the track
const CuratedWaveCanvas = (props: Props) => (
  <Canvas
    flat
    frameloop="demand"
    dpr={[1, 2]}
    gl={{ antialias: false, alpha: true }}
    // Explicit top + height: R3F forces height: 100% on its wrapper, which would override a negative bottom inset
    style={{ position: "absolute", left: 0, right: 0, top: `-${PAD * 100}%`, height: `${(1 + 2 * PAD) * 100}%`, pointerEvents: "none" }}
  >
    <WavePlane {...props} />
  </Canvas>
);

export default CuratedWaveCanvas;
