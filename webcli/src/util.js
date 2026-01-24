import Ajv from 'ajv'
import Papa from 'papaparse'


const
    noop = () => {},


    clone = obj => {
        if (obj === null || typeof obj !== 'object')
            return obj

        if (Array.isArray(obj))
            return [...obj]

        return {...obj}
    },


    mapKeys = (obj, mapper) =>
        Object.fromEntries(
            Object.entries(obj)
                .map(([k, v]) => [mapper(v, k), v])),


    groupBy = (collection, keySelector) =>
        collection.reduce(
            (grouped, item) => {
                const key =
                    typeof keySelector === 'function'
                        ? keySelector(item)
                        : item[keySelector]

                if (!grouped[key])
                    grouped[key] = []

                grouped[key].push(item)

                return grouped
            },
            {},
        ),


    keyBy = (collection, keySelector) =>
        Object.fromEntries(
            Object.entries(
                groupBy(collection, keySelector),
            )
                .map(([k ,v]) => [k, v[0]]),
        ),


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


    base64ToFile = (base64String, filename, mimeType) => {
        const
            base64 = base64String.split(',')[1] || base64String,
            byteString = atob(base64),
            ab = new ArrayBuffer(byteString.length),
            ia = new Uint8Array(ab)

        for (let i = 0; i < byteString.length; i++)
            ia[i] = byteString.charCodeAt(i)

        const blob = new Blob([ab], {type: mimeType})

        return new File([blob], filename, {type: mimeType})
    },


    validateFormData = (data, schema) => {
        const validate = new Ajv({allErrors: true}).compile(schema)

        validate(data)

        const errors =
            Object.fromEntries(
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
    noop,
    clone,
    mapKeys,
    groupBy,
    keyBy,
    updateCollectionItem,
    readFile,
    base64ToFile,
    validateFormData,
    parseAndValidateCSV,
}
