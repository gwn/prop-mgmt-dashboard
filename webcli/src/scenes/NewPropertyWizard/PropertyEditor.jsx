import {useState, useRef} from 'react'
import {Button, Dialog} from '@radix-ui/themes'
import {readFile, parseAndValidateCSV} from '@/util'
import {Input, Select, FileInput} from '@/ui'
import {BuildingSchema} from '@/../../schema'


const emptyManagerState = {name: '', address: ''}


export default function PropertyEditor({
    value,
    onChange,
    onBuildingChange,
    propManagers = [],
    accountants = [],
    onManagerAdd,
    onBuildingAdd,
    onBuildingBulkAdd,
    onBuildingDelete,
    onBuildingEdit,
    onSubmit,
}) {
    const
        [newManagerType, setNewManagerType] = useState(),
        [newManager, setNewManager] = useState(emptyManagerState),
        [managerDialogOpen, setManagerDialogOpen] = useState(false),
        [bulkAddResult, setBulkAddResult] = useState(null),

        updateNewManager =
            patch => setNewManager(m => ({...m, ...patch})),

        openNewManagerDialog = managerType => {
            setNewManagerType(managerType)
            setManagerDialogOpen(true)
        },

        createNewManager = () => {
            const id = onManagerAdd(newManagerType, newManager)

            onChange({[newManagerType + '_id']: id})
            setNewManager(emptyManagerState)
            setManagerDialogOpen(false)
        },

        bulkAddElemRef = useRef(),

        triggerBulkAddFileWidget = () =>
            bulkAddElemRef.current?.click(),

        handleBulkAdd = async files => {
            if (!files[0])
                return

            const
                fileContent = await readFile(files[0], 'text'),
                parsed = parseAndValidateCSV(fileContent, BuildingSchema)

            setBulkAddResult(parsed)

            onBuildingBulkAdd(
                parsed.valid.map(b => ({...b, units: []})))
        }

    return <>
        <h1>{value.name || 'New Property'}</h1>

        <table className='summary'><tbody>
            <tr>
                <th>Property Name</th>
                <td>
                    <Input
                        value={value.name}
                        onChange={val => onChange({name: val})}
                    />
                </td>
            </tr>

            <tr>
                <th>Unique Number</th>
                <td>
                    <Input
                        value={value.unique_number}
                        onChange={val => onChange({unique_number: val})}
                    />
                </td>
            </tr>

            <tr>
                <th>Management Type</th>
                <td>
                    <Select
                        opts={{WEG: 'weg', MV: 'mv'}}
                        value={value.management_type}
                        onChange={val => onChange({management_type: val})}
                    />
                </td>
            </tr>

            <tr>
                <th>Total MEA</th>
                <td>
                    <Input
                        type='number'
                        value={value.total_mea}
                        onChange={val => onChange({total_mea: val})}
                    />
                </td>
            </tr>

            <tr>
                <th>Property Manager</th>
                <td>
                    <Select
                        placeholder='Select'
                        value={value.property_manager_id}
                        onChange={val => onChange({property_manager_id: val})}
                        opts={Object.fromEntries(
                            propManagers.map(pm => [pm.name, pm.id]))}
                    />

                    <Button
                        children='Add New'
                        onClick={() =>
                            openNewManagerDialog('property_manager')}
                    />
                </td>
            </tr>

            <tr>
                <th>Accountant</th>
                <td>
                    <Select
                        placeholder='Select'
                        value={value.accountant_id}
                        onChange={val => onChange({accountant_id: val})}
                        opts={Object.fromEntries(
                            accountants.map(a => [a.name, a.id]))}
                    />

                    <Button
                        children='Add New'
                        onClick={() => openNewManagerDialog('accountant')}
                    />
                </td>
            </tr>
        </tbody></table>

        <hr />

        <Button
            children='Submit'
            onClick={onSubmit}
            color='green'
        />

        <hr />

        <h2>Buildings</h2>

        {value.buildings.length > 0 &&
            <BuildingListing
                items={value.buildings}
                onChange={onBuildingChange}
                onDelete={onBuildingDelete}
                onZoom={onBuildingEdit}
            />}

        <Button
            children='Add New'
            onClick={onBuildingAdd}
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

        <NewManagerDialog
            open={managerDialogOpen}
            onOpenChange={setManagerDialogOpen}
            title={'Add New ' + newManagerType}
            value={newManager}
            onChange={updateNewManager}
            onSubmit={() => createNewManager(newManagerType)}
        />

        <Dialog.Root
            open={bulkAddResult}
            onOpenChange={() => setBulkAddResult(null)}
        >
            {bulkAddResult &&
                <Dialog.Content aria-describedby={undefined}>
                    <Dialog.Title>
                        Successfully
                        added {bulkAddResult.valid.length} buildings
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

const
    NewManagerDialog = ({
        open,
        onOpenChange,
        title,
        value,
        onChange,
        onSubmit,
    }) =>
        <Dialog.Root
            open={open}
            onOpenChange={onOpenChange}
        >
            <Dialog.Content aria-describedby={undefined}>
                <Dialog.Title children={title} />

                <Input
                    label='Name'
                    value={value.name}
                    onChange={val => onChange({name: val})}
                />

                <Input
                    label='Address'
                    value={value.address}
                    onChange={val => onChange({address: val})}
                />

                <Button
                    children='Add'
                    onClick={onSubmit}
                />
            </Dialog.Content>
        </Dialog.Root>,


    BuildingListing = ({items, onChange, onDelete, onZoom}) =>
        <table className='excel'>
            <thead>
                <tr>
                    <th/>
                    <th>Name</th>
                    <th>Street</th>
                    <th>House Num</th>
                    <th>Constr Year</th>
                    <th>Description</th>
                    <th>Units</th>
                    <th>Detail</th>
                </tr>
            </thead>

            <tbody>{items.map((b, i) =>
                <tr key={i}>
                    <td><Button
                        children='-'
                        onClick={() => onDelete(i)}
                    /></td>

                    <td><Input
                        value={b.name}
                        onChange={val => onChange(i, {name: val})}
                        className='long'
                    /></td>

                    <td><Input
                        value={b.street}
                        onChange={val => onChange(i, {street: val})}
                        className='long'
                    /></td>

                    <td><Input
                        value={b.house_number}
                        onChange={val => onChange(i, {house_number: val})}
                    /></td>

                    <td><Input
                        value={b.construction_year}
                        onChange={val => onChange(i, {construction_year: val})}
                        type='number'
                    /></td>

                    <td><Input
                        value={b.description}
                        onChange={val => onChange(i, {description: val})}
                        className='long'
                    /></td>

                    <td>{b.units.length}</td>

                    <td><Button
                        children='O'
                        onClick={() => onZoom(i)}
                    /></td>
                </tr>,
            )}</tbody>
        </table>
