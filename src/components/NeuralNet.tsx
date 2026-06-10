'use client'

import { useRef, useMemo, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { motion } from 'framer-motion'
import * as THREE from 'three'

// ── Palette ───────────────────────────────────────────────────────
const COL = {
  nodeRest:   new THREE.Color('#1c0f14'),
  nodeActive: new THREE.Color('#d95f72'),
  edgeRest:   new THREE.Color('#180c10'),
  edgeActive: new THREE.Color('#7a3045'),
}

// ── Config ────────────────────────────────────────────────────────
const N_NODES     = 32
const CONN_DIST   = 2.7
const CASCADE_GAP = 260
const CASCADE_INT = 4000
const PROX_RADIUS = 1.4   // world-units radius for mouse proximity

// ── Network geometry ──────────────────────────────────────────────
function makeNodes(): THREE.Vector3[] {
  const phi = Math.PI * (3 - Math.sqrt(5))
  return Array.from({ length: N_NODES }, (_, i) => {
    const y = 1 - (i / (N_NODES - 1)) * 2
    const r = Math.sqrt(Math.max(0, 1 - y * y))
    const t = phi * i
    return new THREE.Vector3(Math.cos(t) * r * 4.2, y * 2.8, Math.sin(t) * r * 3.0)
  })
}

function makeEdges(nodes: THREE.Vector3[]): [number, number][] {
  const out: [number, number][] = []
  for (let i = 0; i < nodes.length; i++)
    for (let j = i + 1; j < nodes.length; j++)
      if (nodes[i].distanceTo(nodes[j]) < CONN_DIST) out.push([i, j])
  return out
}

function makeAdj(n: number, edges: [number, number][]): number[][] {
  const adj: number[][] = Array.from({ length: n }, () => [])
  edges.forEach(([a, b]) => { adj[a].push(b); adj[b].push(a) })
  return adj
}

// ── Types ─────────────────────────────────────────────────────────
interface NodeState  { brightness: number; activatedAt: number; proxBoost: number }
interface CascadeItem { ni: number; at: number; vis: Set<number> }

// ── Nodes ─────────────────────────────────────────────────────────
function Nodes({
  nodes,
  states,
}: {
  nodes: THREE.Vector3[]
  states: React.RefObject<NodeState[]>
}) {
  const coreRef = useRef<THREE.InstancedMesh>(null!)
  const haloRef = useRef<THREE.InstancedMesh>(null!)
  const dummy   = useMemo(() => new THREE.Object3D(), [])
  const phases  = useMemo(() => nodes.map(() => Math.random() * Math.PI * 2), [nodes])

  useFrame(({ clock }, delta) => {
    const t   = clock.getElapsedTime()
    const now = Date.now()
    const st  = states.current!

    nodes.forEach((pos, i) => {
      const age      = now - st[i].activatedAt
      const cascade  = age < 700 ? 1 - age / 700 : 0
      const target   = Math.max(cascade, st[i].proxBoost * 0.65)
      st[i].brightness += (target - st[i].brightness) * Math.min(delta * 5, 1)

      const b      = st[i].brightness
      const pulse  = 1 + Math.sin(t * 1.4 + phases[i]) * 0.13
      const core   = (0.042 + b * 0.10) * pulse
      const halo   = (0.13  + b * 0.32) * pulse

      dummy.position.copy(pos)

      dummy.scale.setScalar(core)
      dummy.updateMatrix()
      coreRef.current.setMatrixAt(i, dummy.matrix)
      coreRef.current.setColorAt!(i, COL.nodeRest.clone().lerp(COL.nodeActive, b))

      dummy.scale.setScalar(halo)
      dummy.updateMatrix()
      haloRef.current.setMatrixAt(i, dummy.matrix)
      haloRef.current.setColorAt!(i, COL.nodeRest.clone().lerp(COL.nodeActive, b * 0.5))
    })

    coreRef.current.instanceMatrix.needsUpdate = true
    haloRef.current.instanceMatrix.needsUpdate = true
    if (coreRef.current.instanceColor) coreRef.current.instanceColor.needsUpdate = true
    if (haloRef.current.instanceColor) haloRef.current.instanceColor.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={coreRef} args={[undefined, undefined, nodes.length]}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial />
      </instancedMesh>
      <instancedMesh ref={haloRef} args={[undefined, undefined, nodes.length]}>
        <sphereGeometry args={[1, 10, 10]} />
        <meshBasicMaterial transparent opacity={0.12} depthWrite={false} />
      </instancedMesh>
    </>
  )
}

// ── Edges ─────────────────────────────────────────────────────────
function Edges({
  nodes,
  edges,
  edgeBrightness,
}: {
  nodes: THREE.Vector3[]
  edges: [number, number][]
  edgeBrightness: React.RefObject<Float32Array>
}) {
  const ref = useRef<THREE.LineSegments>(null!)

  const geo = useMemo(() => {
    const pos = new Float32Array(edges.length * 6)
    const col = new Float32Array(edges.length * 6)
    edges.forEach(([a, b], i) => {
      pos.set([nodes[a].x, nodes[a].y, nodes[a].z, nodes[b].x, nodes[b].y, nodes[b].z], i * 6)
      col.set([COL.edgeRest.r, COL.edgeRest.g, COL.edgeRest.b,
               COL.edgeRest.r, COL.edgeRest.g, COL.edgeRest.b], i * 6)
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    g.setAttribute('color',    new THREE.BufferAttribute(col, 3))
    return g
  }, [nodes, edges])

  useFrame((_, delta) => {
    const ca = ref.current.geometry.getAttribute('color') as THREE.BufferAttribute
    const eb = edgeBrightness.current!
    edges.forEach((_, i) => {
      eb[i] += (0 - eb[i]) * Math.min(delta * 2.5, 1)
      const b  = eb[i]
      const r  = COL.edgeRest.r + (COL.edgeActive.r - COL.edgeRest.r) * b
      const g  = COL.edgeRest.g + (COL.edgeActive.g - COL.edgeRest.g) * b
      const bl = COL.edgeRest.b + (COL.edgeActive.b - COL.edgeRest.b) * b
      ca.setXYZ(i * 2,     r, g, bl)
      ca.setXYZ(i * 2 + 1, r, g, bl)
    })
    ca.needsUpdate = true
  })

  return (
    <lineSegments ref={ref} geometry={geo}>
      <lineBasicMaterial vertexColors transparent opacity={0.55} />
    </lineSegments>
  )
}

// ── Scene ─────────────────────────────────────────────────────────
function Scene() {
  const group      = useRef<THREE.Group>(null!)
  const mouse      = useRef({ x: 0, y: 0 })
  const cameraRef  = useRef<THREE.Camera | null>(null)
  const raycaster  = useMemo(() => new THREE.Raycaster(), [])
  const worldPos   = useMemo(() => new THREE.Vector3(), [])
  const lastKey    = useRef(0)

  const nodes = useMemo(makeNodes, [])
  const edges = useMemo(() => makeEdges(nodes), [nodes])
  const adj   = useMemo(() => makeAdj(nodes.length, edges), [nodes.length, edges])

  const edgeMap = useMemo(() => {
    const m = new Map<string, number>()
    edges.forEach(([a, b], i) => m.set(`${Math.min(a, b)}-${Math.max(a, b)}`, i))
    return m
  }, [edges])

  const nodeStates     = useRef<NodeState[]>(nodes.map(() => ({ brightness: 0, activatedAt: 0, proxBoost: 0 })))
  const edgeBrightness = useRef<Float32Array>(new Float32Array(edges.length))
  const cascadeQueue   = useRef<CascadeItem[]>([])
  const nextCascade    = useRef(Date.now() + 1200)

  // ── Start a cascade from any node index ──────────────────────────
  const startCascade = (ni: number) => {
    const vis = new Set([ni])
    cascadeQueue.current.push({ ni, at: Date.now(), vis })
  }

  useEffect(() => {
    // Mouse move
    const onMove = (e: MouseEvent) => {
      mouse.current.x =  (e.clientX / window.innerWidth  - 0.5) * 2
      mouse.current.y = -(e.clientY / window.innerHeight - 0.5) * 2
    }

    // Click → cascade from nearest node to cursor ray
    const onClick = () => {
      if (!cameraRef.current || !group.current) return
      raycaster.setFromCamera(new THREE.Vector2(mouse.current.x, mouse.current.y), cameraRef.current)
      let best = -1, bestDist = Infinity
      nodes.forEach((pos, i) => {
        worldPos.copy(pos).applyMatrix4(group.current.matrixWorld)
        const d = raycaster.ray.distanceToPoint(worldPos)
        if (d < bestDist) { bestDist = d; best = i }
      })
      if (best >= 0) startCascade(best)
    }

    // Keydown → cascade from random node (debounced 700ms)
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return
      if (Date.now() - lastKey.current < 700) return
      lastKey.current = Date.now()
      startCascade(Math.floor(Math.random() * nodes.length))
    }

    window.addEventListener('mousemove', onMove)
    window.addEventListener('click',     onClick)
    window.addEventListener('keydown',   onKey)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('click',     onClick)
      window.removeEventListener('keydown',   onKey)
    }
  }, [nodes, edges, adj, edgeMap, raycaster, worldPos])

  useFrame(({ clock, camera }) => {
    const t   = clock.getElapsedTime()
    const now = Date.now()
    cameraRef.current = camera

    // Smooth tilt
    const tY = t * 0.045 + mouse.current.x * 0.22
    const tX = Math.sin(t * 0.025) * 0.08 + mouse.current.y * 0.11
    group.current.rotation.y += (tY - group.current.rotation.y) * 0.018
    group.current.rotation.x += (tX - group.current.rotation.x) * 0.018

    // ── Mouse proximity glow ──────────────────────────────────────
    raycaster.setFromCamera(new THREE.Vector2(mouse.current.x, mouse.current.y), camera)
    const st = nodeStates.current!
    nodes.forEach((pos, i) => {
      worldPos.copy(pos).applyMatrix4(group.current.matrixWorld)
      const dist  = raycaster.ray.distanceToPoint(worldPos)
      const boost = Math.max(0, 1 - dist / PROX_RADIUS) ** 1.8
      st[i].proxBoost += (boost - st[i].proxBoost) * 0.12
    })

    // ── Auto cascade ─────────────────────────────────────────────
    if (now >= nextCascade.current) {
      startCascade(Math.floor(Math.random() * nodes.length))
      nextCascade.current = now + CASCADE_INT + Math.random() * 1200
    }

    // ── Process cascade queue ─────────────────────────────────────
    const next: CascadeItem[] = []
    cascadeQueue.current.forEach(item => {
      if (now < item.at) { next.push(item); return }

      st[item.ni].activatedAt = now

      adj[item.ni].forEach(nb => {
        const key = `${Math.min(item.ni, nb)}-${Math.max(item.ni, nb)}`
        const ei  = edgeMap.get(key)
        if (ei !== undefined) edgeBrightness.current![ei] = 1.0

        if (!item.vis.has(nb) && Math.random() < 0.62) {
          item.vis.add(nb)
          next.push({ ni: nb, at: now + CASCADE_GAP + Math.random() * 120, vis: item.vis })
        }
      })
    })
    cascadeQueue.current = next
  })

  return (
    <group ref={group}>
      <Edges nodes={nodes} edges={edges} edgeBrightness={edgeBrightness} />
      <Nodes nodes={nodes} states={nodeStates} />
    </group>
  )
}

// ── Export ────────────────────────────────────────────────────────
export default function NeuralNet() {
  return (
    <motion.div
      style={{ position: 'absolute', inset: 0 }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2.2, ease: 'easeInOut' }}
    >
      <Canvas
        camera={{ position: [0, 0, 11], fov: 50 }}
        gl={{ antialias: true, alpha: true }}
      >
        <Scene />
        <EffectComposer>
          <Bloom
            intensity={1.3}
            luminanceThreshold={0.10}
            luminanceSmoothing={0.04}
            mipmapBlur
            radius={0.55}
          />
        </EffectComposer>
      </Canvas>
    </motion.div>
  )
}
