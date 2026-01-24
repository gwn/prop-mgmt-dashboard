const
    apiUrl = import.meta.env.VITE_API_URL,

    apiFetch = async ({method, path, headers, body}) => {
        const res = await fetch(`${apiUrl}${path}`, {method, headers, body})

        if (!res.ok)
            throw new Error('Fetching failed', res)

        return res.json()
    },

    getPropertyManagers = () =>
        apiFetch({path: '/managers?type=property_manager'}),

    getAccountants = () =>
        apiFetch({path: '/managers?type=accountant'}),

    getProperties = () =>
        apiFetch({path: '/properties'}),

    createProperty = data =>
        apiFetch({
            path: '/properties',
            method: 'post',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify(data),
        }),

    editProperty = (id, data) =>
        apiFetch({
            path: '/properties/' + id,
            method: 'put',
            headers: {'Content-type': 'application/json'},
            body: JSON.stringify(data),
        }),

    extractPropertyDeclarationPdf = pdfFile => {
        const formData = new FormData()
        formData.append('pdfFile', pdfFile)

        return apiFetch({
            path: '/extract-property-declaration-pdf',
            method: 'post',
            body: formData,
        })
    }


export {
    getPropertyManagers,
    getAccountants,
    getProperties,
    createProperty,
    editProperty,
    extractPropertyDeclarationPdf,
}
