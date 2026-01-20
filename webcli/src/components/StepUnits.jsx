import { useState } from 'react'
import * as Select from '@radix-ui/react-select'
import * as Label from '@radix-ui/react-label'

function StepUnits({ buildings, setBuildings, onSubmit, onPrev }) {
  const [selectedBuildingIndex, setSelectedBuildingIndex] = useState(0)
  const [newUnit, setNewUnit] = useState({
    number: '',
    type: 'Apartment',
    floor: '',
    entrance: '',
    size: '',
    co_ownership_share: '',
    construction_year: '',
    rooms: '',
    description: ''
  })

  const currentBuilding = buildings[selectedBuildingIndex] || { units: [] }

  const handleInputChange = (field, value) => {
    setNewUnit((prev) => ({ ...prev, [field]: value }))
  }

  const addUnit = () => {
    if (!newUnit.number.trim()) return

    const updatedBuildings = [...buildings]
    const parsedUnit = {
      ...newUnit,
      size: newUnit.size ? parseFloat(newUnit.size) : null,
      co_ownership_share: newUnit.co_ownership_share
        ? parseFloat(newUnit.co_ownership_share)
        : null,
      construction_year: newUnit.construction_year
        ? parseInt(newUnit.construction_year, 10)
        : null,
      rooms: newUnit.rooms ? parseInt(newUnit.rooms, 10) : null
    }

    updatedBuildings[selectedBuildingIndex].units.push(parsedUnit)
    setBuildings(updatedBuildings)

    setNewUnit({
      number: '',
      type: 'Apartment',
      floor: '',
      entrance: '',
      size: '',
      co_ownership_share: '',
      construction_year: '',
      rooms: '',
      description: ''
    })
  }

  const removeUnit = (unitIndex) => {
    const updatedBuildings = [...buildings]
    updatedBuildings[selectedBuildingIndex].units = updatedBuildings[
      selectedBuildingIndex
    ].units.filter((_, i) => i !== unitIndex)
    setBuildings(updatedBuildings)
  }

  const handleBuildingSelect = (index) => {
    setSelectedBuildingIndex(parseInt(index, 10))
  }

  return (
    <div>
      <h1>Step 3: Units</h1>

      {buildings.length > 1 && (
        <div>
          <Label.Root>Select Building</Label.Root>
          <Select.Root
            value={selectedBuildingIndex.toString()}
            onValueChange={handleBuildingSelect}
          >
            <Select.Trigger>
              <Select.Value placeholder="Select building" />
              <Select.Icon>▼</Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content>
                <Select.Viewport>
                  {buildings.map((b, i) => (
                    <Select.Item key={i} value={i.toString()}>
                      <Select.ItemText>{b.name}</Select.ItemText>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>
      )}

      <h2>
        Units in {currentBuilding.name} ({currentBuilding.units.length})
      </h2>

      {currentBuilding.units.length === 0 ? (
        <p>No units added yet for this building.</p>
      ) : (
        <ul>
          {currentBuilding.units.map((unit, idx) => (
            <li key={idx}>
              <strong>{unit.number}</strong> • {unit.type}
              <br />
              {unit.floor || '—'} {unit.entrance ? `(${unit.entrance})` : ''}
              <br />
              Size: {unit.size ? `${unit.size} m²` : '—'} •
              {' '}
              Share: {unit.co_ownership_share ? `${unit.co_ownership_share}/1000` : '—'}
              <br />
              Rooms: {unit.rooms || '—'} • Year: {unit.construction_year || '—'}
              <br />
              {unit.description}
              <br />
              <button type="button" onClick={() => removeUnit(idx)}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}

      <div>
        <h3>Add Unit to {currentBuilding.name}</h3>

        <div>
          <Label.Root>Number (e.g. 01, TG-01, 14)</Label.Root>
          <input
            type="text"
            value={newUnit.number}
            onChange={(e) => handleInputChange('number', e.target.value)}
          />
        </div>

        <div>
          <Label.Root>Type</Label.Root>
          <Select.Root
            value={newUnit.type}
            onValueChange={(val) => handleInputChange('type', val)}
          >
            <Select.Trigger>
              <Select.Value />
              <Select.Icon>▼</Select.Icon>
            </Select.Trigger>

            <Select.Portal>
              <Select.Content>
                <Select.Item value="Apartment">
                  <Select.ItemText>Apartment</Select.ItemText>
                </Select.Item>
                <Select.Item value="Office">
                  <Select.ItemText>Office</Select.ItemText>
                </Select.Item>
                <Select.Item value="Garden">
                  <Select.ItemText>Garden</Select.ItemText>
                </Select.Item>
                <Select.Item value="Parking">
                  <Select.ItemText>Parking</Select.ItemText>
                </Select.Item>
              </Select.Content>
            </Select.Portal>
          </Select.Root>
        </div>

        <div>
          <Label.Root>Floor (e.g. Erdgeschoss, 1 Obergeschoss)</Label.Root>
          <input
            type="text"
            value={newUnit.floor}
            onChange={(e) => handleInputChange('floor', e.target.value)}
          />
        </div>

        <div>
          <Label.Root>Entrance (e.g. Eingang A)</Label.Root>
          <input
            type="text"
            value={newUnit.entrance}
            onChange={(e) => handleInputChange('entrance', e.target.value)}
          />
        </div>

        <div>
          <Label.Root>Size (m², e.g. 95.00)</Label.Root>
          <input
            type="number"
            step="0.01"
            value={newUnit.size}
            onChange={(e) => handleInputChange('size', e.target.value)}
          />
        </div>

        <div>
          <Label.Root>Co-ownership Share (e.g. 110.0 for 110/1000)</Label.Root>
          <input
            type="number"
            step="0.1"
            value={newUnit.co_ownership_share}
            onChange={(e) => handleInputChange('co_ownership_share', e.target.value)}
          />
        </div>

        <div>
          <Label.Root>Construction Year</Label.Root>
          <input
            type="number"
            value={newUnit.construction_year}
            onChange={(e) => handleInputChange('construction_year', e.target.value)}
          />
        </div>

        <div>
          <Label.Root>Rooms (e.g. 3)</Label.Root>
          <input
            type="number"
            value={newUnit.rooms}
            onChange={(e) => handleInputChange('rooms', e.target.value)}
          />
        </div>

        <div>
          <Label.Root>Description</Label.Root>
          <textarea
            value={newUnit.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
        </div>

        <button type="button" onClick={addUnit}>
          Add Unit
        </button>
      </div>

      <div>
        <button onClick={onPrev}>← Back to Buildings</button>
        <button onClick={onSubmit}>
          Submit Property
        </button>
      </div>
    </div>
  )
}

export default StepUnits