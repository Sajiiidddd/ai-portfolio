'use client'

import { useEffect, useRef } from 'react'
import Globe from 'react-globe.gl'

const ARCS = [
  { startLat: 18.52, startLng: 73.85, endLat: 37.77, endLng: -122.41, label: 'Pune → SF' },
  { startLat: 18.52, startLng: 73.85, endLat: 51.50, endLng: -0.12,  label: 'Pune → London' },
  { startLat: 18.52, startLng: 73.85, endLat: 35.68, endLng: 139.69, label: 'Pune → Tokyo' },
  { startLat: 18.52, startLng: 73.85, endLat: 40.71, endLng: -74.00, label: 'Pune → NYC' },
  { startLat: 18.52, startLng: 73.85, endLat: 1.35,  endLng: 103.82, label: 'Pune → Singapore' },
]

const POINTS = [
  { lat: 18.52, lng: 73.85, label: 'Pune, IN', color: '#A35D6A', size: 0.6 },
  { lat: 37.77, lng: -122.41, label: 'San Francisco', color: '#ffffff', size: 0.3 },
  { lat: 51.50, lng: -0.12,  label: 'London', color: '#ffffff', size: 0.3 },
  { lat: 35.68, lng: 139.69, label: 'Tokyo', color: '#ffffff', size: 0.3 },
  { lat: 40.71, lng: -74.00, label: 'New York', color: '#ffffff', size: 0.3 },
  { lat: 1.35,  lng: 103.82, label: 'Singapore', color: '#ffffff', size: 0.3 },
]

export default function GlobeScene() {
  const globeRef = useRef<any>(null)

  useEffect(() => {
    if (!globeRef.current) return
    const controls = globeRef.current.controls()
    controls.autoRotate = true
    controls.autoRotateSpeed = 0.6
    controls.enableZoom = false
    globeRef.current.pointOfView({ lat: 20, lng: 73, altitude: 2 }, 0)
  }, [])

  return (
    <Globe
      ref={globeRef}
      width={typeof window !== 'undefined' ? window.innerWidth : 800}
      height={typeof window !== 'undefined' ? window.innerHeight : 600}
      backgroundColor="rgba(0,0,0,0)"
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
      atmosphereColor="#A35D6A"
      atmosphereAltitude={0.25}
      arcsData={ARCS}
      arcColor={() => ['rgba(163,93,106,0.1)', 'rgba(163,93,106,0.9)']}
      arcAltitude={0.3}
      arcStroke={0.5}
      arcDashLength={0.4}
      arcDashGap={0.2}
      arcDashAnimateTime={2000}
      pointsData={POINTS}
      pointColor={(d: any) => d.color}
      pointAltitude={0.01}
      pointRadius={(d: any) => d.size}
      pointLabel={(d: any) => d.label}
    />
  )
}
