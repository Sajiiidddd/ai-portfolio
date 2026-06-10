'use client'

import { forwardRef, useMemo } from 'react'

// ── Pixel art grids — '#' = body, '.' = accent (amber), ' ' = empty ──────────
// Each character evolves: boy → young adult → professional → future
const FIGURES: Record<string, string[]> = {

  // ─── LEARN: Small boy sitting at a laptop, code floating ────────────────────
  learn: [
    '                        ',
    '                        ',
    '         ##             ',
    '        ####            ',
    '       ######           ',
    '       # ## #           ',
    '       ######           ',
    '        ####            ',
    '         ##             ',
    '        ####            ',
    '       ######           ',
    '      # #### #          ',
    '     #  ####  #         ',
    '        ####            ',
    '         ##             ',
    '       ##  ##           ',
    '      ##    ##          ',
    '      ##    ##          ',
    '                        ',
    '     ##########         ',
    '     #........#         ',
    '     #........#         ',
    '     ##########         ',
    '    ############        ',
    '                        ',
    '  #               ##    ',
    '  ##             ##     ',
    '                        ',
    '   ..                   ',
    '   ....                 ',
    '                        ',
  ],

  // ─── TEACH: Taller figure, arm raised, students below ──────────────────────
  teach: [
    '                        ',
    '         ##             ',
    '        ####            ',
    '       ######           ',
    '       # ## #           ',
    '       ######           ',
    '        ####            ',
    '         ##             ',
    '        ####            ',
    '       ######           ',
    '       ######           ',
    '      ########          ',
    '     #  ####  ##        ',
    '    #   ####   ##       ',
    '   #    ####    ##      ',
    '        ####            ',
    '        ####            ',
    '         ##             ',
    '        #  #            ',
    '        #  #            ',
    '       #    #           ',
    '       ##  ##           ',
    '      ###  ###          ',
    '                        ',
    '                        ',
    '  ##    ##    ##    ##   ',
    '  ##    ##    ##    ##   ',
    '  ##    ##    ##    ##   ',
    '                        ',
    '    .........           ',
    '                        ',
  ],

  // ─── SHIP: Full-height pro, workstation, factory elements ──────────────────
  ship: [
    '                        ',
    '        ####            ',
    '       ######           ',
    '      ########          ',
    '      # #### #          ',
    '      ########          ',
    '       ######           ',
    '        ####            ',
    '       ######           ',
    '      ########          ',
    '      ########          ',
    '     ##########         ',
    '     ##########         ',
    '    #  ######  #        ',
    '   #   ######   #       ',
    '       ######           ',
    '       ######           ',
    '        ####            ',
    '       #    #           ',
    '       #    #           ',
    '      #      #          ',
    '      ##    ##          ',
    '     ###    ###         ',
    '                        ',
    '  ################      ',
    '  #..............#      ',
    '  #..............#      ',
    '  #..............#      ',
    '  ################      ',
    '  ##  ########  ##      ',
    '                        ',
  ],

  // ─── GROW: Walking forward, stars above, ascending path ────────────────────
  grow: [
    '    .       .     .     ',
    '      .          .      ',
    '          .             ',
    '   .          .         ',
    '        ####            ',
    '       ######           ',
    '      ########          ',
    '      # #### #          ',
    '      ########          ',
    '       ######           ',
    '        ####            ',
    '       ######           ',
    '      ########          ',
    '      ########          ',
    '     ##########         ',
    '     ##########         ',
    '       ######  #        ',
    '       ######   #       ',
    '        ####            ',
    '       #   #            ',
    '      #     #           ',
    '     #       #          ',
    '    ##        #         ',
    '                        ',
    '                  ##    ',
    '               ####     ',
    '            ######      ',
    '         ########       ',
    '      ##########        ',
    '   ############         ',
    '  ##############        ',
  ],
}

// ── Parse grid into pixel coordinates ─────────────────────────────────────────
interface Pixel { x:number; y:number; accent:boolean; row:number }

function parseGrid(grid:string[]): Pixel[] {
  const pixels:Pixel[] = []
  grid.forEach((row,y) => {
    for(let x=0; x<row.length; x++){
      if(row[x]==='#') pixels.push({x,y,accent:false,row:y})
      if(row[x]==='.') pixels.push({x,y,accent:true,row:y})
    }
  })
  return pixels
}

// ── Component ─────────────────────────────────────────────────────────────────
interface Props {
  chapter: string
  className?: string
}

const PixelFigure = forwardRef<SVGSVGElement, Props>(({ chapter, className }, ref) => {
  const grid = FIGURES[chapter]
  const pixels = useMemo(() => grid ? parseGrid(grid) : [], [grid])

  if(!grid) return null

  const cols = Math.max(...grid.map(r=>r.length))
  const rows = grid.length
  const px = 1 // pixel size in SVG units
  const gap = 0.15 // gap between pixels

  return (
    <svg
      ref={ref}
      viewBox={`0 0 ${cols*(px+gap)} ${rows*(px+gap)}`}
      className={className}
      style={{ shapeRendering:'crispEdges' }}
      aria-hidden="true"
    >
      <g className="pixel-group">
        {pixels.map((p,i) => (
          <rect
            key={i}
            x={p.x*(px+gap)}
            y={p.y*(px+gap)}
            width={px}
            height={px}
            fill={p.accent ? 'rgba(200,136,72,0.12)' : 'rgba(255,255,255,0.06)'}
            data-row={p.row}
            className="pixel-rect"
            style={{ opacity: 0 }} // starts hidden, GSAP reveals
          />
        ))}
      </g>
    </svg>
  )
})

PixelFigure.displayName = 'PixelFigure'
export default PixelFigure
