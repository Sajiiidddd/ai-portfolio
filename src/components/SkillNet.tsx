'use client'

import { useRef, useEffect, useState, useMemo, useCallback } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import * as THREE from 'three'

// ── Randomization seed ────────────────────────────────────────────
const SEED = Math.random() * 99999

// ── Palette — monochrome on black ─────────────────────────────────
const C = {
  nodeRest: new THREE.Color('#0a0a0c'),
  edgeRest: new THREE.Color('#0e0e12'),
  skill:    new THREE.Color('#8a9298'),
  group:    new THREE.Color('#a0a8b0'),
  domain:   new THREE.Color('#b8b0a0'),
  output:   new THREE.Color('#d8d0c4'),
}
const CSS = { skill:'#a0aab2', group:'#b0b8c0', domain:'#c8c0b0', output:'#c88848' }
const AMBER = '#c88848'

// ── Layer data ────────────────────────────────────────────────────
const SKILLS  = ['Python','TensorFlow · Keras','PyTorch','Scikit-learn','HuggingFace','NumPy · Matplotlib','OpenCV','MySQL · PostgreSQL','MongoDB','Django · FastAPI','Node.js','Next.js · HTML · CSS','Git','Google Cloud','Docker · AWS ECR','Claude · OpenAI','Slack API','Zendesk AI','DeBERTa · RoBERTa','MCP · ETL']
const GROUPS  = ['ML · Deep Learning','Web · Backend','Databases','AI · Language','DevOps · Cloud','Automation']
const DOMAINS = ['Intelligence','Product','Infrastructure','Autonomy']
const OUTPUTS = ['AI / ML Model','Web Application','AI Chatbot','Computer Vision','NLP Pipeline','Generative AI','MLOps Pipeline','Data Pipeline']

// ── Connections ───────────────────────────────────────────────────
const S2G: number[][] = [
  [0,1,3,4,5],[0],[0],[0],[0,3],[0],[0],
  [2],[2],[1,4],[1,5],[1],[1,4],[4],[4],
  [3,5],[5],[3,5],[0,3],[4,5],
]
const G2D: number[][] = [[0],[1,2],[1,2],[0,3],[2],[3,2]]
const D2O: number[][] = [[0,3,4,5],[1],[1,6,7],[2,5]]

type Pair = [number,number]
const E_S2G: Pair[] = S2G.flatMap((gs,si) => gs.map(gi=>[si,gi] as Pair))
const E_G2D: Pair[] = G2D.flatMap((ds,gi) => ds.map(di=>[gi,di] as Pair))
const E_D2O: Pair[] = D2O.flatMap((os,di) => os.map(oi=>[di,oi] as Pair))

const N_S=SKILLS.length, N_G=GROUPS.length, N_D=DOMAINS.length, N_O=OUTPUTS.length
const OFF_G=N_S, OFF_D=N_S+N_G, OFF_O=N_S+N_G+N_D
const N_NODES=N_S+N_G+N_D+N_O

const NODE_LABELS=[...SKILLS,...GROUPS,...DOMAINS,...OUTPUTS]
const NODE_THREE:THREE.Color[]=[...SKILLS.map(()=>C.skill),...GROUPS.map(()=>C.group),...DOMAINS.map(()=>C.domain),...OUTPUTS.map(()=>C.output)]
const NODE_CSS=[...SKILLS.map(()=>CSS.skill),...GROUPS.map(()=>CSS.group),...DOMAINS.map(()=>CSS.domain),...OUTPUTS.map(()=>CSS.output)]

// ── Random per-node size variation ────────────────────────────────
const dh=(n:number)=>{const x=Math.sin(n*127.1+311.7)*43758.5453;return x-Math.floor(x)}
const NODE_SIZE_JITTER = Array.from({length:N_NODES},(_,i)=>0.84+dh(SEED+i*71)*0.32)
const NODE_BASE=[
  ...SKILLS.map((_,i)=>0.022*NODE_SIZE_JITTER[i]),
  ...GROUPS.map((_,i)=>0.038*NODE_SIZE_JITTER[OFF_G+i]),
  ...DOMAINS.map((_,i)=>0.052*NODE_SIZE_JITTER[OFF_D+i]),
  ...OUTPUTS.map((_,i)=>0.065*NODE_SIZE_JITTER[OFF_O+i]),
]

interface EdgeMeta{from:number;to:number;col:THREE.Color}
const EDGE_META:EdgeMeta[]=[
  ...E_S2G.map(([si,gi])=>({from:si,      to:OFF_G+gi,col:C.skill })),
  ...E_G2D.map(([gi,di])=>({from:OFF_G+gi,to:OFF_D+di,col:C.group })),
  ...E_D2O.map(([di,oi])=>({from:OFF_D+di,to:OFF_O+oi,col:C.domain})),
]
const N_EDGES=EDGE_META.length

const FWD:number[][]=Array.from({length:N_NODES},()=>[])
const BWD:number[][]=Array.from({length:N_NODES},()=>[])
EDGE_META.forEach(({from,to})=>{FWD[from].push(to);BWD[to].push(from)})
const EDGE_IDX=new Map<string,number>()
EDGE_META.forEach(({from,to},i)=>EDGE_IDX.set(`${from}-${to}`,i))

const CONN=new Set<string>()
EDGE_META.forEach(({from,to})=>{CONN.add(`${from}-${to}`);CONN.add(`${to}-${from}`)})
const connected=(a:number,b:number)=>CONN.has(`${a}-${b}`)

function upstreamOf(oi:number){
  const domains=D2O.map((os,di)=>os.includes(oi)?di:-1).filter(x=>x>=0)
  const groups=[...new Set(domains.flatMap(di=>G2D.map((ds,gi)=>ds.includes(di)?gi:-1).filter(x=>x>=0)))]
  const skills=[...new Set(groups.flatMap(gi=>S2G.map((gs,si)=>gs.includes(gi)?si:-1).filter(x=>x>=0)))]
  return{domains,groups,skills}
}

// ── Fibonacci sphere scatter — breaks the rectangular grid ────────
function fibSphere(count:number, rMin:number, rMax:number, seed:number):THREE.Vector3[]{
  const pts:THREE.Vector3[]=[]
  const golden=Math.PI*(3-Math.sqrt(5))
  for(let i=0;i<count;i++){
    const y=count===1?0:1-(i/(count-1))*2 // -1 to 1
    const radAtY=Math.sqrt(Math.max(0,1-y*y))
    const theta=golden*i+dh(seed+i*7)*1.2 // jittered angle
    const r=rMin+dh(seed+i*13)*(rMax-rMin)
    pts.push(new THREE.Vector3(
      Math.cos(theta)*radAtY*r,
      y*r*(0.85+dh(seed+i*19)*0.3), // slight Y compression jitter
      Math.sin(theta)*radAtY*r
    ))
  }
  return pts
}

// Concentric shells — skills surround core, outputs at the edge
const POSITIONS:THREE.Vector3[]=[
  ...fibSphere(N_S, 3.2, 4.5,  SEED+100),  // Skills: mid-outer shell
  ...fibSphere(N_G, 2.0, 3.0,  SEED+200),  // Groups: mid shell
  ...fibSphere(N_D, 1.2, 1.9,  SEED+300),  // Domains: inner core
  ...fibSphere(N_O, 5.0, 6.2,  SEED+400),  // Outputs: outermost
]

// ── Shuffled reveal order ─────────────────────────────────────────
function shuffledIndices(count:number, offset:number, seed:number):number[]{
  const arr=Array.from({length:count},(_,i)=>i+offset)
  for(let i=arr.length-1;i>0;i--){
    const j=Math.floor(dh(seed+i*37)*i)
    ;[arr[i],arr[j]]=[arr[j],arr[i]]
  }
  return arr
}

const REVEAL_ORDER=[
  ...shuffledIndices(N_S, 0,       SEED+500),
  ...shuffledIndices(N_G, OFF_G,   SEED+600),
  ...shuffledIndices(N_D, OFF_D,   SEED+700),
  ...shuffledIndices(N_O, OFF_O,   SEED+800),
]

const MOUNT_TIME = Date.now()
const REVEAL_TIMES:number[] = new Array(N_NODES)
REVEAL_ORDER.forEach((nodeIdx,seqPos)=>{
  const layer = nodeIdx>=OFF_O?3:nodeIdx>=OFF_D?2:nodeIdx>=OFF_G?1:0
  const base  = [500,1500,2300,3000][layer]
  const step  = [60,95,115,135][layer]
  const localPos = seqPos - [0,N_S,N_S+N_G,N_S+N_G+N_D][layer]
  REVEAL_TIMES[nodeIdx] = base + localPos*step
})

const INIT_ROT_Y = (dh(SEED+900)-0.5)*Math.PI*0.8 // wider initial angle for sphere
const INIT_ROT_X = (dh(SEED+901)-0.5)*0.4
const CASCADE_INT_BASE = 6000 + dh(SEED+950)*6000

// ── Config ────────────────────────────────────────────────────────
const CASCADE_GAP=520
const HOVER_DIST =1.1 // slightly larger for spherical spread
const CAM_Z      =16
const FLOW_DUR   =580
const MAX_DOTS   =40

// ── Types ─────────────────────────────────────────────────────────
interface NodeAnim { brightness:number; activatedAt:number; proxBoost:number; introScale:number }
interface CascItem { ni:number; at:number; vis:Set<number> }
interface FlowDot  { edgeIdx:number; startAt:number; col:THREE.Color }
interface Bridge {
  labelEls:(HTMLElement|null)[]
  onOutput:(oi:number)=>void
  onHide:()=>void
  setCursor:(c:string)=>void
}

// ── Nodes ─────────────────────────────────────────────────────────
function Nodes({na,phases,hov}:{na:React.RefObject<NodeAnim[]>;phases:React.RefObject<number[]>;hov:React.RefObject<number|null>}){
  const core=useRef<THREE.InstancedMesh>(null!)
  const halo=useRef<THREE.InstancedMesh>(null!)
  const D=useMemo(()=>new THREE.Object3D(),[])

  useFrame(({clock},dt)=>{
    const t=clock.getElapsedTime(),now=Date.now(),st=na.current!,hn=hov.current
    POSITIONS.forEach((pos,i)=>{
      const revealTarget=(now-MOUNT_TIME)>=REVEAL_TIMES[i]?1:0
      st[i].introScale+=(revealTarget-st[i].introScale)*Math.min(dt*4,1)

      const age=now-st[i].activatedAt
      const cas=age<1400?1-age/1400:0
      let tgt=Math.max(cas,st[i].proxBoost*0.65)
      if(hn!==null){
        if(i===hn)             tgt=Math.max(tgt,1.0)
        else if(connected(i,hn))tgt=Math.max(tgt,0.45)
        else                    tgt=Math.min(tgt,0.04)
      }
      st[i].brightness+=(tgt-st[i].brightness)*Math.min(dt*5.5,1)
      const b=st[i].brightness,pulse=1+Math.sin(t*1.0+phases.current![i])*0.06,base=NODE_BASE[i]
      const s=st[i].introScale
      D.position.copy(pos)
      D.scale.setScalar((base+b*base*1.8)*pulse*s);D.updateMatrix()
      core.current.setMatrixAt(i,D.matrix)
      core.current.setColorAt!(i,C.nodeRest.clone().lerp(NODE_THREE[i],Math.max(b,s*0.06)))
      D.scale.setScalar((base*3.0+b*base*3.0)*pulse*s);D.updateMatrix()
      halo.current.setMatrixAt(i,D.matrix)
      halo.current.setColorAt!(i,C.nodeRest.clone().lerp(NODE_THREE[i],b*0.20))
    })
    core.current.instanceMatrix.needsUpdate=true
    halo.current.instanceMatrix.needsUpdate=true
    if(core.current.instanceColor)core.current.instanceColor.needsUpdate=true
    if(halo.current.instanceColor)halo.current.instanceColor.needsUpdate=true
  })

  return(<>
    <instancedMesh ref={core} args={[undefined,undefined,N_NODES]}>
      <sphereGeometry args={[1,14,14]}/><meshBasicMaterial/>
    </instancedMesh>
    <instancedMesh ref={halo} args={[undefined,undefined,N_NODES]}>
      <sphereGeometry args={[1,8,8]}/><meshBasicMaterial transparent opacity={0.06} depthWrite={false}/>
    </instancedMesh>
  </>)
}

// ── Edges ─────────────────────────────────────────────────────────
function Edges({eb,hov}:{eb:React.RefObject<Float32Array>;hov:React.RefObject<number|null>}){
  const ref=useRef<THREE.LineSegments>(null!)
  const geo=useMemo(()=>{
    const pos=new Float32Array(N_EDGES*6),col=new Float32Array(N_EDGES*6)
    EDGE_META.forEach(({from,to},i)=>{
      const a=POSITIONS[from],b=POSITIONS[to]
      pos.set([a.x,a.y,a.z,b.x,b.y,b.z],i*6)
      col.set([C.edgeRest.r,C.edgeRest.g,C.edgeRest.b,C.edgeRest.r,C.edgeRest.g,C.edgeRest.b],i*6)
    })
    const g=new THREE.BufferGeometry()
    g.setAttribute('position',new THREE.BufferAttribute(pos,3))
    g.setAttribute('color',   new THREE.BufferAttribute(col,3))
    return g
  },[])

  useFrame((_,dt)=>{
    const ca=ref.current.geometry.getAttribute('color') as THREE.BufferAttribute
    const hn=hov.current
    EDGE_META.forEach(({from,to,col},i)=>{
      const hovEdge=hn!==null&&(from===hn||to===hn)
      eb.current![i]+=(0-eb.current![i])*((hn!==null&&!hovEdge)?Math.min(dt*5,1):Math.min(dt*1.2,1))
      const b=eb.current![i]
      ca.setXYZ(i*2,  C.edgeRest.r+(col.r-C.edgeRest.r)*b,C.edgeRest.g+(col.g-C.edgeRest.g)*b,C.edgeRest.b+(col.b-C.edgeRest.b)*b)
      ca.setXYZ(i*2+1,C.edgeRest.r+(col.r-C.edgeRest.r)*b,C.edgeRest.g+(col.g-C.edgeRest.g)*b,C.edgeRest.b+(col.b-C.edgeRest.b)*b)
    })
    ca.needsUpdate=true
  })

  return(
    <lineSegments ref={ref} geometry={geo}>
      <lineBasicMaterial vertexColors transparent opacity={0.32}/>
    </lineSegments>
  )
}

// ── FlowDots ──────────────────────────────────────────────────────
function FlowDots({dots}:{dots:React.RefObject<FlowDot[]>}){
  const mesh=useRef<THREE.InstancedMesh>(null!)
  const D   =useMemo(()=>new THREE.Object3D(),[])
  const tmp =useMemo(()=>new THREE.Vector3(),[])

  useFrame(()=>{
    const now=Date.now()
    dots.current=dots.current.filter(d=>now-d.startAt<FLOW_DUR+80)
    const active=dots.current.slice(-MAX_DOTS)

    for(let slot=0;slot<MAX_DOTS;slot++){
      if(slot>=active.length){
        D.scale.setScalar(0);D.updateMatrix()
        mesh.current.setMatrixAt(slot,D.matrix)
      } else {
        const e=active[slot]
        const t=Math.min(1,(now-e.startAt)/FLOW_DUR)
        const {from,to}=EDGE_META[e.edgeIdx]
        tmp.lerpVectors(POSITIONS[from],POSITIONS[to],t)
        D.position.copy(tmp)
        const fade=Math.sin(t*Math.PI)
        D.scale.setScalar(0.018*fade);D.updateMatrix()
        mesh.current.setMatrixAt(slot,D.matrix)
        mesh.current.setColorAt!(slot,new THREE.Color('#d8d0c4').multiplyScalar(1.5*fade))
      }
    }
    mesh.current.instanceMatrix.needsUpdate=true
    if(mesh.current.instanceColor)mesh.current.instanceColor.needsUpdate=true
  })

  return(
    <instancedMesh ref={mesh} args={[undefined,undefined,MAX_DOTS]}>
      <sphereGeometry args={[1,6,6]}/><meshBasicMaterial/>
    </instancedMesh>
  )
}

// ── Scene ─────────────────────────────────────────────────────────
function Scene({bridge,dots}:{bridge:Bridge;dots:React.RefObject<FlowDot[]>}){
  const grp=useRef<THREE.Group>(null!)
  const ray=useMemo(()=>new THREE.Raycaster(),[])
  const tmp=useMemo(()=>new THREE.Vector3(),[])
  const mou=useRef({x:0,y:0})
  const lk =useRef(0)
  const nxt=useRef(Date.now()+3500)
  const isMobile=useRef(typeof window!=='undefined'&&window.innerWidth<640)

  // ── Right-click drag rotation state ─────────────────────────────
  const isDrag  =useRef(false)
  const dragRot =useRef({x:INIT_ROT_X, y:INIT_ROT_Y})
  const dragPrev=useRef({x:0,y:0})

  const na    =useRef<NodeAnim[]>(Array.from({length:N_NODES},()=>({brightness:0,activatedAt:0,proxBoost:0,introScale:0})))
  const eb    =useRef(new Float32Array(N_EDGES))
  const fwdQ  =useRef<CascItem[]>([])
  const bwdQ  =useRef<CascItem[]>([])
  const phases=useRef(Array.from({length:N_NODES},()=>Math.random()*Math.PI*2))
  const hov   =useRef<number|null>(null)
  const camR  =useRef<THREE.Camera|null>(null)

  useEffect(()=>{
    if(grp.current){
      grp.current.rotation.y=INIT_ROT_Y
      grp.current.rotation.x=INIT_ROT_X
    }
  },[])

  const cascadeFwd=useCallback((ni:number)=>{
    fwdQ.current.push({ni,at:Date.now(),vis:new Set([ni])})
    bridge.onHide()
  },[bridge])

  const cascadeBwd=useCallback((ni:number)=>{
    bwdQ.current.push({ni,at:Date.now(),vis:new Set([ni])})
    bridge.onOutput(ni-OFF_O)
    bridge.onHide()
  },[bridge])

  const fire=useCallback((ni:number)=>{
    if(ni>=OFF_O)cascadeBwd(ni); else cascadeFwd(ni)
  },[cascadeFwd,cascadeBwd])

  useEffect(()=>{
    const onM=(e:MouseEvent)=>{
      mou.current.x=(e.clientX/window.innerWidth-.5)*2
      mou.current.y=-(e.clientY/window.innerHeight-.5)*2
      // Right-click drag rotation
      if(isDrag.current){
        const dx=(e.clientX-dragPrev.current.x)*0.006
        const dy=(e.clientY-dragPrev.current.y)*0.006
        dragRot.current.y+=dx
        dragRot.current.x+=dy
        dragPrev.current.x=e.clientX
        dragPrev.current.y=e.clientY
      }
    }
    const fireBestNode=()=>{
      if(!camR.current||!grp.current)return
      ray.setFromCamera(new THREE.Vector2(mou.current.x,mou.current.y),camR.current)
      let best=-1,bd=Infinity
      POSITIONS.forEach((p,i)=>{tmp.copy(p).applyMatrix4(grp.current.matrixWorld);const d=ray.ray.distanceToPoint(tmp);if(d<bd){bd=d;best=i}})
      if(best>=0)fire(best)
    }
    const onC=(e:MouseEvent)=>{if(e.button===0)fireBestNode()}
    const onK=(e:KeyboardEvent)=>{
      if(e.repeat||Date.now()-lk.current<700)return
      lk.current=Date.now()
      fire(Math.floor(Math.random()*N_NODES))
    }
    // Right-click drag handlers
    const onDown=(e:MouseEvent)=>{
      if(e.button===2){
        isDrag.current=true
        dragPrev.current.x=e.clientX
        dragPrev.current.y=e.clientY
        bridge.setCursor('grabbing')
      }
    }
    const onUp=(e:MouseEvent)=>{
      if(e.button===2){
        isDrag.current=false
        bridge.setCursor('default')
      }
    }
    const onCtx=(e:Event)=>e.preventDefault()

    const onTM=(e:TouchEvent)=>{
      const t=e.touches[0]; if(!t)return
      mou.current.x=(t.clientX/window.innerWidth-.5)*2
      mou.current.y=-(t.clientY/window.innerHeight-.5)*2
    }
    const onTS=(e:TouchEvent)=>{
      const t=e.touches[0]; if(!t)return
      mou.current.x=(t.clientX/window.innerWidth-.5)*2
      mou.current.y=-(t.clientY/window.innerHeight-.5)*2
      fireBestNode()
    }
    const onR=()=>{isMobile.current=window.innerWidth<640}
    window.addEventListener('mousemove',onM)
    window.addEventListener('click',onC)
    window.addEventListener('mousedown',onDown)
    window.addEventListener('mouseup',onUp)
    window.addEventListener('contextmenu',onCtx)
    window.addEventListener('keydown',onK)
    window.addEventListener('touchmove',onTM,{passive:true})
    window.addEventListener('touchstart',onTS,{passive:true})
    window.addEventListener('resize',onR)
    return()=>{
      window.removeEventListener('mousemove',onM)
      window.removeEventListener('click',onC)
      window.removeEventListener('mousedown',onDown)
      window.removeEventListener('mouseup',onUp)
      window.removeEventListener('contextmenu',onCtx)
      window.removeEventListener('keydown',onK)
      window.removeEventListener('touchmove',onTM)
      window.removeEventListener('touchstart',onTS)
      window.removeEventListener('resize',onR)
    }
  },[fire,ray,tmp,bridge])

  useFrame(({clock,camera,size})=>{
    camR.current=camera
    const t=clock.getElapsedTime(),now=Date.now()

    // Rotation: drag rotation + slow auto-drift (paused while dragging)
    const autoY=isDrag.current?0:t*0.012
    const autoX=isDrag.current?0:Math.sin(t*0.008)*0.02
    const parallaxX=isDrag.current?0:mou.current.x*0.06
    const parallaxY=isDrag.current?0:mou.current.y*0.04

    const rY=dragRot.current.y+autoY+parallaxX
    const rX=dragRot.current.x+autoX+parallaxY
    grp.current.rotation.y+=(rY-grp.current.rotation.y)*0.012
    grp.current.rotation.x+=(rX-grp.current.rotation.x)*0.012

    camera.position.y+=(Math.sin(t*0.12)*0.15-camera.position.y)*0.012

    // Hover
    ray.setFromCamera(new THREE.Vector2(mou.current.x,mou.current.y),camera)
    let nh:number|null=null,md=HOVER_DIST
    POSITIONS.forEach((p,i)=>{tmp.copy(p).applyMatrix4(grp.current.matrixWorld);const d=ray.ray.distanceToPoint(tmp);if(d<md){md=d;nh=i}})
    if(nh!==hov.current){
      hov.current=nh
      if(!isDrag.current)bridge.setCursor(nh!==null?'pointer':'default')
    }

    // Proximity glow
    POSITIONS.forEach((p,i)=>{
      tmp.copy(p).applyMatrix4(grp.current.matrixWorld)
      const d=ray.ray.distanceToPoint(tmp)
      na.current[i].proxBoost+=(Math.max(0,1-d/2.0)**1.8-na.current[i].proxBoost)*0.12
    })

    // Auto cascade
    if(now>=nxt.current){
      cascadeBwd(OFF_O+Math.floor(Math.random()*N_O))
      nxt.current=now+CASCADE_INT_BASE+Math.random()*3000
    }

    const activateEdge=(ei:number)=>{
      eb.current[ei]=1.0
      if(dots.current.length<120)
        dots.current.push({edgeIdx:ei,startAt:now,col:EDGE_META[ei].col.clone()})
    }

    // Forward cascade
    const nF:CascItem[]=[]
    fwdQ.current.forEach(item=>{
      if(now<item.at){nF.push(item);return}
      na.current[item.ni].activatedAt=now
      FWD[item.ni].forEach(nb=>{
        const ei=EDGE_IDX.get(`${item.ni}-${nb}`)
        if(ei!==undefined)activateEdge(ei)
        if(!item.vis.has(nb)&&Math.random()<0.78){
          item.vis.add(nb)
          nF.push({ni:nb,at:now+CASCADE_GAP+Math.random()*100,vis:item.vis})
          if(nb>=OFF_O)bridge.onOutput(nb-OFF_O)
        }
      })
    })
    fwdQ.current=nF

    // Backward cascade
    const nB:CascItem[]=[]
    bwdQ.current.forEach(item=>{
      if(now<item.at){nB.push(item);return}
      na.current[item.ni].activatedAt=now
      BWD[item.ni].forEach(nb=>{
        const ei=EDGE_IDX.get(`${nb}-${item.ni}`)
        if(ei!==undefined)activateEdge(ei)
        if(!item.vis.has(nb)&&Math.random()<0.78){
          item.vis.add(nb)
          nB.push({ni:nb,at:now+CASCADE_GAP+Math.random()*100,vis:item.vis})
        }
      })
    })
    bwdQ.current=nB

    // Project labels — dynamic side based on screen position
    const cx=size.width/2
    POSITIONS.forEach((pos,i)=>{
      tmp.copy(pos).applyMatrix4(grp.current.matrixWorld)
      const p=tmp.clone().project(camera)
      if(p.z>=1){
        const lbl=bridge.labelEls[i]
        if(lbl)lbl.style.opacity='0'
        return
      }
      const sx=(p.x*.5+.5)*size.width
      const sy=(-p.y*.5+.5)*size.height
      const depthT=Math.max(0,Math.min(1,(1-p.z)*1.2))

      const b=na.current[i].brightness
      const isOut=i>=OFF_O, isHov=i===hov.current
      const isConn=hov.current!==null&&connected(i,hov.current)
      const show=isOut||isHov||isConn||b>0.08

      const isSkill=i<OFF_G
      const lbl=bridge.labelEls[i]
      if(isMobile.current&&isSkill){
        if(lbl)lbl.style.opacity='0'
        return
      }

      if(lbl){
        lbl.style.left=`${sx}px`;lbl.style.top=`${sy}px`
        // Dynamic label side — extends away from center
        const isLeft=sx<cx
        lbl.style.transform=isLeft
          ? 'translate(calc(-100% - 12px), -50%)'
          : 'translate(12px, -50%)'
        const baseOpacity=show?(b>0.06||isOut?1:0.28):0
        lbl.style.opacity=String(baseOpacity*(.30+depthT*.70))
        if(isOut){
          lbl.style.color=b>0.06?AMBER:'rgba(200,136,72,0.25)'
        } else {
          lbl.style.color=b>0.06
            ? `rgba(255,255,255,${0.50+b*0.45})`
            : 'rgba(255,255,255,0.08)'
        }
        const baseFs=isOut?10:i>=OFF_D?8.5:i>=OFF_G?8:7.5
        lbl.style.fontSize=`${baseFs*(0.82+depthT*0.22)}px`
      }
    })

    void t
  })

  return(
    <group ref={grp}>
      <Edges eb={eb} hov={hov}/>
      <Nodes na={na} phases={phases} hov={hov}/>
      <FlowDots dots={dots}/>
    </group>
  )
}

// ── Root ──────────────────────────────────────────────────────────
export default function SkillNet(){
  const router=useRouter()
  const [activeOut,setActiveOut]=useState<number|null>(null)
  const [cursor,setCursor]     =useState('default')

  const labelEls=useRef<(HTMLElement|null)[]>(Array(N_NODES).fill(null))
  const dots    =useRef<FlowDot[]>([])

  const bridge=useRef<Bridge>({
    labelEls:labelEls.current,
    onOutput:()=>{},onHide:()=>{},setCursor:()=>{},
  })
  bridge.current.onOutput =useCallback((oi:number)=>setActiveOut(oi),[])
  bridge.current.onHide   =useCallback(()=>{},[])
  bridge.current.setCursor=useCallback((c:string)=>setCursor(c),[])

  const info=activeOut!==null?upstreamOf(activeOut):null

  return(
    <motion.div className="absolute inset-0"
      style={{background:'#050507',cursor}}
      initial={{opacity:0}} animate={{opacity:1}}
      transition={{duration:2.5,ease:'easeInOut'}}>

      {/* 3D canvas */}
      <Canvas camera={{position:[0,0,CAM_Z],fov:50}} gl={{antialias:true,alpha:true}}>
        <Scene bridge={bridge.current} dots={dots}/>
        <EffectComposer>
          <Bloom intensity={0.9} luminanceThreshold={0.06} luminanceSmoothing={0.03} mipmapBlur radius={0.40}/>
        </EffectComposer>
      </Canvas>

      {/* Vignette */}
      <div style={{position:'absolute',inset:0,pointerEvents:'none',zIndex:5,
        background:'radial-gradient(ellipse 72% 72% at 50% 50%, transparent 35%, rgba(5,5,7,0.94) 100%)'}}/>

      {/* Labels — dynamic side computed in useFrame */}
      {NODE_LABELS.map((label,i)=>(
        <div key={i}
          ref={el=>{labelEls.current[i]=el;bridge.current.labelEls[i]=el}}
          onClick={i>=OFF_O?()=>router.push('/projects'):undefined}
          style={{
            position:'absolute',
            pointerEvents: i>=OFF_O?'auto':'none',
            cursor: i>=OFF_O?'pointer':'default',
            zIndex:20,
            transform: 'translate(12px, -50%)', // default, overridden in useFrame
            fontFamily: '"SF Mono", ui-monospace, monospace',
            fontSize: i>=OFF_O ? '10px' : i>=OFF_D ? '8.5px' : i>=OFF_G ? '8px' : '7.5px',
            fontWeight: i>=OFF_O ? 500 : 400,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            opacity: 0,
            color: 'rgba(255,255,255,0.08)',
            textShadow: '0 0 24px rgba(0,0,0,1)',
            transition: 'color 0.5s ease',
          }}>
          {label}
        </div>
      ))}

      {/* Active output panel */}
      <AnimatePresence mode="wait">
        {activeOut!==null&&info&&(
          <motion.div key={activeOut}
            initial={{opacity:0,y:6}}
            animate={{opacity:1,y:0}}
            exit={{opacity:0,y:-4}}
            transition={{duration:0.7,ease:[0.22,1,0.36,1]}}
            style={{
              position:'absolute', bottom:85, left:'50%', transform:'translateX(-50%)',
              zIndex:30, pointerEvents:'auto', textAlign:'center',
              display:'flex', flexDirection:'column', alignItems:'center', gap:0,
            }}>

            <span
              onClick={()=>router.push('/projects')}
              style={{
                fontFamily:'"SF Mono", ui-monospace, monospace',
                fontSize:14, letterSpacing:'0.18em', textTransform:'uppercase',
                fontWeight:500, color:AMBER,
                lineHeight:1, cursor:'pointer',
                transition:'color 0.3s',
                textShadow:`0 0 30px rgba(200,136,72,0.25)`,
              }}
              onMouseEnter={(e)=>(e.currentTarget.style.color='#e0a060')}
              onMouseLeave={(e)=>(e.currentTarget.style.color=AMBER)}>
              {OUTPUTS[activeOut]}
            </span>

            <motion.div
              initial={{scaleX:0}} animate={{scaleX:1}}
              transition={{duration:0.8,delay:0.1,ease:'easeOut'}}
              style={{
                width:100, height:1,
                background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.08),transparent)',
                margin:'14px 0 12px',
              }}/>

            <span style={{
              fontFamily:'"SF Mono", ui-monospace, monospace',
              fontSize:8, letterSpacing:'0.22em', textTransform:'uppercase',
              color:'rgba(255,255,255,0.16)',
            }}>
              {info.skills.length} skills · {info.groups.length} groups · {info.domains.length} domains
            </span>

            <motion.div
              initial={{opacity:0}} animate={{opacity:1}}
              transition={{delay:0.4,duration:0.5}}
              style={{
                display:'flex', flexWrap:'wrap', justifyContent:'center',
                gap:4, marginTop:14, maxWidth:380,
              }}>
              {info.skills.map((si,idx)=>(
                <motion.span key={si}
                  initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}}
                  transition={{delay:0.45+idx*0.03,duration:0.25}}
                  style={{
                    fontFamily:'"SF Mono", ui-monospace, monospace',
                    fontSize:7, letterSpacing:'0.10em', textTransform:'uppercase',
                    color:'rgba(255,255,255,0.25)',
                    border:'1px solid rgba(255,255,255,0.06)',
                    borderRadius:2, padding:'3px 6px',
                  }}>
                  {SKILLS[si]}
                </motion.span>
              ))}
            </motion.div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Hint — includes right-click */}
      <motion.div
        initial={{opacity:0}} animate={{opacity:1}}
        transition={{delay:6,duration:3}}
        style={{
          position:'absolute', bottom:85, right:28, zIndex:25,
          pointerEvents:'none',
          fontFamily:'"SF Mono", ui-monospace, monospace',
          fontSize:7.5, letterSpacing:'0.12em', textTransform:'uppercase',
          color:'rgba(255,255,255,0.07)',
          textAlign:'right', lineHeight:2.6,
        }}>
        <div>click · cascade</div>
        <div>right-drag · orbit</div>
      </motion.div>

    </motion.div>
  )
}
