const
    {GoogleGenerativeAI} = require('@google/generative-ai'),
    {PropertySchema} = require('../schema'),

    /* eslint-disable max-len */
    prompt = `
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
/* eslint-enable max-len */



module.exports = {
    url: '/extract',
    method: 'post',

    schema: {
        description: 'Extract structured data from Teilungserklärung PDF',
        consumes: ['multipart/form-data'],
        body: {
            type: 'object',
            required: ['file'],
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
        response: {
            200: PropertySchema,
        }
    },

    handler: async req => {
        const parts = req.parts()
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
        const model = genAI.getGenerativeModel({model: 'gemini-1.5-flash'})

        const result = await model.generateContent([
            {text: prompt},
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
    },
}
