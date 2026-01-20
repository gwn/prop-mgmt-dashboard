const API_BASE = '/api'

export async function getProperties() {
  const res = await fetch(`${API_BASE}/properties`)
  if (!res.ok) throw new Error('Failed to fetch properties')
  return res.json()
}

export async function extractPdf(file) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(`${API_BASE}/extract`, {
    method: 'POST',
    body: formData
  })

  if (!res.ok) throw new Error('Extraction failed')
  return res.json()
}

export async function createProperty(data, file = null) {
  const formData = new FormData()
  formData.append('data', JSON.stringify(data))
  if (file) formData.append('declaration', file)

  const res = await fetch(`${API_BASE}/properties`, {
    method: 'POST',
    body: formData
  })

  if (!res.ok) throw new Error('Creation failed')
  return res.json()
}
