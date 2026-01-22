const
    Anthropic = require('@anthropic-ai/sdk'),
    {PropertySchema} = require('../../schema'),
    {ANTHROPIC_API_KEY} = process.env


module.exports = {
    url: '/extract-property-declaration-pdf',
    method: 'post',

    schema: {
        description: 'Extract structured data from a Teilungserklärung PDF',
        consumes: ['multipart/form-data'],
        body: {
            type: 'object',
            required: ['pdfFile'],
            properties: {
                pdfFile: {
                    type: 'object',
                    format: 'binary',
                    description: 'A valid Teilungserklärung PDF file',
                }
            },
        },
        response: {
            200: PropertySchema,
        },
    },

    handler: async (req, rep) => {
        const file = req.body.pdfFile

        if (!/^application\/(pdf|octet-stream)$/.test(file.mimetype))
            return rep.status(400).send({
                error: 'Proper PDF file required'})

        const
            pdfBuffer = await file.toBuffer(),
            extractedPropertyRecord = await parseTeilunsomething(pdfBuffer)

        rep.send(extractedPropertyRecord)
    },
}


const
    anthropicApiCli = new Anthropic({apiKey: ANTHROPIC_API_KEY}),

    parseTeilunsomething = async pdfBuffer => {
        const
            model = 'claude-sonnet-4-5-20250929',

            prompt = `
                Extract structured data from the attached PDF file.
                Output only valid JSON, no extra text.

                Use following JSON schema:
                ${JSON.stringify(PropertySchema)}

                Notes:
                - This is a German Teilungserklärung file.
                - Parse §§1-3 carefully.
                - Handle grouped units (parking 09-13 as separate).
                - Convert 95,00 → 95.00. ca → approx.
                - Manager/accountant from §5.
            `,

            pdfBase64Content = pdfBuffer.toString('base64'),

            parseReqPayload = {
                model,
                max_tokens: 4096,
                messages: [{
                    role: 'user',
                    content: [
                        {type: 'text', text: prompt},
                        {
                            type: 'document',
                            source: {
                                type: 'base64',
                                media_type: 'application/pdf',
                                data: pdfBase64Content,
                            },
                        },
                    ],
                }],
            },

            resp = await anthropicApiCli.messages.create(parseReqPayload),

            respText = resp.content[0].text,

            // Extract JSON (remove markdown code blocks if present)
            jsonMatch =
                respText.match(/```json\n([\s\S]*?)\n```/)
                || respText.match(/```([\s\S]*?)```/),

            jsonText = jsonMatch ? jsonMatch[1] : respText

        return JSON.parse(jsonText)
    }
