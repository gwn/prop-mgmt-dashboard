import {useState} from 'react'
import {mapKeys, updateCollectionItem, validateFormData} from '@/util'
import {Button, Input, TextArea, Select, BulkAdd, ExcelTable} from '@/ui'
import {BuildingSchema, UnitSchema} from '@/../../schema'
import s from './editor.module.css'


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


export default function BuildingEditor({
    value,
    onSubmit,
    onCancel,
}) {
    const
        [buildingState, setBuildingState] = useState(value),
        [formErrors, setFormErrors] = useState({}),

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

        handleSubmit = () => {
            const errors = validateFormData(buildingState, BuildingSchema)

            setFormErrors(errors)

            if (Object.keys(errors).length === 0)
                onSubmit(buildingState)
        }


    return <>
        <h1 children={buildingState.name || 'New Building'} />

        <hr />

        <ul className={s.form}>
            <li><Input
                autoFocus
                placeholder='Name'
                value={buildingState.name}
                onChange={val => updateBuilding({name: val})}
                error={formErrors.name}
            /></li>

            <li>
                <Input
                    placeholder='Street'
                    value={buildingState.street}
                    onChange={val => updateBuilding({street: val})}
                    error={formErrors.street}
                    style={{width: 250}}
                />

                <Input
                    placeholder='No'
                    value={buildingState.house_number}
                    onChange={val => updateBuilding({house_number: val})}
                    error={formErrors.house_number}
                    style={{width: 60}}
                />
            </li>

            <li><Input
                placeholder='Construction Year'
                type='number'
                value={buildingState.construction_year}
                onChange={val => updateBuilding({construction_year: val})}
                error={formErrors.construction_year}
            /></li>

            <li><TextArea
                placeholder='Description'
                value={buildingState.description}
                onChange={val => updateBuilding({description: val})}
                error={formErrors.description}
            /></li>
        </ul>

        <hr />

        <Button
            children='Save'
            onClick={handleSubmit}
        />

        <Button
            children='Cancel'
            onClick={onCancel}
            color='red'
        />

        <hr />

        <h2>Units</h2>

        <ExcelTable
            items={buildingState.units}
            schema={[
                ['No', 'text', 'short', 'number'],
                ['Type', 'text', 'mid', (item, i) =>
                    <Select
                        size='1'
                        value={item.type}
                        onChange={val => updateUnit(i, {type: val})}
                        opts={{
                            Apartment: 'apartment',
                            Office: 'office',
                            Garden: 'garden',
                            Parking: 'parking',
                        }}
                    />],
                ['Floor', 'text', 'long', 'floor'],
                ['Entrance', 'text', 'long', 'entrance'],
                ['Size', 'number', 'short', 'size'],
                ['CO Share', 'number', 'short', 'co_ownership_share'],
                ['Constr Yr', 'number', 'short', 'construction_year'],
                ['Rooms', 'number', 'short', 'rooms'],
                ['Description', 'text', 'longer', 'description'],
            ]}
            formErrors={
                mapKeys(formErrors, (v, k) =>
                    k.match(/^units\/(.*)$/)?.[1])}
            onChange={updateUnit}
            onAdd={addUnit}
            onDelete={deleteUnit}
        />

        <BulkAdd
            jsonSchema={UnitSchema}
            onComplete={parsed => bulkAddUnits(parsed.valid)}
        />
    </>
}
