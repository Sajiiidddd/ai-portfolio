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
    const usedLefts = new Set<number>()

    const generated = images.map((_, i) => {
      // Ensure images are 250px apart vertically
      const top = i * 320

      // Generate non-overlapping left %s within 5% - 40%
      let leftPercent = 5 + Math.random() * 30 // Range: 5% to 35%
      while ([...usedLefts].some(l => Math.abs(l - leftPercent) < 5)) {
        leftPercent = 5 + Math.random() * 30
      }
      usedLefts.add(leftPercent)

      return {
        top,
        left: `${leftPercent}%`,
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










