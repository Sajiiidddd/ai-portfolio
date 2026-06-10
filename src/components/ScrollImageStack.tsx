'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'

const images = [
  '/images/self1.jpg',
  '/images/ukraine1.jpg',
  '/images/ukraine2.jpg',
  '/images/pune1.jpg',
  '/images/ukraine3.jpg',
]

interface ImagePosition {
  top: number
  left: string
}

export default function ScrollImageStack() {
  const [positions, setPositions] = useState<ImagePosition[]>([])

  useEffect(() => {
    // Evenly distribute each image into its own horizontal band with a little
    // jitter. This keeps the scattered look while GUARANTEEING the loop ends —
    // the previous Math.random() + `while` retry could be unsatisfiable and
    // spin forever, freezing the page ("Page Unresponsive").
    const minLeft = 5
    const maxLeft = 38
    const band = (maxLeft - minLeft) / images.length

    const generated = images.map((_, i) => {
      const jitter = Math.random() * (band * 0.55)
      const leftPercent = minLeft + i * band + jitter
      return {
        top: i * 320,
        left: `${leftPercent.toFixed(1)}%`,
      }
    })

    setPositions(generated)
  }, [])

  return (
    <div className="absolute inset-0 z-0 pointer-events-none">
      <div className="relative h-[300vh] w-full">
        {positions.map((pos, index) => (
          <Image
            key={index}
            src={images[index]}
            alt={`Scroll Image ${index}`}
            width={400}
            height={300}
            className="absolute object-cover opacity-100 rounded-md shadow-lg transition duration-500"
            style={{
              top: `${pos.top}px`,
              left: pos.left,
            }}
          />
        ))}
      </div>
    </div>
  )
}
