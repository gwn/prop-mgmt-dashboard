async function readFile(file, format = 'text') {
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
}


export {
    readFile,
}
