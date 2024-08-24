import { Vector3 } from 'three';
import * as THREE from 'three';

export class Particle {
    public width: number;
    public height: number;
    public age: number;
    public position: Vector3;
    public velocity: Vector3 = new Vector3(0, 0, 0);
    public acceleration: Vector3 = new Vector3(0, 0, 0);
    public lifetime: number; // Lifetime of the particle

    private particleTexture: THREE.Texture;
    private particleMaterial: THREE.MeshBasicMaterial;
    private particleGeometry: THREE.PlaneGeometry;
    private particleMesh: THREE.Mesh;

    constructor(texture: THREE.Texture, _position: Vector3, _width?: number, _height?: number) {
        this.age = 0;
        this.lifetime = 2; // Lifetime between 2 and 7 seconds
        this.width = _width != null ? _width : 1;
        this.height = _height != null ? _height : 1;
        this.position = _position;
        this.particleTexture = texture;
        this.particleMaterial = new THREE.MeshBasicMaterial({
            map: this.particleTexture,
            color: 'green',
            transparent: true,
        });
        this.particleGeometry = new THREE.PlaneGeometry(this.width, this.height);
        this.particleMesh = new THREE.Mesh(this.particleGeometry, this.particleMaterial);
    }

    public ApplyForce(_newVelocity: Vector3, _newAcceleration: Vector3) {
        this.velocity = _newVelocity;
        this.acceleration = _newAcceleration;
    }

    public Update(deltaTime: number) {
        this.age += deltaTime;
        if (this.age > this.lifetime) {
            return false; // Indicate that the particle should be removed
        }
        this.velocity.add(this.acceleration.clone().multiplyScalar(deltaTime));
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        this.particleMesh.position.set(this.position.x, this.position.y, this.position.z);
        return true; // Particle is still valid
    }

    public Draw(scene: THREE.Scene) {
        this.particleMesh.position.set(this.position.x, this.position.y, this.position.z);
        scene.add(this.particleMesh);
    }

    public Remove(scene: THREE.Scene) {
        scene.remove(this.particleMesh);
    }
}
