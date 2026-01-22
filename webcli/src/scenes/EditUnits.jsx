import {useState} from 'react'
import Papa from 'papaparse'
import Ajv from 'ajv'
import {Button, Dialog} from '@radix-ui/themes'
import {UnitSchema} from '../../../schema'
import {readFile} from '../util'
import {Input, TextArea, Select, FileInput} from '../ui'

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
            size: null,
            co_ownership_share: null,
            construction_year: null,
            rooms: null,
            description: '',
        },

        [newUnit, setNewUnit] = useState(emptyUnitState),

        [selectedBuildingIdx, setSelectedBuildingIdx] = useState(0),

        [bulkAddResult, setBulkAddResult] = useState(null),

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
            mutateUnits(units => units.filter((_, i) => i !== unitIdx)),

        handleBulkAdd = async files => {
            const
                fileContent = await readFile(files[0], 'text'),
                parsed = parseAndValidateCSV(fileContent, UnitSchema)

            setBulkAddResult(parsed)
            mutateUnits(units => [...units, ...parsed.valid])
        }

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
                            <Button
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

                <Button
                    onClick={addUnit}
                    children='Add Unit'
                />

                <FileInput
                    label='Bulk add'
                    type='file'
                    onChange={handleBulkAdd}
                />
            </div>

            <div>
                <Button
                    onClick={onPrev}
                    children='← Back to Buildings'
                />

                <Button
                    onClick={onSubmit}
                    children='Submit Property'
                />
            </div>

            <Dialog.Root
                open={bulkAddResult}
                onOpenChange={() => setBulkAddResult(null)}
            >
                {bulkAddResult &&
                    <Dialog.Content>
                        <p>
                            Successfully added
                            {bulkAddResult.valid.length} units.
                        </p>

                        <p>

                            See below for a debug log containing the records
                            that couldn't be parsed / validated along with the
                            relevant errors.

                            <pre>
                                {JSON.stringify(
                                    bulkAddResult.invalid, false, 4)}
                            </pre>
                        </p>
                    </Dialog.Content>
                }
            </Dialog.Root>
        </div>
    )
}

const
    parseAndValidateCSV = (csvData, schema) => {
        const
            ajv = new Ajv(),
            validate = ajv.compile(schema),
            headers = schema.required,
            parsed = Papa.parse(csvData, {
                delimiter: ',',
                skipEmptyLines: true,
            }),
            valid = [],
            invalid = []

        parsed.data.forEach((row, index) => {
            const record = {}

            headers.forEach((header, i) => {
                const value = row[i]
                if (value === '') {
                    return
                }
                const propertyType = schema.properties[header].type

                if (propertyType === 'integer') {
                    record[header] = parseInt(value, 10)
                } else if (propertyType === 'number') {
                    record[header] = parseFloat(value)
                } else {
                    record[header] = value
                }
            })

            if (validate(record))
                valid.push(record)

            else {
                invalid.push({
                    row: index + 1,
                    data: record,
                    errors: validate.errors
                })
            }
        })

        return {valid, invalid}
    }
