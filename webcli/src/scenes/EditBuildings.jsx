import {useState} from 'react'
import {Input, TextArea} from '../ui'


export default ({
    formData,
    onUpdate,
    onPrev,
    onNext,
}) => {
    const
        emptyBuildingState = {
            name: '',
            street: '',
            house_number: '',
            construction_year: '',
            description: '',
        },

        [newBuilding, setNewBuilding] = useState(emptyBuildingState),

        updateBuilding = patch =>
            setNewBuilding(prev => ({...prev, ...patch})),

        addBuilding = () => {
            if (!newBuilding.name.trim() || !newBuilding.street.trim())
                return

            onUpdate({
                buildings: [...formData.buildings, {
                    ...newBuilding,
                    construction_year: newBuilding.construction_year
                        ? parseInt(newBuilding.construction_year, 10)
                        : null,
                    units: [],
                }],
            })

            setNewBuilding(emptyBuildingState)
        },

        removeBuilding = idx =>
            onUpdate(prev => ({
                ...prev,
                buildings: prev.buildings.filter((_, i) => i !== idx),
            }))


    return (
        <div>
            <h1>Step 2: Buildings</h1>

            <div>
                <h2>Add a Building</h2>

                <div>
                    <Input
                        label='Name'
                        value={newBuilding.name}
                        onChange={val => updateBuilding({name: val})}
                    />
                </div>

                <div>
                    <Input
                        label='Street'
                        value={newBuilding.street}
                        onChange={val => updateBuilding({street: val})}
                    />
                </div>

                <div>
                    <Input
                        label='House Number'
                        value={newBuilding.house_number}
                        onChange={val => updateBuilding({house_number: val})}
                    />
                </div>

                <div>
                    <Input
                        label='Construction Year'
                        type='number'
                        value={newBuilding.construction_year}
                        onChange={val =>
                            updateBuilding({construction_year: val})}
                    />
                </div>

                <div>
                    <TextArea
                        label='Description'
                        value={newBuilding.description}
                        onChange={val => updateBuilding({description: val})}
                    />
                </div>

                <button
                    type="button"
                    onClick={addBuilding}
                    children='Add Building'
                />
            </div>

            <h2>Added Buildings ({formData.buildings.length})</h2>

            {formData.buildings.length === 0 ? (
                <p>No buildings added yet.</p>
            ) : (
                <ul>
                    {formData.buildings.map((building, idx) => (
                        <li key={idx}>
                            <strong>{building.name}</strong>

                            <br />{building.street} {building.house_number}
                            {building.construction_year
                                && ` • ${building.construction_year}`}

                            <br /> Units: {building.units.length}

                            <br /><button
                                type="button"
                                onClick={() => removeBuilding(idx)}
                                children='Remove'
                            />
                        </li>
                    ))}
                </ul>
            )}

            <div>
                <button
                    onClick={onPrev}
                    children='← Back to General'
                />

                <button
                    onClick={onNext}
                    disabled={formData.buildings.length === 0}
                    children='Next → Units'
                />
            </div>
        </div>
    )
}
