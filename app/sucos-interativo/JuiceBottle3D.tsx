"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

type Juice3DProps = { flavor: string; color: string; label: string };

export default function JuiceBottle3D({ flavor, color, label }: Juice3DProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const flavorRef = useRef(flavor);
  const colorRef = useRef(color);
  const labelRef = useRef(label);
  useEffect(() => { flavorRef.current = flavor; colorRef.current = color; labelRef.current = label; }, [flavor, color, label]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch { return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.75));
    renderer.setSize(host.clientWidth, host.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.3;
    renderer.domElement.setAttribute("aria-label", "Garrafa 3D interativa. Arraste com o mouse ou dedo para girar.");
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.touchAction = "pan-y";
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, host.clientWidth / host.clientHeight, 0.1, 100);
    camera.position.set(0, 0.25, 7.6);
    const group = new THREE.Group();
    scene.add(group);

    scene.add(new THREE.HemisphereLight(0xf5f2e9, 0x151b12, 2.0));
    const key = new THREE.DirectionalLight(0xffe0b8, 3.2); key.position.set(3, 4, 5); scene.add(key);
    const rim = new THREE.DirectionalLight(0x9cab63, 3.8); rim.position.set(-4, 1, -3); scene.add(rim);
    const front = new THREE.PointLight(0xfff1d8, 9, 12); front.position.set(0, 1, 4); scene.add(front);

    const glass = new THREE.MeshPhysicalMaterial({ color: 0xf8f4e9, roughness: 0.12, metalness: 0, transmission: 0, transparent: true, opacity: 0.075, clearcoat: 1, clearcoatRoughness: 0.035, side: THREE.DoubleSide, depthWrite: false });
    const juice = new THREE.MeshStandardMaterial({ color: colorRef.current, roughness: 0.24, metalness: 0, transparent: false, emissive: new THREE.Color(colorRef.current), emissiveIntensity: 0.08 });
    const dark = new THREE.MeshStandardMaterial({ color: 0x161914, roughness: 0.26, metalness: 0.35 });
    const orange = new THREE.MeshStandardMaterial({ color: 0xef7d18, roughness: 0.3, metalness: 0.1 });
    const green = new THREE.MeshStandardMaterial({ color: 0xa7b86a, roughness: 0.35 });

    const makeLathe = (points: [number, number][], material: THREE.Material, segments = 64) => {
      const mesh = new THREE.Mesh(new THREE.LatheGeometry(points.map(([x,y]) => new THREE.Vector2(x,y)), segments), material);
      group.add(mesh); return mesh;
    };
    // A sculpted bottle silhouette, built from real 3D geometry.
    makeLathe([[0, -1.72],[0.39,-1.72],[0.44,-1.65],[0.45,-1.35],[0.44,-0.75],[0.43,0.25],[0.39,0.65],[0.31,0.9],[0.2,1.08],[0.18,1.25],[0.18,1.38],[0.22,1.4],[0.22,1.49],[0,1.49]], glass);
    makeLathe([[0,-1.62],[0.36,-1.62],[0.38,-1.35],[0.37,-0.75],[0.36,0.2],[0.32,0.62],[0.23,0.86],[0.12,1.02],[0.12,1.2],[0,1.2]], juice);
    makeLathe([[0,1.25],[0.205,1.25],[0.21,1.48],[0.19,1.52],[0,1.52]], dark);
    // Cap ridges.
    for (let i=0;i<20;i++) {
      const a = (i/20)*Math.PI*2;
      const ridge = new THREE.Mesh(new THREE.BoxGeometry(0.018,0.19,0.018), orange);
      ridge.position.set(Math.sin(a)*0.207,1.385,Math.cos(a)*0.207);
      ridge.rotation.y = a; group.add(ridge);
    }
    // Label is a real texture mapped onto a curved cylinder.
    const canvas = document.createElement("canvas"); canvas.width = 768; canvas.height = 768;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#050605"; ctx.fillRect(0,0,768,768);
      ctx.fillStyle = "#a7b86a"; ctx.fillRect(0,0,768,22);
      ctx.fillStyle = "#ef7d18"; ctx.fillRect(0,730,768,38);
      ctx.textAlign = "center";
      // Label typography is centered in the visible front arc of the bottle.
      ctx.fillStyle = "#a7b86a"; ctx.font = "900 46px Arial"; ctx.fillText("NUTRI",384,112,250);
      ctx.fillStyle = "#ef7d18"; ctx.font = "900 46px Arial"; ctx.fillText("FIT",384,176,220);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 20px Arial"; ctx.fillText("SUCO NATURAL",384,236,250);
      ctx.fillStyle = "#ef7d18"; ctx.font = "900 36px Arial"; ctx.fillText(flavorRef.current.toUpperCase().slice(0,14),384,360,250);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 16px Arial"; ctx.fillText(labelRef.current.toUpperCase(),384,414,250);
      ctx.strokeStyle = "#a7b86a"; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(384,545,35,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle = "#a7b86a"; ctx.font = "bold 16px Arial"; ctx.fillText("NATURAL",384,552,160);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 20px Arial"; ctx.fillText("500 ml",384,630,180);
    }
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const labelMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide, toneMapped: false });
    const labelMesh = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.74), labelMaterial);
    labelMesh.position.set(0, -0.16, 0.455); group.add(labelMesh);

    // Stylized 3D juice splash: curved liquid ribbons and droplets behind the bottle.
    const splashGroup = new THREE.Group();
    splashGroup.position.set(0, 0.05, -0.48);
    group.add(splashGroup);
    const splashMaterial = new THREE.MeshPhysicalMaterial({
      color: colorRef.current, roughness: 0.16, metalness: 0.02,
      clearcoat: 1, clearcoatRoughness: 0.04, emissive: new THREE.Color(colorRef.current),
      emissiveIntensity: 0.12, transparent: true, opacity: 0.82
    });
    const splashPoints = [
      [[-0.82,-0.18],[-1.02,0.12],[-0.88,0.48],[-0.58,0.68],[-0.22,0.72]],
      [[0.42,0.62],[0.76,0.44],[0.94,0.12],[0.86,-0.22],[0.62,-0.42]],
      [[-0.68,-0.54],[-0.38,-0.72],[0.02,-0.75],[0.34,-0.62]]
    ];
    splashPoints.forEach((coords, idx) => {
      const curve = new THREE.CatmullRomCurve3(coords.map(([x,y]) => new THREE.Vector3(x,y,-0.02 + idx*0.015)));
      const ribbon = new THREE.Mesh(new THREE.TubeGeometry(curve, 48, idx===1?0.055:0.035, 8, false), splashMaterial);
      splashGroup.add(ribbon);
    });
    const droplets: THREE.Mesh[] = [];
    const dropletSpecs = [
      [-1.02,0.64,0.02,0.075],[-0.76,0.92,0.01,0.045],[-0.35,0.83,0.03,0.055],
      [0.8,0.88,0.01,0.06],[1.05,0.48,0.02,0.045],[1.0,-0.02,0.03,0.07],
      [0.56,-0.72,0.02,0.05],[-0.84,-0.78,0.02,0.045],[-1.12,-0.12,0.01,0.04]
    ];
    dropletSpecs.forEach(([x,y,z,r], i) => {
      const drop = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), splashMaterial);
      drop.position.set(x,y,z);
      drop.scale.set(0.82,1.18,0.72);
      drop.userData.baseY = y;
      drop.userData.phase = i*0.73;
      splashGroup.add(drop); droplets.push(drop);
    });

    // Bottle shoulder/collar accents and bottom glass ring.
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.405,0.018,12,64), green); ring.rotation.x=Math.PI/2; ring.position.y=-1.64; group.add(ring);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(2.1,64), new THREE.MeshBasicMaterial({ color:0x0b0e09, transparent:true, opacity:0.7 }));
    floor.rotation.x=-Math.PI/2; floor.position.y=-1.95; scene.add(floor);

    let targetX=0, targetY=0, dragging=false, lastX=0, lastY=0, pointerId:number|null=null;
    const down=(e:PointerEvent)=>{ dragging=true; pointerId=e.pointerId; lastX=e.clientX; lastY=e.clientY; renderer.domElement.setPointerCapture?.(e.pointerId); };
    const move=(e:PointerEvent)=>{ if(!dragging || (pointerId!==null && e.pointerId!==pointerId)) return; targetY+=(e.clientX-lastX)*0.012; targetX+=(e.clientY-lastY)*0.008; targetX=Math.max(-0.38,Math.min(0.38,targetX)); lastX=e.clientX; lastY=e.clientY; };
    const up=()=>{dragging=false; pointerId=null;};
    renderer.domElement.addEventListener("pointerdown",down); renderer.domElement.addEventListener("pointermove",move); renderer.domElement.addEventListener("pointerup",up); renderer.domElement.addEventListener("pointercancel",up); renderer.domElement.addEventListener("pointerleave",up);

    const resize=()=>{ if(!host) return; camera.aspect=host.clientWidth/host.clientHeight; camera.updateProjectionMatrix(); renderer.setSize(host.clientWidth,host.clientHeight); };
    const observer=new ResizeObserver(resize); observer.observe(host);
    let frame=0;
    const animate=()=>{ frame=requestAnimationFrame(animate); if(!dragging) targetY+=0.0025; group.rotation.y+=(targetY-group.rotation.y)*0.08; group.rotation.x+=(targetX-group.rotation.x)*0.08; group.position.y=Math.sin(performance.now()*0.0008)*0.035; const t=performance.now()*0.001; splashGroup.rotation.z=Math.sin(t*0.7)*0.035; droplets.forEach((drop)=>{drop.position.y=drop.userData.baseY+Math.sin(t*1.4+drop.userData.phase)*0.035;}); renderer.render(scene,camera); };
    animate();

    return ()=>{ cancelAnimationFrame(frame); observer.disconnect(); renderer.domElement.removeEventListener("pointerdown",down); renderer.domElement.removeEventListener("pointermove",move); renderer.domElement.removeEventListener("pointerup",up); renderer.domElement.removeEventListener("pointercancel",up); renderer.domElement.removeEventListener("pointerleave",up); scene.traverse(obj=>{ if(obj instanceof THREE.Mesh){obj.geometry.dispose(); const mats=Array.isArray(obj.material)?obj.material:[obj.material]; mats.forEach(m=>{ if("map" in m && m.map) (m.map as THREE.Texture).dispose(); m.dispose(); });}}); renderer.dispose(); renderer.domElement.remove(); };
  }, []);

  useEffect(() => {
    const host=hostRef.current;
    if(!host) return;
    const canvas=host.querySelector("canvas");
    if(canvas) canvas.setAttribute("aria-label", `Garrafa 3D Nutrifit ${flavor}. Arraste para girar.`);
  }, [flavor]);

  return <div ref={hostRef} className="h-[320px] w-full cursor-grab select-none active:cursor-grabbing sm:h-[450px]" role="img" aria-label={`Garrafa 3D de suco Nutrifit sabor ${flavor}, ${label}`} />;
}
