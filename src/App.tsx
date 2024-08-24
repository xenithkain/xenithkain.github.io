import "./App.css";
import * as THREE from "three";
import { Vector3 } from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Suspense, useRef, FC, useState, useEffect} from "react";
import { Edges, useGLTF } from '@react-three/drei';
import { BufferGeometryUtils,} from "three/examples/jsm/Addons.js";
import { Particle } from "./components/Particle";
import { EffectComposer, Bloom, ToneMapping } from '@react-three/postprocessing'



let phonePos: Vector3;

const Room: FC = () => {
  return (
    //Remember that to position elements in react-three-fiber, to use the <mesh>'s position property
    <mesh position={[0, 2.5,0]}>
      <Edges geometry={new THREE.BoxGeometry(5,5,5)} color="green"/>
    </mesh>
  );
}

const CameraController: FC = () => {
  const { camera} = useThree();
  let mouseX = 0;
  let mouseY = 0;
  let cameraState : string;

  document.addEventListener('mousemove', (e) => {
    //clientX and Y, are Mouse Positions in terms of the viewport
    //Dividing by window dimensions gives value from 0 to 1, then *2 -/+ 1 is for normalizing the value to between -1 and 1
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
  //A state variable for holding all the geometries that make up the phone
  const [combinedGeometry, setCombinedGeometry] = useState<THREE.BufferGeometry | null>(null);

  //References to a Mesh, and time variables
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

      meshRef.current.rotation.z += 0.01;
      
      const amplitude = 0.08; // Maximum distance of bobbing
      const frequency = 2.5; // Speed of bobbing
      meshRef.current.position.y = amplitude * Math.sin(frequency * timeRef.current) + .75;
      phonePos = meshRef.current.position.clone();
    }
  });

  if (!combinedGeometry) {
    return null;
  }

  return (
    <mesh
    //Use this for when you need reference to a mesh
      ref={meshRef}
      position={[2, 0, -2]}
      rotation={[0.5 * Math.PI, 0, Math.PI]}
      scale={[0.01, 0.01, 0.01]}
      geometry={combinedGeometry}
      material={new THREE.MeshStandardMaterial({color:'green', emissive:'green', emissiveIntensity:8})}
    >
      <Edges  geometry={combinedGeometry} color="green" />
    </mesh>
  );
};

const Table: FC = () => {
  const { nodes } = useGLTF('./wooden_table.glb');
  const meshNode = nodes['Desk_LP_01_-_Default_0'] as THREE.Mesh;

  if (!meshNode || !(meshNode instanceof THREE.Mesh) || !meshNode.geometry) {
    console.log("Something about the table didnt work");
    return null;
  }

  return (
    <mesh 
      position={[2,0,-2]}
      rotation={[0,0,1*Math.PI]} 
      scale={[.01,.01,.01]} 
      geometry={meshNode.geometry} 
      material={new THREE.MeshStandardMaterial({ color: 'green' })}
     >
      <Edges geometry={meshNode.geometry} color="green" />
    </mesh>
  );
};

async function loadTexture(url: string): Promise<THREE.Texture> {
  return new Promise((resolve, reject) => {
    const loader = new THREE.TextureLoader();
    loader.load(
      url,
      (texture) => resolve(texture),
      undefined,
      (error) => reject(error)
    );
  });
}

function HandleParticles() {
  const { scene } = useThree();
  const particlesRef = useRef<Particle[]>([]);
  const [texture, setTexture] = useState<THREE.Texture | null>(null);

  //UseEffect is used so loading the texture doesnt disrupt anything else
  useEffect(() => {
      async function initializeTexture() {
          try {
              const loadedTexture = await loadTexture('./particle.png');
              setTexture(loadedTexture);
          } catch (error) {
              console.error('Error loading texture:', error);
          }
      }

      initializeTexture();
  }, []);

  useFrame((state, deltaTime) => {
      // Update particles on each frame
      particlesRef.current = particlesRef.current.filter(particle => {
          const isAlive = particle.Update(deltaTime); // Update each particle
          if (!isAlive) {
              particle.Remove(scene); // Remove from scene if expired
              return false; // Remove from the particles array
          }
          return true; // Keep in the particles array
      });
      if(!texture) return;
      // Respawn new particles if needed
      if(particlesRef.current.length < 200){
        for (let i = 0; i < 2; i++) {

          let rndPosition = new Vector3(phonePos.x, phonePos.y, phonePos.z); //Not random atm
          let particle = new Particle(texture, rndPosition, .1, .1);
          //Apply a force in a random direction
          particle.ApplyForce(new Vector3(Math.random()*2-1, Math.random()*2-1, Math.random()*2-1).multiplyScalar(.1), new Vector3(0, 0.01, 0));
          particlesRef.current.push(particle);
          particle.Draw(scene);
      }
      }
      
      
  });

  return null; // This component doesn't render anything directly
}




const AnimationCanvas: FC = () => {
  return (
    <Canvas flat camera={{ position: [0, 1.75, 5], fov: 75 , rotation: [0,0,0]}}>
      <Room/>
      <CameraController/>
      <Table/>
      <Phone/>
      <EffectComposer>
        <Bloom mipmapBlur luminanceThreshold={1} levels={10} intensity={10 * 4} />
        <ToneMapping />
      </EffectComposer>
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
