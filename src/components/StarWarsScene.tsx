'use client'

import { useRef, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

/* ═══════════════════════════════════════════════════════════════════
   ANIMATION STATE — GSAP tweens this, useFrame reads it every frame
   ═══════════════════════════════════════════════════════════════════ */

export interface AnimState {
  // per-chapter visibility (0→1 fade)
  ch1:number; ch2:number; ch3:number; ch4:number; ch5:number
  // Vaporator
  vapSpread:number; vapRotY:number; vapY:number
  // Lightsaber
  saberSpread:number; saberRotY:number; saberY:number; bladeLen:number
  // Red blade
  redScale:number; redX:number
  // Cybernetic hand
  handSpread:number; handRotY:number; handY:number
  // R2-D2
  r2Scale:number; r2RotY:number; r2Y:number
  // Yoda
  yodaScale:number; yodaY:number
  // Data nodes
  nodesScale:number
  // Camera
  camY:number; camZ:number
}

export const INIT_ANIM: AnimState = {
  ch1:1, ch2:0, ch3:0, ch4:0, ch5:0,
  vapSpread:1.0, vapRotY:0, vapY:0,
  saberSpread:1.5, saberRotY:0, saberY:8, bladeLen:0,
  redScale:0, redX:5,
  handSpread:1.2, handRotY:0, handY:8,
  r2Scale:0, r2RotY:0, r2Y:-6,
  yodaScale:0, yodaY:5,
  nodesScale:0,
  camY:0.5, camZ:7,
}

/* ═══════════════════════════════════════════════════════════════════
   PALETTE
   ═══════════════════════════════════════════════════════════════════ */
const CYAN  = '#00d4ee'
const DIM   = '#0d3040'
const AMBER = '#ee9922'
const RED   = '#ee2244'
const GREEN = '#33dd66'

/* ═══════════════════════════════════════════════════════════════════
   HELPER — callback ref builder
   ═══════════════════════════════════════════════════════════════════ */
type Refs = Record<string, THREE.Object3D>
const usePartRefs = () => {
  const r = useRef<Refs>({})
  const set = (k:string) => (el:THREE.Object3D|null) => { if(el) r.current[k]=el }
  return { parts: r, set }
}

/* ═══════════════════════════════════════════════════════════════════
   ATMOSPHERIC — floating dust particles
   ═══════════════════════════════════════════════════════════════════ */
function Particles() {
  const COUNT = 120
  const mesh = useRef<THREE.InstancedMesh>(null!)
  const dummy = useMemo(()=>new THREE.Object3D(),[])
  const data = useMemo(()=>{
    return Array.from({length:COUNT},(_,i)=>({
      x:(Math.random()-0.5)*14,
      y:(Math.random()-0.5)*10,
      z:(Math.random()-0.5)*10,
      speed:0.1+Math.random()*0.3,
      phase:Math.random()*Math.PI*2,
      size:0.008+Math.random()*0.015,
    }))
  },[])

  useFrame(({clock})=>{
    const t=clock.getElapsedTime()
    data.forEach((p,i)=>{
      dummy.position.set(
        p.x+Math.sin(t*p.speed+p.phase)*0.5,
        p.y+Math.cos(t*p.speed*0.7+p.phase)*0.3,
        p.z+Math.sin(t*p.speed*0.5)*0.4
      )
      dummy.scale.setScalar(p.size)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i,dummy.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate=true
  })

  return(
    <instancedMesh ref={mesh} args={[undefined,undefined,COUNT]}>
      <sphereGeometry args={[1,4,4]}/>
      <meshBasicMaterial color={CYAN} transparent opacity={0.3}/>
    </instancedMesh>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   GRID FLOOR — subtle technical reference
   ═══════════════════════════════════════════════════════════════════ */
function GridFloor() {
  return(
    <group position={[0,-3.5,0]} rotation={[-Math.PI/2,0,0]}>
      <gridHelper args={[30,60,'#0a2530','#060e14']} rotation={[Math.PI/2,0,0]}/>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   1. MOISTURE VAPORATOR — Tatooine homestead
   ═══════════════════════════════════════════════════════════════════ */
function Vaporator({animState}:{animState:React.RefObject<AnimState>}) {
  const {parts:r,set}=usePartRefs()

  useFrame(({clock})=>{
    const a=animState.current; if(!a) return
    const s=a.vapSpread, t=clock.getElapsedTime()

    // Exploded offsets — each part drifts outward by spread multiplier
    if(r.current.col)     r.current.col.position.y=0
    if(r.current.topDish) r.current.topDish.position.y=1.6+s*0.7
    if(r.current.topDish) r.current.topDish.rotation.y=t*0.5
    if(r.current.midRing1)r.current.midRing1.position.y=0.6+s*0.3
    if(r.current.midRing2)r.current.midRing2.position.y=-0.2+s*(-0.2)
    if(r.current.base)    r.current.base.position.y=-1.5-s*0.4
    if(r.current.ant1)    r.current.ant1.position.set(0.08,2.2+s*0.9,0)
    if(r.current.ant2)    r.current.ant2.position.set(-0.06,2.6+s*1.1,0)
    if(r.current.pipe1)   r.current.pipe1.position.set(0.5+s*0.3,0.3+s*0.1,0)
    if(r.current.pipe2)   r.current.pipe2.position.set(-0.45-s*0.25,-0.1-s*0.1,0.1)
    if(r.current.pipe3)   r.current.pipe3.position.set(0.3+s*0.15,-0.8-s*0.2,-0.15)
    if(r.current.node1)   r.current.node1.position.set(0.7+s*0.4,1.0+s*0.2,0.2)
    if(r.current.node2)   r.current.node2.position.set(-0.6-s*0.3,1.2+s*0.3,-0.1)
    if(r.current.node3)   r.current.node3.position.set(0.1,0.9+s*0.5,0.5+s*0.2)
    if(r.current.strut1)  r.current.strut1.position.set(0.25+s*0.12,0.5+s*0.15,0.2)
    if(r.current.strut2)  r.current.strut2.position.set(-0.2-s*0.1,-0.5-s*0.1,-0.2)
    if(r.current.panel1)  r.current.panel1.position.set(0.18,0.1+s*0.05,0.16)
    if(r.current.panel2)  r.current.panel2.position.set(-0.16,-0.4-s*0.05,0.14)
  })

  return(
    <group>
      {/* Central column */}
      <mesh ref={set('col')}><cylinderGeometry args={[0.12,0.16,3.0,8]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.6}/></mesh>
      {/* Inner column */}
      <mesh ref={set('col2')} position={[0,0.2,0]}><cylinderGeometry args={[0.07,0.07,2.4,6]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.25}/></mesh>
      {/* Top collection dish */}
      <mesh ref={set('topDish')}><torusGeometry args={[0.75,0.04,8,28]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.5}/></mesh>
      {/* Mid ring 1 */}
      <mesh ref={set('midRing1')}><torusGeometry args={[0.40,0.03,6,20]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.35}/></mesh>
      {/* Mid ring 2 */}
      <mesh ref={set('midRing2')}><torusGeometry args={[0.30,0.025,6,16]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.3}/></mesh>
      {/* Base */}
      <mesh ref={set('base')}><cylinderGeometry args={[0.55,0.65,0.25,8]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.4}/></mesh>
      {/* Base ring */}
      <mesh ref={set('baseRing')} position={[0,-1.6,0]}><torusGeometry args={[0.60,0.02,6,20]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.2}/></mesh>
      {/* Antenna 1 */}
      <mesh ref={set('ant1')}><cylinderGeometry args={[0.015,0.015,1.0,4]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.5}/></mesh>
      {/* Antenna 2 — shorter */}
      <mesh ref={set('ant2')}><cylinderGeometry args={[0.01,0.01,0.6,4]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.4}/></mesh>
      {/* Antenna tip */}
      <mesh ref={set('antTip')} position={[0.08,2.9,0]}><sphereGeometry args={[0.03,6,6]}/><meshBasicMaterial wireframe color={AMBER} transparent opacity={0.8}/></mesh>
      {/* Side pipes */}
      <mesh ref={set('pipe1')} rotation={[0,0,0.35]}><cylinderGeometry args={[0.035,0.035,1.3,6]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.3}/></mesh>
      <mesh ref={set('pipe2')} rotation={[0.1,0,-0.3]}><cylinderGeometry args={[0.03,0.03,1.0,6]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.25}/></mesh>
      <mesh ref={set('pipe3')} rotation={[0.2,0,0.15]}><cylinderGeometry args={[0.025,0.025,0.8,6]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.2}/></mesh>
      {/* Collector nodes — amber accents */}
      <mesh ref={set('node1')}><sphereGeometry args={[0.07,6,6]}/><meshBasicMaterial wireframe color={AMBER} transparent opacity={0.7}/></mesh>
      <mesh ref={set('node2')}><sphereGeometry args={[0.055,6,6]}/><meshBasicMaterial wireframe color={AMBER} transparent opacity={0.6}/></mesh>
      <mesh ref={set('node3')}><octahedronGeometry args={[0.05]}/><meshBasicMaterial wireframe color={AMBER} transparent opacity={0.5}/></mesh>
      {/* Structural struts */}
      <mesh ref={set('strut1')} rotation={[0.4,0,0.2]}><cylinderGeometry args={[0.02,0.02,0.5,4]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.2}/></mesh>
      <mesh ref={set('strut2')} rotation={[-0.3,0,-0.15]}><cylinderGeometry args={[0.018,0.018,0.6,4]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.18}/></mesh>
      {/* Surface panels */}
      <mesh ref={set('panel1')}><boxGeometry args={[0.08,0.12,0.01]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.2}/></mesh>
      <mesh ref={set('panel2')}><boxGeometry args={[0.10,0.08,0.01]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.15}/></mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   2. LIGHTSABER — Dagobah training (exploded view)
   ═══════════════════════════════════════════════════════════════════ */
function LightsaberAssembly({animState}:{animState:React.RefObject<AnimState>}) {
  const {parts:r,set}=usePartRefs()

  useFrame(({clock})=>{
    const a=animState.current; if(!a) return
    const s=a.saberSpread, bl=a.bladeLen, t=clock.getElapsedTime()

    if(r.current.emitter)  r.current.emitter.position.y=0.85+s*0.5
    if(r.current.emRing)   r.current.emRing.position.y=0.75+s*0.45
    if(r.current.upperG)   r.current.upperG.position.y=0.4+s*0.25
    if(r.current.actBox)   r.current.actBox.position.set(0.15,0.4+s*0.25,0)
    if(r.current.actBtn)   r.current.actBtn.position.set(0.19,0.4+s*0.25,0)
    if(r.current.midSec)   r.current.midSec.position.y=0.0
    if(r.current.midRing1) r.current.midRing1.position.y=0.15+s*0.08
    if(r.current.midRing2) r.current.midRing2.position.y=-0.15-s*0.08
    if(r.current.lowerG)   r.current.lowerG.position.y=-0.35-s*0.2
    if(r.current.pommel)   r.current.pommel.position.y=-0.6-s*0.35
    if(r.current.pomRing)  r.current.pomRing.position.y=-0.55-s*0.3
    if(r.current.crystal)  { r.current.crystal.position.set(s*0.5,0.2+s*0.7,s*0.3); r.current.crystal.rotation.y=t*1.5; r.current.crystal.rotation.z=t*0.8 }
    if(r.current.cell)     r.current.cell.position.set(-s*0.4,-0.1-s*0.3,s*0.2)
    if(r.current.cellCap1) r.current.cellCap1.position.set(-s*0.4,-0.22-s*0.35,s*0.2)
    if(r.current.cellCap2) r.current.cellCap2.position.set(-s*0.4,0.02-s*0.25,s*0.2)
    if(r.current.lens)     r.current.lens.position.y=0.65+s*0.55
    if(r.current.wire1)    r.current.wire1.position.set(s*0.2,0.3+s*0.15,-s*0.15)
    if(r.current.wire2)    r.current.wire2.position.set(-s*0.15,-0.2-s*0.1,s*0.1)
    // Blade
    if(r.current.blade)    { r.current.blade.scale.y=bl; r.current.blade.position.y=1.1+bl*0.5; r.current.blade.visible=bl>0.01 }
    if(r.current.bladeCore){ r.current.bladeCore.scale.y=bl; r.current.bladeCore.position.y=1.1+bl*0.5; r.current.bladeCore.visible=bl>0.01 }
  })

  return(
    <group rotation={[0,0,Math.PI/8]}>
      {/* Emitter shroud */}
      <mesh ref={set('emitter')}><cylinderGeometry args={[0.13,0.17,0.28,8]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.65}/></mesh>
      {/* Emitter ring */}
      <mesh ref={set('emRing')}><torusGeometry args={[0.14,0.012,6,16]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.4}/></mesh>
      {/* Upper grip */}
      <mesh ref={set('upperG')}><cylinderGeometry args={[0.095,0.10,0.38,8]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.55}/></mesh>
      {/* Activation box */}
      <mesh ref={set('actBox')}><boxGeometry args={[0.06,0.10,0.05]}/><meshBasicMaterial wireframe color={AMBER} transparent opacity={0.7}/></mesh>
      {/* Activation button */}
      <mesh ref={set('actBtn')}><sphereGeometry args={[0.015,6,6]}/><meshBasicMaterial color={RED} transparent opacity={0.9}/></mesh>
      {/* Mid section */}
      <mesh ref={set('midSec')}><cylinderGeometry args={[0.10,0.10,0.22,10]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.5}/></mesh>
      {/* Mid grip rings */}
      <mesh ref={set('midRing1')}><torusGeometry args={[0.11,0.010,6,14]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.35}/></mesh>
      <mesh ref={set('midRing2')}><torusGeometry args={[0.11,0.010,6,14]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.35}/></mesh>
      {/* Lower grip — textured */}
      <mesh ref={set('lowerG')}><cylinderGeometry args={[0.105,0.09,0.35,8]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.5}/></mesh>
      {/* Pommel */}
      <mesh ref={set('pommel')}><sphereGeometry args={[0.09,8,8]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.4}/></mesh>
      {/* Pommel ring */}
      <mesh ref={set('pomRing')}><torusGeometry args={[0.10,0.008,6,12]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.25}/></mesh>
      {/* Kyber crystal — the heart, glows amber */}
      <mesh ref={set('crystal')}><octahedronGeometry args={[0.10]}/><meshBasicMaterial wireframe color={AMBER} transparent opacity={0.95}/></mesh>
      {/* Power cell */}
      <mesh ref={set('cell')}><cylinderGeometry args={[0.045,0.045,0.20,6]}/><meshBasicMaterial wireframe color={AMBER} transparent opacity={0.5}/></mesh>
      <mesh ref={set('cellCap1')}><cylinderGeometry args={[0.05,0.05,0.03,6]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.3}/></mesh>
      <mesh ref={set('cellCap2')}><cylinderGeometry args={[0.05,0.05,0.03,6]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.3}/></mesh>
      {/* Focus lens */}
      <mesh ref={set('lens')}><torusGeometry args={[0.08,0.012,6,12]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.4}/></mesh>
      {/* Internal wiring */}
      <mesh ref={set('wire1')} rotation={[0.5,0,0.2]}><cylinderGeometry args={[0.008,0.008,0.4,4]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.2}/></mesh>
      <mesh ref={set('wire2')} rotation={[-0.3,0,-0.1]}><cylinderGeometry args={[0.008,0.008,0.3,4]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.2}/></mesh>
      {/* Blade — outer glow */}
      <mesh ref={set('blade')} visible={false}><cylinderGeometry args={[0.04,0.03,1,6]}/><meshBasicMaterial color={CYAN} transparent opacity={0.4}/></mesh>
      {/* Blade — inner core */}
      <mesh ref={set('bladeCore')} visible={false}><cylinderGeometry args={[0.015,0.012,1,4]}/><meshBasicMaterial color={'#ffffff'} transparent opacity={0.9}/></mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   RED BLADE — Vader's weapon for the clash
   ═══════════════════════════════════════════════════════════════════ */
function RedBlade() {
  return(
    <group rotation={[0,0,-Math.PI/7]}>
      <mesh><cylinderGeometry args={[0.11,0.13,0.55,8]}/><meshBasicMaterial wireframe color={RED} transparent opacity={0.5}/></mesh>
      <mesh position={[0,-0.35,0]}><sphereGeometry args={[0.12,6,6]}/><meshBasicMaterial wireframe color={RED} transparent opacity={0.3}/></mesh>
      <mesh position={[0,1.5,0]}><cylinderGeometry args={[0.035,0.03,2.5,6]}/><meshBasicMaterial color={RED} transparent opacity={0.8}/></mesh>
      <mesh position={[0,1.5,0]}><cylinderGeometry args={[0.015,0.012,2.5,4]}/><meshBasicMaterial color={'#ff8888'} transparent opacity={0.95}/></mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   3. CYBERNETIC HAND — Bespin rebuild
   ═══════════════════════════════════════════════════════════════════ */
function CyberHand({animState}:{animState:React.RefObject<AnimState>}) {
  const {parts:r,set}=usePartRefs()

  const fingerData = useMemo(()=>[
    {name:'f0',bx:-0.14,by:0.35,segs:3},
    {name:'f1',bx:-0.07,by:0.40,segs:3},
    {name:'f2',bx: 0.00,by:0.42,segs:3},
    {name:'f3',bx: 0.07,by:0.38,segs:3},
    {name:'f4',bx: 0.18,by:0.22,segs:2}, // thumb
  ],[])

  useFrame(({clock})=>{
    const a=animState.current; if(!a) return
    const s=a.handSpread, t=clock.getElapsedTime()

    if(r.current.palm)    r.current.palm.position.y=s*0.05
    if(r.current.palmIn)  r.current.palmIn.position.y=s*0.05
    if(r.current.wrist)   r.current.wrist.position.y=-0.25-s*0.2
    if(r.current.wristR)  r.current.wristR.position.y=-0.20-s*0.18
    if(r.current.forearm) r.current.forearm.position.y=-0.55-s*0.45
    if(r.current.foreIn)  r.current.foreIn.position.y=-0.55-s*0.45

    fingerData.forEach((fd,fi)=>{
      for(let si=0;si<fd.segs;si++){
        const k=`${fd.name}_${si}`
        const jk=`${fd.name}_j${si}`
        if(r.current[k]){
          r.current[k].position.set(
            fd.bx+(fi===4?s*0.15:0),
            fd.by+(si*0.11+si*s*0.08),
            fi===4?0.04:0
          )
        }
        if(r.current[jk]){
          r.current[jk].position.set(
            fd.bx+(fi===4?s*0.15:0),
            fd.by+(si*0.11+si*s*0.08)-0.04,
            fi===4?0.04:0
          )
        }
      }
    })
  })

  return(
    <group>
      {/* Palm */}
      <mesh ref={set('palm')}><boxGeometry args={[0.36,0.45,0.07]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.55}/></mesh>
      <mesh ref={set('palmIn')}><boxGeometry args={[0.28,0.35,0.04]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.2}/></mesh>
      {/* Wrist */}
      <mesh ref={set('wrist')}><cylinderGeometry args={[0.16,0.14,0.12,8]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.45}/></mesh>
      <mesh ref={set('wristR')}><torusGeometry args={[0.15,0.01,6,14]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.3}/></mesh>
      {/* Forearm */}
      <mesh ref={set('forearm')}><cylinderGeometry args={[0.10,0.12,0.35,8]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.4}/></mesh>
      <mesh ref={set('foreIn')}><cylinderGeometry args={[0.06,0.06,0.30,6]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.2}/></mesh>
      {/* Fingers */}
      {fingerData.map((fd)=>(
        <group key={fd.name}>
          {Array.from({length:fd.segs},(_,si)=>(
            <group key={si}>
              <mesh ref={set(`${fd.name}_${si}`)}><boxGeometry args={[0.048,0.09,0.048]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.5}/></mesh>
              <mesh ref={set(`${fd.name}_j${si}`)}><sphereGeometry args={[0.025,6,6]}/><meshBasicMaterial wireframe color={AMBER} transparent opacity={0.6}/></mesh>
            </group>
          ))}
        </group>
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   4. R2-D2 — The loyal droid
   ═══════════════════════════════════════════════════════════════════ */
function R2D2Unit() {
  return(
    <group>
      {/* Body */}
      <mesh><cylinderGeometry args={[0.42,0.42,1.05,14]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.55}/></mesh>
      {/* Body inner */}
      <mesh><cylinderGeometry args={[0.35,0.35,0.95,10]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.15}/></mesh>
      {/* Dome */}
      <mesh position={[0,0.52,0]}><sphereGeometry args={[0.42,14,10,0,Math.PI*2,0,Math.PI*0.52]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.5}/></mesh>
      {/* Dome ring */}
      <mesh position={[0,0.52,0]}><torusGeometry args={[0.42,0.01,6,20]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.3}/></mesh>
      {/* Eye */}
      <mesh position={[0.28,0.62,0.28]}><sphereGeometry args={[0.07,8,8]}/><meshBasicMaterial wireframe color={AMBER} transparent opacity={0.9}/></mesh>
      {/* Eye lens */}
      <mesh position={[0.32,0.62,0.32]}><cylinderGeometry args={[0.03,0.04,0.03,6]}/><meshBasicMaterial wireframe color={RED} transparent opacity={0.6}/></mesh>
      {/* Holoprojector */}
      <mesh position={[0,0.85,0]}><cylinderGeometry args={[0.04,0.02,0.08,6]}/><meshBasicMaterial wireframe color={AMBER} transparent opacity={0.5}/></mesh>
      {/* Center leg */}
      <mesh position={[0,-0.75,0.18]}><boxGeometry args={[0.09,0.50,0.11]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.4}/></mesh>
      <mesh position={[0,-1.0,0.18]}><cylinderGeometry args={[0.05,0.07,0.12,6]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.3}/></mesh>
      {/* Side legs */}
      <mesh position={[0.42,-0.55,0]} rotation={[0,0,-0.12]}><boxGeometry args={[0.07,0.72,0.16]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.45}/></mesh>
      <mesh position={[-0.42,-0.55,0]} rotation={[0,0,0.12]}><boxGeometry args={[0.07,0.72,0.16]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.45}/></mesh>
      {/* Side feet */}
      <mesh position={[0.48,-0.92,0]}><boxGeometry args={[0.10,0.12,0.20]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.35}/></mesh>
      <mesh position={[-0.48,-0.92,0]}><boxGeometry args={[0.10,0.12,0.20]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.35}/></mesh>
      {/* Body panels */}
      <mesh position={[0,0.12,0.43]}><boxGeometry args={[0.20,0.28,0.01]}/><meshBasicMaterial wireframe color={CYAN} transparent opacity={0.25}/></mesh>
      <mesh position={[0,-0.12,0.43]}><boxGeometry args={[0.16,0.10,0.01]}/><meshBasicMaterial wireframe color={AMBER} transparent opacity={0.2}/></mesh>
      {/* Body rings */}
      <mesh position={[0,0.30,0]}><torusGeometry args={[0.43,0.008,6,18]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.2}/></mesh>
      <mesh position={[0,-0.10,0]}><torusGeometry args={[0.43,0.008,6,18]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.2}/></mesh>
      {/* Utility arms (retracted) */}
      <mesh position={[0.35,0.0,0.25]} rotation={[0.3,0.5,0]}><cylinderGeometry args={[0.02,0.02,0.25,4]}/><meshBasicMaterial wireframe color={DIM} transparent opacity={0.2}/></mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   YODA HOLOGRAM — The master, large scale
   ═══════════════════════════════════════════════════════════════════ */
function YodaHologram() {
  return(
    <group>
      {/* Head */}
      <mesh position={[0,0.5,0]} scale={[1,0.85,0.9]}><sphereGeometry args={[0.28,10,10]}/><meshBasicMaterial wireframe color={GREEN} transparent opacity={0.4}/></mesh>
      {/* Eyes */}
      <mesh position={[0.10,0.52,0.22]}><sphereGeometry args={[0.05,6,6]}/><meshBasicMaterial wireframe color={AMBER} transparent opacity={0.5}/></mesh>
      <mesh position={[-0.10,0.52,0.22]}><sphereGeometry args={[0.05,6,6]}/><meshBasicMaterial wireframe color={AMBER} transparent opacity={0.5}/></mesh>
      {/* Right ear */}
      <mesh position={[0.42,0.55,0]} rotation={[0,0,Math.PI/2.3]}><coneGeometry args={[0.08,0.40,6]}/><meshBasicMaterial wireframe color={GREEN} transparent opacity={0.35}/></mesh>
      {/* Left ear */}
      <mesh position={[-0.42,0.55,0]} rotation={[0,0,-Math.PI/2.3]}><coneGeometry args={[0.08,0.40,6]}/><meshBasicMaterial wireframe color={GREEN} transparent opacity={0.35}/></mesh>
      {/* Body — seated meditation pose */}
      <mesh position={[0,0.0,0]}><coneGeometry args={[0.32,0.55,8]}/><meshBasicMaterial wireframe color={GREEN} transparent opacity={0.3}/></mesh>
      {/* Inner robe */}
      <mesh position={[0,0.05,0]}><coneGeometry args={[0.22,0.40,6]}/><meshBasicMaterial wireframe color={GREEN} transparent opacity={0.15}/></mesh>
      {/* Arms */}
      <mesh position={[0.22,0.15,0.10]} rotation={[0.5,0,0.4]}><cylinderGeometry args={[0.035,0.025,0.22,4]}/><meshBasicMaterial wireframe color={GREEN} transparent opacity={0.25}/></mesh>
      <mesh position={[-0.22,0.15,0.10]} rotation={[0.5,0,-0.4]}><cylinderGeometry args={[0.035,0.025,0.22,4]}/><meshBasicMaterial wireframe color={GREEN} transparent opacity={0.25}/></mesh>
      {/* Hands */}
      <mesh position={[0.12,0.10,0.18]}><sphereGeometry args={[0.04,6,6]}/><meshBasicMaterial wireframe color={GREEN} transparent opacity={0.3}/></mesh>
      <mesh position={[-0.12,0.10,0.18]}><sphereGeometry args={[0.04,6,6]}/><meshBasicMaterial wireframe color={GREEN} transparent opacity={0.3}/></mesh>
      {/* Staff */}
      <mesh position={[0.30,0.22,-0.05]} rotation={[0.1,0,0.18]}><cylinderGeometry args={[0.012,0.018,0.75,4]}/><meshBasicMaterial wireframe color={AMBER} transparent opacity={0.3}/></mesh>
      {/* Aura rings */}
      <mesh position={[0,0.28,0]}><torusGeometry args={[0.50,0.006,6,28]}/><meshBasicMaterial wireframe color={GREEN} transparent opacity={0.12}/></mesh>
      <mesh position={[0,0.28,0]} rotation={[Math.PI/3,0,0]}><torusGeometry args={[0.60,0.006,6,28]}/><meshBasicMaterial wireframe color={GREEN} transparent opacity={0.08}/></mesh>
      <mesh position={[0,0.28,0]} rotation={[0,0,Math.PI/4]}><torusGeometry args={[0.70,0.006,6,28]}/><meshBasicMaterial wireframe color={GREEN} transparent opacity={0.06}/></mesh>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   DATA NODES — orbiting info particles
   ═══════════════════════════════════════════════════════════════════ */
function DataNodes() {
  const positions = useMemo(()=>{
    const pts:[number,number,number][]=[]
    for(let i=0;i<10;i++){
      const a=(i/10)*Math.PI*2
      const r=1.6+Math.sin(i*2.7)*0.5
      pts.push([Math.cos(a)*r, Math.sin(i*1.4)*0.7+0.5, Math.sin(a)*r])
    }
    return pts
  },[])

  return(
    <group>
      {positions.map((p,i)=>(
        <mesh key={i} position={p}>
          <octahedronGeometry args={[0.05+i*0.006]}/>
          <meshBasicMaterial wireframe color={i%3===0?AMBER:CYAN} transparent opacity={0.5}/>
        </mesh>
      ))}
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN SCENE — orchestrates everything via useFrame
   ═══════════════════════════════════════════════════════════════════ */
export default function StarWarsScene({animState}:{animState:React.RefObject<AnimState>}) {
  const vapGrp   = useRef<THREE.Group>(null!)
  const saberGrp = useRef<THREE.Group>(null!)
  const redGrp   = useRef<THREE.Group>(null!)
  const handGrp  = useRef<THREE.Group>(null!)
  const r2Grp    = useRef<THREE.Group>(null!)
  const yodaGrp  = useRef<THREE.Group>(null!)
  const nodesGrp = useRef<THREE.Group>(null!)

  const {camera} = useThree()

  useFrame(({clock})=>{
    const a=animState.current; if(!a) return
    const t=clock.getElapsedTime()

    // Camera
    camera.position.y+=(a.camY-camera.position.y)*0.04
    camera.position.z+=(a.camZ-camera.position.z)*0.04

    // Vaporator group
    vapGrp.current.visible=a.ch1>0.01
    vapGrp.current.scale.setScalar(a.ch1)
    vapGrp.current.rotation.y=a.vapRotY+t*0.15
    vapGrp.current.position.y=a.vapY

    // Saber group
    saberGrp.current.visible=a.ch2>0.01
    saberGrp.current.scale.setScalar(a.ch2)
    saberGrp.current.rotation.y=a.saberRotY+t*0.2
    saberGrp.current.position.y=a.saberY

    // Red blade
    redGrp.current.visible=a.redScale>0.01
    redGrp.current.scale.setScalar(a.redScale)
    redGrp.current.position.x=a.redX

    // Hand group
    handGrp.current.visible=a.ch3>0.01
    handGrp.current.scale.setScalar(a.ch3)
    handGrp.current.rotation.y=a.handRotY+t*0.18
    handGrp.current.rotation.x=Math.sin(t*0.35)*0.08
    handGrp.current.position.y=a.handY

    // R2-D2
    r2Grp.current.visible=a.r2Scale>0.01
    r2Grp.current.scale.setScalar(a.r2Scale)
    r2Grp.current.rotation.y=a.r2RotY+t*0.12
    r2Grp.current.position.y=a.r2Y

    // Yoda
    yodaGrp.current.visible=a.yodaScale>0.01
    yodaGrp.current.scale.setScalar(a.yodaScale*(1+Math.sin(t*1.2)*0.02))
    yodaGrp.current.position.y=a.yodaY
    yodaGrp.current.rotation.y=t*0.08

    // Nodes
    nodesGrp.current.visible=a.nodesScale>0.01
    nodesGrp.current.scale.setScalar(a.nodesScale)
    nodesGrp.current.rotation.y=t*0.15
  })

  return(
    <>
      <Particles/>
      <GridFloor/>

      <group ref={vapGrp}>
        <Vaporator animState={animState}/>
      </group>

      <group ref={saberGrp} position={[0,8,0]}>
        <LightsaberAssembly animState={animState}/>
      </group>

      <group ref={redGrp} position={[5,0,0]} scale={0}>
        <RedBlade/>
      </group>

      <group ref={handGrp} position={[0,8,0]}>
        <CyberHand animState={animState}/>
      </group>

      <group ref={r2Grp} position={[0,-6,0]} scale={0}>
        <R2D2Unit/>
      </group>

      <group ref={yodaGrp} position={[0,5,0]} scale={0}>
        <YodaHologram/>
      </group>

      <group ref={nodesGrp} scale={0}>
        <DataNodes/>
      </group>
    </>
  )
}
