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

    extractPdf = file => {
        const formData = new FormData()
        formData.append('file', file)

        return apiFetch({
            path: '/extract',
            method: 'post',
            body: file,
        })
    }


export {
    getPropertyManagers,
    getAccountants,
    getProperties,
    createProperty,
    extractPdf,
}
