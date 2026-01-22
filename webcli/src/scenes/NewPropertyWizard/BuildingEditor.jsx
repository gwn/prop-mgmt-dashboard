import {useState, useEffect, useRef} from 'react'
import {Button, Dialog} from '@radix-ui/themes'
import {updateCollectionItem, readFile, parseAndValidateCSV} from '@/util'
import {Input, TextArea, Select, FileInput} from '@/ui'
import {UnitSchema} from '@/../../schema'


const emptyUnitState = {
    number: '',
    type: 'apartment',
    floor: '',
    entrance: '',
    size: '',
    co_ownership_share: '',
    construction_year: '',
    rooms: '',
    description: '',
}


export default ({
    value,
    onChange,
    onExit,
}) => {
    const
        [buildingState, setBuildingState] = useState(value),

        [bulkAddResult, setBulkAddResult] = useState(null),
        bulkAddElemRef = useRef(),

        updateBuilding = patch =>
            setBuildingState(prev => ({...prev, ...patch})),

        updateUnits = unitMutator =>
            setBuildingState(prev => ({
                ...prev,
                units: unitMutator(prev.units),
            })),

        addUnit = () =>
            updateUnits(prev => [...prev, emptyUnitState]),

        bulkAddUnits = unitRecords =>
            updateUnits(prev => [...prev, ...unitRecords]),

        updateUnit = (idx, patch) =>
            updateUnits(prev =>
                updateCollectionItem(prev, idx, patch)),

        deleteUnit = idx =>
            updateUnits(prev => [
                ...prev.slice(0, idx),
                ...prev.slice(idx + 1),
            ]),

        saveAndExit = () => {
            onChange(buildingState)
            onExit()
        },

        triggerBulkAddFileWidget = () =>
            bulkAddElemRef.current?.click(),

        handleBulkAdd = async files => {
            if (!files[0])
                return

            const
                fileContent = await readFile(files[0], 'text'),
                parsed = parseAndValidateCSV(fileContent, UnitSchema)

            setBulkAddResult(parsed)
            bulkAddUnits(parsed.valid)
        }


    return <>
        <h1 children={buildingState.name || 'New Building'} />

        <table className='summary'><tbody>
            <tr>
                <th>Name</th>

                <td><Input
                    value={buildingState.name}
                    onChange={val => updateBuilding({name: val})}
                /></td>
            </tr>

            <tr>
                <th>Street</th>

                <td><Input
                    value={buildingState.street}
                    onChange={val => updateBuilding({street: val})}
                /></td>
            </tr>

            <tr>
                <th>House Number</th>

                <td><Input
                    value={buildingState.house_number}
                    onChange={val => updateBuilding({house_number: val})}
                /></td>
            </tr>

            <tr>
                <th>Construction Year</th>

                <td><Input
                    type='number'
                    value={buildingState.construction_year}
                    onChange={val => updateBuilding({construction_year: val})}
                /></td>
            </tr>

            <tr>
                <th>Description</th>

                <td><TextArea
                    value={buildingState.description}
                    onChange={val => updateBuilding({description: val})}
                /></td>
            </tr>
        </tbody></table>

        <Button
            children='Save'
            onClick={saveAndExit}
        />

        <Button
            children='Cancel'
            onClick={onExit}
            color='red'
        />

        <hr />

        <h2>Units</h2>

        {buildingState.units.length > 0 &&
            <UnitListing
                items={buildingState.units}
                onChange={updateUnit}
                onDelete={deleteUnit}
            />}

        <Button
            children='Add New'
            onClick={addUnit}
        />

        <Button
            children='Import'
            onClick={triggerBulkAddFileWidget}
        />

        <FileInput
            ref={bulkAddElemRef}
            accept='text/csv'
            onChange={handleBulkAdd}
            style={{display: 'none'}}
        />

        <Dialog.Root
            open={bulkAddResult}
            onOpenChange={() => setBulkAddResult(null)}
        >
            {bulkAddResult &&
                <Dialog.Content aria-describedby={undefined}>
                    <Dialog.Title>
                        Successfully
                        added {bulkAddResult.valid.length} units
                    </Dialog.Title>

                    {bulkAddResult.invalid.length > 0 && <>
                        <p>
                            <strong>{bulkAddResult.invalid.length}</strong>
                            &nbsp;records couldn't be parsed / validated.
                            See errors below:
                        </p>

                        <pre>
                            {JSON.stringify(
                                bulkAddResult.invalid, false, 4)}
                        </pre>
                    </>}

                </Dialog.Content>
            }
        </Dialog.Root>
    </>
}


const UnitListing = ({items, onChange, onDelete}) =>
    <table className='excel'>
        <thead>
            <tr>
                <th/>
                <th>Number</th>
                <th>Type</th>
                <th>Floor</th>
                <th>Entrance</th>
                <th>Size</th>
                <th>CO Share</th>
                <th>Constr Year</th>
                <th>Rooms</th>
                <th>Description</th>
            </tr>
        </thead>

        <tbody>{items.map((u, i) =>
            <tr key={i}>
                <td><Button
                    children='-'
                    onClick={() => onDelete(i)}
                /></td>

                <td><Input
                    value={u.number}
                    onChange={val => onChange(i, {number: val})}
                    className='short'
                /></td>

                <td><Select
                    value={u.type}
                    onChange={val => onChange(i, {type: val})}
                    opts={{
                        Apartment: 'apartment',
                        Office: 'office',
                        Garden: 'garden',
                        Parking: 'parking',
                    }}
                    size='1'
                /></td>

                <td><Input
                    value={u.floor}
                    onChange={val => onChange(i, {floor: val})}
                /></td>

                <td><Input
                    value={u.entrance}
                    onChange={val => onChange(i, {entrance: val})}
                /></td>

                <td><Input
                    value={u.size}
                    onChange={val => onChange(i, {size: val})}
                    type='number'
                /></td>

                <td><Input
                    value={u.co_ownership_share}
                    onChange={val => onChange(i, {co_ownership_share: val})}
                    type='number'
                /></td>

                <td><Input
                    value={u.construction_year}
                    onChange={val => onChange(i, {construction_year: val})}
                    type='number'
                /></td>

                <td><Input
                    value={u.rooms}
                    onChange={val => onChange(i, {rooms: val})}
                    type='number'
                    className='short'
                /></td>

                <td><Input
                    value={u.description}
                    onChange={val => onChange(i, {description: val})}
                    className='long'
                /></td>
            </tr>,
        )}</tbody>
    </table>
