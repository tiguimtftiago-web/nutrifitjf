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
    const front = new THREE.PointLight(0xff7a20, 28, 12); front.position.set(0, 1, 4); scene.add(front);

    const glass = new THREE.MeshPhysicalMaterial({ color: 0xf2f0e7, roughness: 0.12, metalness: 0.02, transmission: 0.04, thickness: 0.18, transparent: true, opacity: 0.98, clearcoat: 1, clearcoatRoughness: 0.08 });
    const juice = new THREE.MeshPhysicalMaterial({ color: colorRef.current, roughness: 0.28, metalness: 0, clearcoat: 0.6, clearcoatRoughness: 0.14 });
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
      ctx.fillStyle = "#080a07"; ctx.fillRect(0,0,768,768);
      ctx.fillStyle = "#a7b86a"; ctx.fillRect(0,0,768,22);
      ctx.fillStyle = "#ef7d18"; ctx.fillRect(0,730,768,38);
      ctx.textAlign = "center";
      ctx.fillStyle = "#a7b86a"; ctx.font = "900 78px Arial"; ctx.fillText("NUTRI",384,118); ctx.fillStyle = "#ef7d18"; ctx.fillText("FIT",516,118);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 34px Arial"; ctx.fillText("SUCO NATURAL",384,180);
      ctx.fillStyle = "#ef7d18"; ctx.font = "900 76px Arial"; ctx.fillText(flavorRef.current.toUpperCase(),384,365);
      ctx.fillStyle = "#ffffff"; ctx.font = "bold 28px Arial"; ctx.fillText(labelRef.current.toUpperCase(),384,430);
      ctx.strokeStyle = "#a7b86a"; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(384,570,62,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle = "#a7b86a"; ctx.font = "bold 30px Arial"; ctx.fillText("NATURAL",384,562); ctx.fillStyle = "#ffffff"; ctx.font = "bold 27px Arial"; ctx.fillText("500 ml",384,600);
    }
    const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace;
    const labelMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.444,0.444,0.92,64,1,true), new THREE.MeshStandardMaterial({ map:texture, roughness:0.38, metalness:0.03, side:THREE.DoubleSide }));
    labelMesh.position.y = -0.12; group.add(labelMesh);

    // Bottle shoulder/collar accents and bottom glass ring.
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.405,0.025,12,64), green); ring.rotation.x=Math.PI/2; ring.position.y=-1.64; group.add(ring);
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
    const animate=()=>{ frame=requestAnimationFrame(animate); if(!dragging) targetY+=0.0025; group.rotation.y+=(targetY-group.rotation.y)*0.08; group.rotation.x+=(targetX-group.rotation.x)*0.08; group.position.y=Math.sin(performance.now()*0.0008)*0.035; renderer.render(scene,camera); };
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
