import { useState } from 'react'
import * as Label from '@radix-ui/react-label'

function StepBuildings({ buildings, setBuildings, onNext, onPrev }) {
  const [newBuilding, setNewBuilding] = useState({
    name: '',
    street: '',
    house_number: '',
    construction_year: '',
    description: ''
  })

  const handleInputChange = (field, value) => {
    setNewBuilding((prev) => ({ ...prev, [field]: value }))
  }

  const addBuilding = () => {
    if (!newBuilding.name.trim() || !newBuilding.street.trim()) return

    setBuildings((prev) => [
      ...prev,
      {
        ...newBuilding,
        construction_year: newBuilding.construction_year
          ? parseInt(newBuilding.construction_year, 10)
          : null,
        units: [] // initialize empty units array
      }
    ])

    setNewBuilding({
      name: '',
      street: '',
      house_number: '',
      construction_year: '',
      description: ''
    })
  }

  const removeBuilding = (index) => {
    setBuildings((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div>
      <h1>Step 2: Buildings</h1>

      <div>
        <h2>Add a Building</h2>

        <div>
          <Label.Root>Name (e.g. Haus A – Parkside)</Label.Root>
          <input
            type="text"
            value={newBuilding.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
          />
        </div>

        <div>
          <Label.Root>Street</Label.Root>
          <input
            type="text"
            value={newBuilding.street}
            onChange={(e) => handleInputChange('street', e.target.value)}
          />
        </div>

        <div>
          <Label.Root>House Number</Label.Root>
          <input
            type="text"
            value={newBuilding.house_number}
            onChange={(e) => handleInputChange('house_number', e.target.value)}
          />
        </div>

        <div>
          <Label.Root>Construction Year</Label.Root>
          <input
            type="number"
            value={newBuilding.construction_year}
            onChange={(e) => handleInputChange('construction_year', e.target.value)}
          />
        </div>

        <div>
          <Label.Root>Description (optional)</Label.Root>
          <textarea
            value={newBuilding.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </div>

        <button type="button" onClick={addBuilding}>
          Add Building
        </button>
      </div>

      <h2>Added Buildings ({buildings.length})</h2>

      {buildings.length === 0 ? (
        <p>No buildings added yet.</p>
      ) : (
        <ul>
          {buildings.map((building, index) => (
            <li key={index}>
              <strong>{building.name}</strong>
              <br />
              {building.street} {building.house_number}
              {building.construction_year && ` • ${building.construction_year}`}
              <br />
              Units: {building.units.length}
              <br />
              <button type="button" onClick={() => removeBuilding(index)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <button onClick={onPrev}>← Back to General</button>
        <button
          onClick={onNext}
          disabled={buildings.length === 0}
        >
          Next → Units
        </button>
      </div>
    </div>
