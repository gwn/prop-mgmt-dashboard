const { connectDb } = require('../db')
const { GoogleGenerativeAI } = require('@google/generative-ai')
const path = require('path')
const fs = require('fs').promises

async function routes(fastify) {
  // GET /properties
  fastify.get('/properties', {
    schema: {
      description: 'List all properties with nested buildings and units',
      tags: ['properties'],
      response: {
        200: {
          type: 'array',
          items: { $ref: '#/components/schemas/PropertySchema' }
        }
      }
    }
  }, async () => {
    const db = await connectDb()
    const properties = await db.properties.find({}, { order: [{ field: 'id' }] })

    for (const prop of properties) {
      prop.buildings = await db.buildings.find(
        { property_id: prop.id },
        { order: [{ field: 'id' }] }
      )
      for (const building of prop.buildings) {
        building.units = await db.units.find(
          { building_id: building.id },
          { order: [{ field: 'number' }] }
        )
      }
      if (prop.property_manager_id) {
        prop.property_manager = await db.property_managers.findOne(
          { id: prop.property_manager_id }
        )
      }
      if (prop.accountant_id) {
        prop.accountant = await db.accountants.findOne(
          { id: prop.accountant_id }
        )
      }
    }
    return properties
  })

  // POST /properties (multipart)
  fastify.post('/properties', {
    schema: {
      description: 'Create property (multipart: data JSON + optional declaration file)',
      tags: ['properties'],
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        properties: {
          data: {
            type: 'string',
            description: 'JSON string matching PropertyInputSchema'
          },
          declaration: {
            isFile: true,
            description: 'Teilungserklärung PDF (optional)'
          }
        },
        required: ['data']
      },
      response: {
        200: {
          type: 'object',
          properties: {
            id: { type: 'integer' },
            message: { type: 'string' }
          }
        }
      }
    }
  }, async (request) => {
    const db = await connectDb()
    const parts = request.parts()

    let dataJson = null
    let fileBuffer = null
    let filename = null

    for await (const part of parts) {
      if (part.file) {
        fileBuffer = await part.toBuffer()
        filename = part.filename
      } else if (part.fieldname === 'data') {
        dataJson = JSON.parse(part.value)
      }
    }

    if (!dataJson) {
      throw new Error('Missing "data" JSON field')
    }

    let filePath = null
    if (fileBuffer && filename) {
      const uploadsDir = path.join(__dirname, '..', 'uploads')
      await fs.mkdir(uploadsDir, { recursive: true })
      const safeName = `${Date.now()}-${filename.replace(/[^a-zA-Z0-9.]/g, '_')}`
      filePath = path.join('uploads', safeName)
      await fs.writeFile(path.join(__dirname, '..', filePath), fileBuffer)
      dataJson.declaration_file_path = `/${filePath}`
    }

    // Manager / Accountant handling
    if (dataJson.property_manager) {
      const existing = await db.property_managers.findOne({
        name: dataJson.property_manager.name
      })
      dataJson.property_manager_id = existing
        ? existing.id
        : (await db.property_managers.insert(dataJson.property_manager)).id
      delete dataJson.property_manager
    }
    if (dataJson.accountant) {
      const existing = await db.accountants.findOne({
        name: dataJson.accountant.name
      })
      dataJson.accountant_id = existing
        ? existing.id
        : (await db.accountants.insert(dataJson.accountant)).id
      delete dataJson.accountant
    }

    // Deep insert
    const inserted = await db.properties.insert(dataJson)

    return { id: inserted.id, message: 'Property created (with deep insert)' }
  })

  // POST /extract
  fastify.post('/extract', {
    schema: {
      description: 'Extract structured data from Teilungserklärung PDF',
      tags: ['extract'],
      consumes: ['multipart/form-data'],
      body: {
        type: 'object',
        properties: {
          file: { isFile: true }
        },
        required: ['file']
      },
      response: {
        200: { $ref: '#/components/schemas/ExtractResponseSchema' }
      }
    }
  }, async (request) => {
    const parts = request.parts()
    let pdfBuffer = null

    for await (const part of parts) {
      if (part.file) {
        pdfBuffer = await part.toBuffer()
        break
      }
    }

    if (!pdfBuffer) {
      throw new Error('No PDF file uploaded')
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `
Extract structured data from this German Teilungserklärung PDF. Output ONLY valid JSON, no extra text. Use this exact schema:

{
  "name": string,
  "unique_number": string,
  "management_type": "WEG" | "MV",
  "total_mea": number,
  "property_manager": { "name": string, "address": string | null, "notes": string | null },
  "accountant": { "name": string, "address": string | null, "notes": string | null },
  "buildings": [
    {
      "name": string,
      "street": string,
      "house_number": string,
      "construction_year": number | null,
      "description": string | null,
      "units": [
        {
          "number": string,
          "type": "Apartment" | "Office" | "Garden" | "Parking",
          "floor": string | null,
          "entrance": string | null,
          "size": number | null,
          "co_ownership_share": number | null,
          "construction_year": number | null,
          "rooms": number | null,
          "description": string | null
        }
      ]
    }
  ]
}

Parse §§1-3 carefully. Handle grouped units (parking 09-13 as separate). Convert 95,00 → 95.00. ca → approx. Manager/accountant from §5.
`

    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBuffer.toString('base64')
        }
      }
    ])

    let text = result.response.text()
    text = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim()

    let extracted
    try {
      extracted = JSON.parse(text)
    } catch (e) {
      throw new Error('Invalid JSON from Gemini: ' + e.message)
    }

    return extracted
  })
}

module.exports = routes