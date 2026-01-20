import { useState } from 'react'
import * as Select from '@radix-ui/react-select'
import * as Label from '@radix-ui/react-label'

function StepGeneral({ formData, setFormData, onExtract, onNext }) {
  const [pdfFile, setPdfFile] = useState(null)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPdfFile(file)
      setFormData((prev) => ({ ...prev, declaration_file: file }))
    }
  }

  const handleExtractClick = async () => {
    if (!pdfFile) return
    await onExtract(pdfFile)
    // After extract, formData is already updated via App handler
  }

  const handleManagerChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      property_manager: {
        ...prev.property_manager,
        [field]: value
      }
    }))
  }

  const handleAccountantChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      accountant: {
        ...prev.accountant,
        [field]: value
      }
    }))
  }

  return (
    <div>
      <h1>Step 1: General Information</h1>

      <div>
        <Label.Root htmlFor="name">Property Name</Label.Root>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
        />
      </div>

      <div>
        <Label.Root htmlFor="unique_number">Unique Number</Label.Root>
        <input
          id="unique_number"
          type="text"
          value={formData.unique_number}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              unique_number: e.target.value
            }))
          }
        />
      </div>

      <div>
        <Label.Root>Management Type</Label.Root>
        <Select.Root
          value={formData.management_type}
          onValueChange={(val) =>
            setFormData((prev) => ({ ...prev, management_type: val }))
          }
        >
          <Select.Trigger>
            <Select.Value placeholder="Select type" />
            <Select.Icon>▼</Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content>
              <Select.Viewport>
                <Select.Item value="WEG">
                  <Select.ItemText>WEG</Select.ItemText>
                </Select.Item>
                <Select.Item value="MV">
                  <Select.ItemText>MV</Select.ItemText>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </div>

      <div>
        <h3>Property Manager</h3>
        <div>
          <Label.Root>Name</Label.Root>
          <input
            type="text"
            value={formData.property_manager.name}
            onChange={(e) => handleManagerChange('name', e.target.value)}
          />
        </div>
        <div>
          <Label.Root>Address</Label.Root>
          <input
            type="text"
            value={formData.property_manager.address}
            onChange={(e) => handleManagerChange('address', e.target.value)}
          />
        </div>
      </div>

      <div>
        <h3>Accountant</h3>
        <div>
          <Label.Root>Name</Label.Root>
          <input
            type="text"
            value={formData.accountant.name}
            onChange={(e) => handleAccountantChange('name', e.target.value)}
          />
        </div>
        <div>
          <Label.Root>Address</Label.Root>
          <input
            type="text"
            value={formData.accountant.address}
            onChange={(e) => handleAccountantChange('address', e.target.value)}
          />
        </div>
      </div>

      <div>
        <Label.Root htmlFor="declaration">Declaration of Division (PDF)</Label.Root>
        <input
          id="declaration"
          type="file"
          accept="application/pdf"
          onChange={handleFileChange}
        />
        {pdfFile && (
          <button type="button" onClick={handleExtractClick}>
            Extract Data from PDF
          </button>
        )}
      </div>

      <div>
        <button onClick={onNext} disabled={!formData.name.trim()}>
          Next → Buildings
        </button>
      </div>
    </div>
  )
}

export default StepGeneral