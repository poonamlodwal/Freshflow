"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

export function Hero3DCanvas() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let animationFrameId: number;
    let prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x0f172a, 0.06);

    const aspect = container.clientWidth / container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    camera.position.set(0, 0.3, 7.5); // Starts zoomed out for entry Dolly transition

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // 2. Cinematic Lighting Environment
    const ambientLight = new THREE.AmbientLight(0x0f172a, 1.2);
    scene.add(ambientLight);

    // Warm Key Spotlight (Casts main shadow)
    const keySpot = new THREE.SpotLight(0xffb74d, 5.5);
    keySpot.position.set(4, 5, 4);
    keySpot.angle = Math.PI / 4;
    keySpot.penumbra = 0.8;
    keySpot.castShadow = true;
    keySpot.shadow.mapSize.width = 1024;
    keySpot.shadow.mapSize.height = 1024;
    scene.add(keySpot);

    // Dramatic Emerald Rim Light (Creates glowing edge profile)
    const rimLight = new THREE.DirectionalLight(0x10b981, 6.0);
    rimLight.position.set(-5, 3, -4);
    scene.add(rimLight);

    // Cyan Fill Light
    const fillLight = new THREE.PointLight(0x14b8a6, 2.5, 10);
    fillLight.position.set(0, -3, 3);
    scene.add(fillLight);

    // 3. Procedural Realistic PBR Apple Hero Object
    const fruitGroup = new THREE.Group();
    scene.add(fruitGroup);

    // Generate Procedural Fruit Texture with speckled pores & blushing gradient
    const texCanvas = document.createElement("canvas");
    texCanvas.width = 512;
    texCanvas.height = 512;
    const tctx = texCanvas.getContext("2d");
    if (tctx) {
      const grad = tctx.createLinearGradient(0, 0, 0, 512);
      grad.addColorStop(0, "#dc2626"); // Rich Crimson
      grad.addColorStop(0.45, "#ef4444"); // Bright Red
      grad.addColorStop(0.85, "#fbbf24"); // Golden Blush
      grad.addColorStop(1, "#15803d"); // Fresh Green Bottom
      tctx.fillStyle = grad;
      tctx.fillRect(0, 0, 512, 512);

      // Add organic speckles
      tctx.fillStyle = "rgba(254, 240, 138, 0.4)";
      for (let i = 0; i < 600; i++) {
        const rx = Math.random() * 512;
        const ry = Math.random() * 512;
        const rr = Math.random() * 1.5 + 0.5;
        tctx.beginPath();
        tctx.arc(rx, ry, rr, 0, Math.PI * 2);
        tctx.fill();
      }
    }
    const fruitTexture = new THREE.CanvasTexture(texCanvas);

    // Create Organic Apple Geometry (Sphere with deformed dimpled top & bottom)
    const sphereGeo = new THREE.SphereGeometry(1.25, 64, 64);
    const posAttr = sphereGeo.attributes.position;
    const vertex = new THREE.Vector3();

    for (let i = 0; i < posAttr.count; i++) {
      vertex.fromBufferAttribute(posAttr, i);
      const len = vertex.length();
      const nx = vertex.x / len;
      const ny = vertex.y / len;
      const nz = vertex.z / len;

      // Dimple top and bottom indentations
      if (ny > 0.6) {
        const factor = (ny - 0.6) / 0.4;
        vertex.y -= factor * 0.28;
        vertex.x *= 1 - factor * 0.12;
        vertex.z *= 1 - factor * 0.12;
      } else if (ny < -0.6) {
        const factor = (-ny - 0.6) / 0.4;
        vertex.y += factor * 0.22;
        vertex.x *= 1 - factor * 0.14;
        vertex.z *= 1 - factor * 0.14;
      }

      // Subtle organic asymmetry
      const noise = Math.sin(nx * 8) * Math.cos(nz * 8) * 0.03;
      vertex.addScaledVector(vertex, noise);

      posAttr.setXYZ(i, vertex.x, vertex.y, vertex.z);
    }
    sphereGeo.computeVertexNormals();

    // High Quality Physical PBR Material
    const appleMaterial = new THREE.MeshPhysicalMaterial({
      map: fruitTexture,
      roughness: 0.22,
      metalness: 0.02,
      clearcoat: 0.75,
      clearcoatRoughness: 0.12,
      sheen: 0.85,
      sheenColor: new THREE.Color(0x34d399),
      reflectivity: 0.9,
    });

    const appleMesh = new THREE.Mesh(sphereGeo, appleMaterial);
    appleMesh.castShadow = true;
    appleMesh.receiveShadow = true;
    fruitGroup.add(appleMesh);

    // Add Stem
    const stemGeo = new THREE.CylinderGeometry(0.04, 0.035, 0.5, 12);
    stemGeo.translate(0, 0.25, 0);
    const stemMat = new THREE.MeshStandardMaterial({
      color: 0x451a03,
      roughness: 0.8,
    });
    const stemMesh = new THREE.Mesh(stemGeo, stemMat);
    stemMesh.position.set(0, 1.1, 0);
    stemMesh.rotation.z = -0.15;
    fruitGroup.add(stemMesh);

    // Add Fresh Green Leaf
    const leafShape = new THREE.Shape();
    leafShape.moveTo(0, 0);
    leafShape.bezierCurveTo(0.2, 0.15, 0.35, 0.45, 0.1, 0.7);
    leafShape.bezierCurveTo(-0.1, 0.45, -0.15, 0.15, 0, 0);

    const leafGeo = new THREE.ShapeGeometry(leafShape);
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x15803d,
      roughness: 0.35,
      side: THREE.DoubleSide,
    });
    const leafMesh = new THREE.Mesh(leafGeo, leafMat);
    leafMesh.scale.set(0.7, 0.7, 0.7);
    leafMesh.position.set(0.02, 1.22, 0.02);
    leafMesh.rotation.set(0.4, 0.5, -0.6);
    fruitGroup.add(leafMesh);

    // 4. AI Holographic Quality Laser Scanner Ring
    const ringGeo = new THREE.TorusGeometry(1.65, 0.015, 16, 100);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      transparent: true,
      opacity: 0.45,
      wireframe: true,
    });
    const scanRing = new THREE.Mesh(ringGeo, ringMat);
    scanRing.rotation.x = Math.PI / 3;
    scanRing.rotation.y = Math.PI / 6;
    fruitGroup.add(scanRing);

    // 5. Atmospheric Floating Particle System
    const particleCount = 220;
    const particleGeo = new THREE.BufferGeometry();
    const particlePos = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePos[i] = (Math.random() - 0.5) * 12;
      particlePos[i + 1] = (Math.random() - 0.5) * 8;
      particlePos[i + 2] = (Math.random() - 0.5) * 10;
    }
    particleGeo.setAttribute("position", new THREE.BufferAttribute(particlePos, 3));

    const particleMat = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.05,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    const particleSystem = new THREE.Points(particleGeo, particleMat);
    scene.add(particleSystem);

    // 6. Interaction & Scroll State
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };

    let scrollProgress = 0;
    const handleScroll = () => {
      const heroHeight = container.clientHeight || window.innerHeight;
      scrollProgress = Math.min(1, Math.max(0, window.scrollY / heroHeight));
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    // 7. Animation Clock & Render Loop
    let clock = new THREE.Clock();
    let targetCamZ = 4.8; // Final Dolly distance

    const animate = () => {
      const elapsedTime = clock.getElapsedTime();

      // Smooth mouse lerp
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;

      if (!prefersReducedMotion) {
        // Initial Entry Dolly Zoom Transition
        camera.position.z += (targetCamZ - camera.position.z) * 0.03;

        // Floating Bobbing Motion
        fruitGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.12;

        // Slow Natural Rotation + Scroll Controlled Orbit
        fruitGroup.rotation.y = elapsedTime * 0.35 + scrollProgress * Math.PI * 1.5;
        fruitGroup.rotation.x = Math.cos(elapsedTime * 1.2) * 0.08 + mouseY * 0.25;
        fruitGroup.rotation.z = Math.sin(elapsedTime * 0.9) * 0.06 + mouseX * 0.25;

        // Laser Scan Ring Counter Rotation & Pulsing Opacity
        scanRing.rotation.z -= 0.008;
        ringMat.opacity = 0.35 + Math.sin(elapsedTime * 3) * 0.2;

        // Scroll Camera Pan & Orbit Dynamics
        camera.position.x = mouseX * 0.6 + Math.sin(scrollProgress * Math.PI) * 1.2;
        camera.position.y = 0.3 - mouseY * 0.4 - scrollProgress * 0.8;
        camera.lookAt(0, fruitGroup.position.y, 0);

        // Particle Drift
        particleSystem.rotation.y = elapsedTime * 0.04 + scrollProgress * 0.5;
        particleSystem.rotation.x = elapsedTime * 0.02;
      } else {
        camera.position.z = 4.8;
      }

      renderer.render(scene, camera);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);

      // Clean resources
      sphereGeo.dispose();
      appleMaterial.dispose();
      stemGeo.dispose();
      stemMat.dispose();
      leafGeo.dispose();
      leafMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      particleGeo.dispose();
      particleMat.dispose();
      fruitTexture.dispose();
      renderer.dispose();
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  );
}

export default Hero3DCanvas;
