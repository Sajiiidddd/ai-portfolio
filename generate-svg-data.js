// generate-svg-data.js
const { trace } = require('potrace')
const fs = require('fs')
const path = require('path')

const imagesToProcess = [
  './public/images/image1.jpg',
  './public/images/image2.jpg',
  './public/images/image3.jpg',
  './public/images/image4.jpg',
  './public/images/image5.jpg',
]

const outputFilePath = path.join(process.cwd(), 'src', 'data', 'imageData.ts')

async function processImage(imagePath) {
  return new Promise((resolve, reject) => {
    trace(
      imagePath,
      {
        threshold: 120,
        turdSize: 10,
        optTolerance: 0.4,
      },
      (err, svgContent) => {
        if (err) return reject(err)
        const polylines = (svgContent.match(/points="[^"]*"/g) || [])
          .map(p => p.replace('points="', '').replace('"', ''))
        resolve({
          originalSrc: imagePath.replace('./public', ''),
          polylines: polylines,
        })
      }
    )
  })
}

async function run() {
  const allImageData = []
  console.log('Starting image vectorization...')

  for (const imagePath of imagesToProcess) {
    try {
      const result = await processImage(imagePath)
      allImageData.push(result)
    } catch (error) {
      console.error(`Failed to process ${imagePath}:`, error)
    }
  }

  const fileContent = `
export interface ImageData {
  originalSrc: string
  polylines: string[]
}

export const imageData: ImageData[] = ${JSON.stringify(allImageData, null, 2)}
`
  fs.mkdirSync(path.dirname(outputFilePath), { recursive: true })
  fs.writeFileSync(outputFilePath, fileContent.trim())
  console.log(`\nSuccessfully generated SVG data at ${outputFilePath}`)
}

run()

