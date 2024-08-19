import "./App.css";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef, FC, useState, useEffect } from "react";
import { Edges, useGLTF } from '@react-three/drei';
import { BufferGeometryUtils,} from "three/examples/jsm/Addons.js";

let mouseX = 0;
let mouseY = 0;
let cameraState : string;

document.addEventListener('mousemove', (e) => {
  mouseX = (e.clientX / window.innerWidth) * 2 - 1;
  mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
  if (mouseX < -0.8) {
    cameraState = "Left";
  } else if (mouseX > 0.8) {
    cameraState = "Right";
  }
  else if (mouseY > 0.8) {
    cameraState = "Up";
  } else if (mouseY < -0.8) {
    cameraState = "Down";
  } else {
    cameraState = "Idle";
  }
});

const Room: FC = () => {
  return (
    <mesh position={[0, 2.5,0]}>
      <Edges geometry={new THREE.BoxGeometry(5,5,5)} color="green"/>
    </mesh>
  );
}

const CameraController: FC = () => {
  const { camera} = useThree();
 
  let cameraSpeed = 0.02;
  camera.rotation.order='YXZ';
  camera.rotation.set(0,0,0);
  useFrame(() => {
    if (cameraState === "Up") {
      camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x += cameraSpeed, -0.5, 0.5); 
    }
    if (cameraState === "Down") {
      camera.rotation.x = THREE.MathUtils.clamp(camera.rotation.x -= cameraSpeed, -0.5, 0.5); 
    }
    if (cameraState === "Left") {
      camera.rotation.y += cameraSpeed;  
    }
    if (cameraState === "Right") {
      camera.rotation.y -= cameraSpeed;
    }
  });

  return null;
};





const Phone: FC = () => {
  const { nodes } = useGLTF('./phone.glb');
  const [combinedGeometry, setCombinedGeometry] = useState<THREE.BufferGeometry | null>(null);
  const meshRef = useRef<THREE.Mesh>(null!);
  const timeRef = useRef(0);

  useEffect(() => {
    const geometries: THREE.BufferGeometry[] = [];

    // Extract all geometries from the nodes
    Object.values(nodes).forEach((node) => {
      if (node instanceof THREE.Mesh && node.geometry) {
        geometries.push(node.geometry as THREE.BufferGeometry);
      }
    });

    if (geometries.length > 0) {
      // Combine all geometries into one
      const combined = BufferGeometryUtils.mergeGeometries(geometries);
      setCombinedGeometry(combined);
    }
  }, [nodes]);

  useFrame(() => {
    if (meshRef.current) {
      // Update timeRef to create a smooth oscillation
      timeRef.current += 0.01;

      // Rotate the mesh around the Y-axis
      meshRef.current.rotation.z += 0.01;
      
      // Bobbing effect
      const amplitude = 0.08; // Maximum distance of bobbing
      const frequency = 2.5; // Speed of bobbing
      meshRef.current.position.y = amplitude * Math.sin(frequency * timeRef.current) + .75;
    }
  });

  if (!combinedGeometry) {
    return null;
  }

  return (
    <mesh
      ref={meshRef}
      position={[2, 0, -2]}
      rotation={[0.5 * Math.PI, 0, Math.PI]}
      scale={[0.01, 0.01, 0.01]}
      geometry={combinedGeometry}
      material={new THREE.MeshStandardMaterial({ color: 'green' })}
    >
      <Edges geometry={combinedGeometry} color="green" />
    </mesh>
  );
};

const Table: FC = () => {
  const { nodes } = useGLTF('./wooden_table.glb');
  console.log("Table", nodes);
  const meshNode = nodes['Desk_LP_01_-_Default_0'] as THREE.Mesh;

  if (!meshNode || !(meshNode instanceof THREE.Mesh) || !meshNode.geometry) {
    return null;
  }

  return (
    <mesh position={[2,0,-2]} rotation={[0,0,1*Math.PI]} scale={[.01,.01,.01]} geometry={meshNode.geometry} material={new THREE.MeshStandardMaterial({ color: 'green' })}>
      <Edges geometry={meshNode.geometry} color="green" />
    </mesh>
  );
};

const AnimationCanvas: FC = () => {
  return (
    <Canvas flat camera={{ position: [0, 1.75, 0], fov: 75 , rotation: [0,0,0]}}>
      <Room/>
      <CameraController/>
      <Table/>
      <Phone/>
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
