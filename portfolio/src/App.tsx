import "./App.css";
import * as THREE from "three";
import cage from "./assets/cage.png";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { Suspense, useCallback, useMemo, useRef, FC } from "react";

const Points: FC = () => {
  const image: THREE.Texture = useLoader(THREE.TextureLoader, cage);
  const bufferRef = useRef<THREE.BufferAttribute | null>(null);

  let amplitude: number = 5;
  let shift: number = 0;
  let frequency: number = 0.004;

  const graph = useCallback(
    (x: number, z: number): number => {
      return Math.sin((x ** 2 + z ** 2 + shift) * frequency) * amplitude;
    },
    [amplitude, shift, frequency]
  );

  const count: number = 10;
  const separation: number = 3;
  let positions: Float32Array = useMemo(() => {
    let positionsArray: number[] = [];
    for (let xIndex: number = 0; xIndex < count; xIndex++) {
      for (let zIndex: number = 0; zIndex < count; zIndex++) {
        let x: number = separation * (xIndex - count / 2);
        let z: number = separation * (zIndex - count / 2);
        let y: number = graph(x, z);
        positionsArray.push(x, y, z);
      }
    }
    return new Float32Array(positionsArray);
  }, [count, separation, graph]);

  useFrame(() => {
    shift += 15;
    if (bufferRef.current) {
      const positionsArray: Float32Array | undefined = bufferRef.current
        .array as Float32Array;
      let index: number = 0;
      for (let xIndex: number = 0; xIndex < count; xIndex++) {
        for (let zIndex: number = 0; zIndex < count; zIndex++) {
          let x: number = separation * (xIndex - count / 2);
          let z: number = separation * (zIndex - count / 2);
          positionsArray[index + 1] = graph(x, z);
          index += 3;
        }
      }
      bufferRef.current.needsUpdate = true;
    } else {
      console.log("bufferRef.current is undefined");
    }
  });

  return (
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          ref={bufferRef}
          attach={"attributes-position"}
          array={positions}
          count={positions.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        attach="material"
        map={image}
        size={3}
        sizeAttenuation
        transparent={false}
        alphaTest={0.5}
        opacity={1.0}
      />
    </points>
  );
};

const AnimationCanvas: FC = () => {
  return (
    <Canvas flat camera={{ position: [100, 10, 0], fov: 75 }}>
      <Points />
    </Canvas>
  );
};

export default function App() {
  return (
    <div className="anim">
      <Suspense fallback={<div>Loading...</div>}>
        <AnimationCanvas />
      </Suspense>
    </div>
  );
}
