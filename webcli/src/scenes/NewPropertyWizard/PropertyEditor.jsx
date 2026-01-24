import {useState} from 'react'
import {Button, Dialog} from '@radix-ui/themes'
import {mapKeys} from 'lodash'
import {validateFormData} from '@/util'
import {Input, Select, BulkAdd, ExcelTable} from '@/ui'
import {PropertySchema, BuildingSchema} from '@/../../schema'


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
    onCancel,
}) {
    const
        [newManagerType, setNewManagerType] = useState(),
        [newManager, setNewManager] = useState(emptyManagerState),
        [managerDialogOpen, setManagerDialogOpen] = useState(false),
        [formErrors, setFormErrors] = useState({}),

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

        handleSubmit = () => {
            const errors = validateFormData(value, PropertySchema)

            delete errors.declaration_file // TODO

            if (!value.property_manager_id)
                errors.property_manager_id = 'Property manager is required'

            if (!value.accountant_id)
                errors.accountant_id = 'Accountant is required'

            setFormErrors(errors)

            if (Object.keys(errors).length === 0)
                onSubmit()
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
                        className={formErrors.name && 'error'}
                        error={formErrors.name}
                    />
                </td>
            </tr>

            <tr>
                <th>Unique Number</th>
                <td>
                    <Input
                        value={value.unique_number}
                        onChange={val => onChange({unique_number: val})}
                        className={formErrors.unique_number && 'error'}
                        error={formErrors.unique_number}
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
                        error={formErrors.management_type}
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
                        error={formErrors.total_mea}
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
                        error={formErrors.property_manager_id}
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
                        error={formErrors.accountant_id}
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
            onClick={handleSubmit}
            color='green'
        />
        <Button
            children='Cancel'
            onClick={onCancel}
            color='red'
        />

        <hr />

        <h2>Buildings</h2>

        <ExcelTable
            items={value.buildings}
            schema={[
                ['Name', 'text', 'long', 'name'],
                ['Street', 'text', 'long', 'street'],
                ['House No', 'text', 'short', 'house_number'],
                ['Constr Yr', 'number', 'short', 'construction_year'],
                ['Description', 'text', 'longer', 'description'],
                ['Units', 'number', 'short', item => item.units.length],
                ['Detail', '', '', (_, i) =>
                    <Button
                        children='O'
                        onClick={() => onBuildingEdit(i)}
                    />],
            ]}
            formErrors={
                mapKeys(formErrors, (v, k) =>
                    k.match(/^buildings\/(.*)$/)?.[1])}
            onChange={onBuildingChange}
            onAdd={onBuildingAdd}
            onDelete={onBuildingDelete}
        />

        <BulkAdd
            jsonSchema={BuildingSchema}
            onComplete={parsed => {
                onBuildingBulkAdd(
                    parsed.valid.map(b => ({...b, units: []})))
            }}
        />

        <NewManagerDialog
            open={managerDialogOpen}
            onOpenChange={setManagerDialogOpen}
            title={'Add New ' + newManagerType}
            value={newManager}
            onChange={updateNewManager}
            onSubmit={() => createNewManager(newManagerType)}
        />

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
        </Dialog.Root>
