import {useState} from 'react'
import {Input, TextArea, Select} from '../ui'


export default ({
    formData,
    onUpdate,
    onPrev,
    onSubmit,
}) => {
    const
        emptyUnitState = {
            number: '',
            type: 'apartment',
            floor: '',
            entrance: '',
            size: undefined,
            co_ownership_share: undefined,
            construction_year: undefined,
            rooms: '',
            description: '',
        },

        [newUnit, setNewUnit] = useState(emptyUnitState),

        [selectedBuildingIdx, setSelectedBuildingIdx] = useState(0),

        selectedBuilding =
            formData.buildings[selectedBuildingIdx] || {units: []},

        handleBuildingSelect = idx =>
            setSelectedBuildingIdx(idx),

        updateUnit = patch =>
            setNewUnit(prev => ({...prev, ...patch})),

        mutateUnits = unitMutator =>
            onUpdate(prev => ({
                ...prev,

                buildings: formData.buildings.map((bld, idx) =>
                    idx !== selectedBuildingIdx
                        ? bld
                        : {
                            ...bld,
                            units: unitMutator(bld.units),
                        },
                ),
            })),

        addUnit = () => {
            if (!newUnit.number.trim())
                return

            mutateUnits(units => [...units, newUnit])

            setNewUnit(emptyUnitState)
        },

        removeUnit = unitIdx =>
            mutateUnits(units => units.filter((_, i) => i !== unitIdx))


    return (
        <div>
            <h1>Step 3: Units</h1>

            {formData.buildings.length > 1 &&
                <div>
                    <Select
                        label='Select Building'
                        value={selectedBuildingIdx}
                        onChange={handleBuildingSelect}
                        opts={Object.fromEntries(
                            formData.buildings.map((b, i) => [b.name, i]))}
                    />
                </div>}

            <h2>
            Units in {selectedBuilding.name} ({selectedBuilding.units.length})
            </h2>

            {selectedBuilding.units.length === 0 ? (
                <p>No units added yet for this building.</p>
            ) : (
                <ul>
                    {selectedBuilding.units.map((unit, idx) => (
                        <li key={idx}>
                            <strong>{unit.number}</strong> • {unit.type}
                            <br />{unit.floor || '—'} {unit.entrance ? `(${unit.entrance})` : ''}
                            <br />Size: {unit.size ? `${unit.size} m²` : '—'} •
                            {' '}
                            Share: {unit.co_ownership_share ? `${unit.co_ownership_share}/1000` : '—'}
                            <br />
                            Rooms: {unit.rooms || '—'} • Year: {unit.construction_year || '—'}
                            <br />
                            {unit.description}
                            <br />
                            <button
                                type='button'
                                onClick={() => removeUnit(idx)}
                                children='Remove'
                            />
                        </li>
                    ))}
                </ul>
            )}

            <div>
                <h3>Add Unit to {selectedBuilding.name}</h3>

                <div>
                    <Input
                        label='Number'
                        value={newUnit.number}
                        onChange={val => updateUnit({number: val})}
                    />
                </div>

                <div>
                    <Select
                        label='Type'
                        value={newUnit.type}
                        onChange={val => updateUnit({type: val})}
                        opts={{
                            Apartment: 'apartment',
                            Office: 'office',
                            Garden: 'garden',
                            Parking: 'parking',
                        }}
                    />
                </div>

                <div>
                    <Input
                        label='Floor'
                        value={newUnit.floor}
                        onChange={val => updateUnit({floor: val})}
                    />
                </div>

                <div>
                    <Input
                        label='Entrance'
                        value={newUnit.entrance}
                        onChange={val => updateUnit({entrance: val})}
                    />
                </div>

                <div>
                    <Input
                        label='Size'
                        type='number'
                        value={newUnit.size}
                        onChange={val => updateUnit({size: val})}
                    />
                </div>

                <div>
                    <Input
                        label='Co-ownership share'
                        type='number'
                        step='0.1'
                        value={newUnit.co_ownership_share}
                        onChange={val => updateUnit({co_ownership_share: val})}
                    />
                </div>

                <div>
                    <Input
                        label='Construction Year'
                        type='number'
                        value={newUnit.construction_year}
                        onChange={val => updateUnit({construction_year: val})}
                    />
                </div>

                <div>
                    <Input
                        label='Rooms'
                        type='number'
                        value={newUnit.rooms}
                        onChange={val => updateUnit({rooms: val})}
                    />
                </div>

                <div>
                    <TextArea
                        label='Description'
                        value={newUnit.description}
                        onChange={val => updateUnit({description: val})}
                    />
                </div>

                <button
                    type='button'
                    onClick={addUnit}
                    children='Add Unit'
                />
            </div>

            <div>
                <button
                    onClick={onPrev}
                    children='← Back to Buildings'
                />

                <button
                    onClick={onSubmit}
                    children='Submit Property'
                />
            </div>
        </div>
    )
}
