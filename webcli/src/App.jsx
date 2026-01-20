import { useState } from 'react'

import Dashboard from './components/Dashboard.jsx'
import StepGeneral from './components/StepGeneral.jsx'
import StepBuildings from './components/StepBuildings.jsx'
import StepUnits from './components/StepUnits.jsx'

import {
  getProperties,
  extractPdf,
  createProperty
} from './components/api.js'

function App() {
  const [step, setStep] = useState(0) // 0: dashboard, 1-3: creation
  const [properties, setProperties] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    unique_number: '',
    management_type: 'WEG',
    property_manager: { name: '', address: '' },
    accountant: { name: '', address: '' },
    declaration_file: null, // File object
    buildings: [] // [{ name, street, house_number, construction_year, description, units: [] }]
  })

  const loadProperties = async () => {
    const data = await getProperties()
    setProperties(data)
  }

  const handleExtract = async (file) => {
    const extracted = await extractPdf(file)
    setFormData((prev) => ({
      ...prev,
      name: extracted.name || prev.name,
      unique_number: extracted.unique_number || prev.unique_number,
      management_type: extracted.management_type || prev.management_type,
      property_manager: extracted.property_manager || prev.property_manager,
      accountant: extracted.accountant || prev.accountant,
      buildings: extracted.buildings || []
    }))
  }

  const handleSubmit = async () => {
    const dataToSend = { ...formData }
    delete dataToSend.declaration_file // handled separately

    await createProperty(dataToSend, formData.declaration_file)
    setStep(0)
    loadProperties()
  }

  const nextStep = () => setStep((s) => s + 1)
  const prevStep = () => setStep((s) => s - 1)

  return (
    <div>
      {step === 0 && (
        <Dashboard
          properties={properties}
          onCreateNew={() => {
            // Optional: reset formData here if needed
            setFormData({
              name: '',
              unique_number: '',
              management_type: 'WEG',
              property_manager: { name: '', address: '' },
              accountant: { name: '', address: '' },
              declaration_file: null,
              buildings: []
            })
            setStep(1)
          }}
          loadProperties={loadProperties}
        />
      )}

      {step === 1 && (
        <StepGeneral
          formData={formData}
          setFormData={setFormData}
          onExtract={handleExtract}
          onNext={nextStep}
        />
      )}

      {step === 2 && (
        <StepBuildings
          buildings={formData.buildings}
          setBuildings={(b) => setFormData((p) => ({ ...p, buildings: b }))}
          onNext={nextStep}
          onPrev={prevStep}
        />
      )}

      {step === 3 && (
        <StepUnits
          buildings={formData.buildings}
          setBuildings={(b) => setFormData((p) => ({ ...p, buildings: b }))}
          onSubmit={handleSubmit}
          onPrev={prevStep}
        />
      )}
    </div>
  )
}

export default App
