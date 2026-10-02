"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroCrystalWorkbench() {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let width = container.clientWidth || 480;
    let height = container.clientHeight || 460;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100);
    camera.position.set(0, 0, 10.5);

    // 2. High-Performance WebGL Renderer
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: "high-performance",
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.35;
    container.appendChild(renderer.domElement);

    // 3. Ultra-Luminous Optical Materials (High-index refractive glass & chrome sheen)
    const obsidianCrystalMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x0e1d38),
      emissive: new THREE.Color(0x040814),
      metalness: 0.15,
      roughness: 0.06,
      transmission: 0.78,
      thickness: 1.8,
      ior: 1.64,
      reflectivity: 0.98,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      attenuationColor: new THREE.Color(0x38bdf8),
      attenuationDistance: 4.0,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xffffff),
    });

    const violetFacetMat = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(0x131538),
      emissive: new THREE.Color(0x050414),
      metalness: 0.25,
      roughness: 0.05,
      transmission: 0.72,
      thickness: 1.5,
      ior: 1.68,
      clearcoat: 1.0,
      clearcoatRoughness: 0.02,
      attenuationColor: new THREE.Color(0xa855f7),
      attenuationDistance: 4.5,
      specularIntensity: 1.0,
      specularColor: new THREE.Color(0xe0e7ff),
    });

    // Glowing Inner MCP Neural Core
    const innerCoreMaterial = new THREE.MeshStandardMaterial({
      color: new THREE.Color(0x38bdf8),
      emissive: new THREE.Color(0x0284c7),
      emissiveIntensity: 0.9,
      wireframe: true,
      transparent: true,
      opacity: 0.4,
    });

    const nodePointMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(0x67e8f9),
    });

    // Helper: Precision chamfered beveled slab
    function createBeveledSlab(w, h, depth, bevel) {
      const shape = new THREE.Shape();
      const hw = w / 2;
      const hh = h / 2;
      shape.moveTo(-hw, -hh);
      shape.lineTo(hw, -hh);
      shape.lineTo(hw, hh);
      shape.lineTo(-hw, hh);
      shape.closePath();

      return new THREE.ExtrudeGeometry(shape, {
        depth: depth,
        bevelEnabled: true,
        bevelSegments: 4,
        steps: 1,
        bevelSize: bevel,
        bevelThickness: bevel,
      });
    }

    // 4. Centered 3D Crystalline Prism Assembly
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // Inner Core Lattice
    const innerCoreGeo = new THREE.IcosahedronGeometry(1.0, 1);
    const innerCoreMesh = new THREE.Mesh(innerCoreGeo, innerCoreMaterial);
    mainGroup.add(innerCoreMesh);

    // Micro Protocol Nodes
    const nodePositions = innerCoreGeo.getAttribute("position");
    const nodeGeo = new THREE.SphereGeometry(0.038, 8, 8);
    const nodesGroup = new THREE.Group();
    for (let i = 0; i < nodePositions.count; i += 3) {
      const nm = new THREE.Mesh(nodeGeo, nodePointMaterial);
      nm.position.set(
        nodePositions.getX(i),
        nodePositions.getY(i),
        nodePositions.getZ(i)
      );
      nodesGroup.add(nm);
    }
    mainGroup.add(nodesGroup);

    // Fine Gyroscopic Caustic Rings
    const cyanRingGeo = new THREE.TorusGeometry(2.3, 0.014, 16, 120);
    const cyanRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.35,
    });
    const cyanRingMesh = new THREE.Mesh(cyanRingGeo, cyanRingMat);
    cyanRingMesh.rotation.x = Math.PI / 2.7;
    cyanRingMesh.rotation.y = Math.PI / 5.5;
    mainGroup.add(cyanRingMesh);

    const violetRingGeo = new THREE.TorusGeometry(2.7, 0.010, 16, 120);
    const violetRingMat = new THREE.MeshBasicMaterial({
      color: 0xa855f7,
      transparent: true,
      opacity: 0.28,
    });
    const violetRingMesh = new THREE.Mesh(violetRingGeo, violetRingMat);
    violetRingMesh.rotation.x = -Math.PI / 3.0;
    violetRingMesh.rotation.y = -Math.PI / 4.0;
    mainGroup.add(violetRingMesh);

    // Slabs Config: Scaled and centered inside viewport card
    const slabsConfig = [
      // 1. Front Slanted Main Prism
      {
        w: 2.2,
        h: 3.4,
        d: 0.24,
        b: 0.08,
        mat: obsidianCrystalMat,
        assembled: { pos: [0.4, 0.1, 0.8], rot: [-0.12, -0.28, 0.18] },
        disassembled: { pos: [1.3, 0.8, 1.5], rot: [-0.22, -0.42, 0.30] },
      },
      // 2. Top-Right Upper Facet
      {
        w: 1.8,
        h: 2.6,
        d: 0.20,
        b: 0.07,
        mat: violetFacetMat,
        assembled: { pos: [0.9, 1.3, -0.2], rot: [0.10, 0.25, -0.18] },
        disassembled: { pos: [1.8, 2.2, -0.5], rot: [0.20, 0.40, -0.28] },
      },
      // 3. Lower Foundation Plate
      {
        w: 2.0,
        h: 2.8,
        d: 0.22,
        b: 0.07,
        mat: obsidianCrystalMat,
        assembled: { pos: [0.3, -1.2, 0.6], rot: [0.22, -0.18, -0.24] },
        disassembled: { pos: [1.2, -2.1, 1.2], rot: [0.35, -0.28, -0.38] },
      },
      // 4. Center Precision Wedge (Light glint seam)
      {
        w: 1.4,
        h: 2.3,
        d: 0.18,
        b: 0.06,
        mat: violetFacetMat,
        assembled: { pos: [-0.8, -0.1, 1.0], rot: [-0.15, 0.15, 0.12] },
        disassembled: { pos: [-1.6, -0.6, 1.7], rot: [-0.28, 0.25, 0.22] },
      },
      // 5. Back Deep Monolith Plate
      {
        w: 2.4,
        h: 3.5,
        d: 0.25,
        b: 0.08,
        mat: obsidianCrystalMat,
        assembled: { pos: [-0.2, 0.1, -1.5], rot: [0.05, -0.10, 0.06] },
        disassembled: { pos: [0.3, -0.4, -2.5], rot: [0.12, -0.16, -0.08] },
      },
      // 6. Top Shard Crown
      {
        w: 1.3,
        h: 1.7,
        d: 0.15,
        b: 0.05,
        mat: violetFacetMat,
        assembled: { pos: [-0.4, 1.6, 0.3], rot: [-0.18, 0.15, 0.25] },
        disassembled: { pos: [-0.7, 2.7, 0.8], rot: [-0.32, 0.26, 0.42] },
      },
    ];

    const slabMeshes = slabsConfig.map((cfg) => {
      const geo = createBeveledSlab(cfg.w, cfg.h, cfg.d, cfg.b);
      const mesh = new THREE.Mesh(geo, cfg.mat);
      mainGroup.add(mesh);
      return { mesh, cfg };
    });

    // 5. Studio Lighting inside the Viewport Card
    const cyanLight = new THREE.PointLight(0x38bdf8, 200, 30);
    cyanLight.position.set(1.5, 1.5, 3.8);
    scene.add(cyanLight);

    const violetLight = new THREE.PointLight(0xa855f7, 160, 26);
    violetLight.position.set(-1.8, -1.2, 3.2);
    scene.add(violetLight);

    const specularWhiteLight = new THREE.PointLight(0xffffff, 180, 24);
    specularWhiteLight.position.set(0.2, 2.2, 3.5);
    scene.add(specularWhiteLight);

    const ambientLight = new THREE.AmbientLight(0x0f172a, 2.5);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xe0e7ff, 2.5);
    dirLight.position.set(-4, 6, 8);
    scene.add(dirLight);

    // 6. Calm Mouse Parallax & Scroll Tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let currentScrollProgress = 0;
    let targetScrollProgress = 0;

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      const normX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const normY = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetMouseX = Math.max(Math.min(normX, 1), -1) * 0.2;
      targetMouseY = Math.max(Math.min(normY, 1), -1) * 0.15;
    };

    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      targetScrollProgress = Math.min(Math.max(scrollY / 450, 0), 1);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("scroll", handleScroll, { passive: true });

    const handleResize = () => {
      if (!container) return;
      width = container.clientWidth || 480;
      height = container.clientHeight || 460;
      camera.aspect = width / height;

      if (width < 400) {
        camera.position.z = 12.0;
        mainGroup.scale.set(0.85, 0.85, 0.85);
      } else {
        camera.position.z = 10.5;
        mainGroup.scale.set(1.0, 1.0, 1.0);
      }

      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    // 7. Meditative 60 FPS Render Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Smooth damping
      mouseX += (targetMouseX - mouseX) * 0.04;
      mouseY += (targetMouseY - mouseY) * 0.04;
      currentScrollProgress += (targetScrollProgress - currentScrollProgress) * 0.06;

      // Group rotation & gentle floating hover
      mainGroup.rotation.y = mouseX * 0.35 + Math.sin(elapsedTime * 0.16) * 0.03;
      mainGroup.rotation.x = -mouseY * 0.25 + Math.cos(elapsedTime * 0.14) * 0.02;
      mainGroup.position.y = Math.sin(elapsedTime * 0.4) * 0.08;

      // Subtle gyroscopic ring rotation
      cyanRingMesh.rotation.z = elapsedTime * 0.09;
      violetRingMesh.rotation.z = -elapsedTime * 0.07;

      // Inner core pulse
      const corePulse = 1.0 + Math.sin(elapsedTime * 0.8) * 0.02;
      innerCoreMesh.scale.set(corePulse, corePulse, corePulse);
      innerCoreMesh.rotation.y = elapsedTime * 0.08;

      // Slow specular light sweep across crystal faces
      cyanLight.position.x = 1.5 + Math.sin(elapsedTime * 0.35) * 1.5;
      cyanLight.position.y = 1.5 + Math.cos(elapsedTime * 0.30) * 1.0;

      violetLight.position.x = -1.8 + Math.cos(elapsedTime * 0.28) * 1.3;
      violetLight.position.y = -1.2 + Math.sin(elapsedTime * 0.32) * 0.9;

      // Controlled Disassemble on Scroll
      const p = currentScrollProgress;
      const easeP = p * p * (3 - 2 * p); // smoothstep

      slabMeshes.forEach(({ mesh, cfg }, i) => {
        const as = cfg.assembled;
        const dis = cfg.disassembled;

        mesh.position.x = as.pos[0] + (dis.pos[0] - as.pos[0]) * easeP;
        mesh.position.y = as.pos[1] + (dis.pos[1] - as.pos[1]) * easeP + Math.sin(elapsedTime * 0.6 + i) * 0.02;
        mesh.position.z = as.pos[2] + (dis.pos[2] - as.pos[2]) * easeP;

        mesh.rotation.x = as.rot[0] + (dis.rot[0] - as.rot[0]) * easeP;
        mesh.rotation.y = as.rot[1] + (dis.rot[1] - as.rot[1]) * easeP;
        mesh.rotation.z = as.rot[2] + (dis.rot[2] - as.rot[2]) * easeP;
      });

      renderer.render(scene, camera);
    };

    animate();

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);

      slabMeshes.forEach(({ mesh }) => {
        if (mesh.geometry) mesh.geometry.dispose();
      });
      innerCoreGeo.dispose();
      innerCoreMaterial.dispose();
      nodeGeo.dispose();
      nodePointMaterial.dispose();
      cyanRingGeo.dispose();
      cyanRingMat.dispose();
      violetRingGeo.dispose();
      violetRingMat.dispose();
      obsidianCrystalMat.dispose();
      violetFacetMat.dispose();

      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="w-full h-full relative"
      aria-hidden="true"
    />
  );
}
