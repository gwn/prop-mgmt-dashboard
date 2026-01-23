import Ajv from 'ajv'
import Papa from 'papaparse'


const
    updateCollectionItem = (coll, targetItemIdx, patch) =>
        [
            ...coll.slice(0, targetItemIdx),
            {...coll[targetItemIdx], ...patch},
            ...coll.slice(targetItemIdx + 1),
        ],


    readFile = (file, format = 'text') => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            reader.onerror = error => reject(error)

            reader.onload = () =>
                resolve(format === 'base64'
                    ? reader.result.split(',')[1]
                    : reader.result)

            const method = {
                text: 'readAsText',
                base64: 'readAsDataURL',
            }[
                format
            ]

            reader[method](file)
        })
    },


    validateFormData = (data, schema) => {
        const
            validate = new Ajv({allErrors: true}).compile(schema),

            validationSuccessful = validate(data),

            errors = Object.fromEntries(
                (validate.errors || [])
                    .filter(e => e.keyword !== 'required')
                    .map(e => [
                        e.instancePath.slice(1),
                        e.message,
                    ]),
            )

        return errors
    },


    parseAndValidateCSV = (csvData, schema) => {
        const
            ajv = new Ajv(),
            validate = ajv.compile(schema),
            headers = schema.required,
            parsed = Papa.parse(csvData, {
                delimiter: ',',
                skipEmptyLines: true,
            }),
            valid = [],
            invalid = []

        parsed.data.forEach((row, index) => {
            const record = {}

            headers.forEach((header, i) => {
                const value = row[i]
                if (value === '') {
                    return
                }
                const propertyType = schema.properties[header].type

                if (propertyType === 'integer') {
                    record[header] = parseInt(value, 10)
                } else if (propertyType === 'number') {
                    record[header] = parseFloat(value)
                } else {
                    record[header] = value
                }
            })

            if (validate(record))
                valid.push(record)

            else {
                invalid.push({
                    row: index + 1,
                    data: record,
                    errors: validate.errors,
                })
            }
        })

        return {valid, invalid}
    }


export {
    updateCollectionItem,
    readFile,
    validateFormData,
    parseAndValidateCSV,
}
