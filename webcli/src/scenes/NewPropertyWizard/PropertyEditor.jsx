import {useState} from 'react'
import {Dialog} from '@radix-ui/themes'
import {extractPropertyDeclarationPdf} from '@/api'
import {mapKeys, validateFormData} from '@/util'
import {Button, FileInput, Input, Select, BulkAdd, ExcelTable} from '@/ui'
import {PropertySchema, BuildingSchema} from '@/../../schema'


const emptyManagerState = {name: '', address: ''}


export default function PropertyEditor({
    value,
    onChange,
    onDeclarationFileParse,
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
        [declarationFileParseDialogOpen, toggleDeclarationFileParseDialog] = useState(false),
        [declarationFileParseLoading, toggleDeclarationFileParseLoading] = useState(false),
        [formErrors, setFormErrors] = useState({}),

        parseDeclarationFile = async () => {
            if (!value.declaration_file)
                return

            toggleDeclarationFileParseLoading(true)

            const extractedPropRec =
                await extractPropertyDeclarationPdf(value.declaration_file)

            toggleDeclarationFileParseLoading(false)
            toggleDeclarationFileParseDialog(false)

            onDeclarationFileParse({
                file: value.declaration_file,
                extractedPropRec,
            })
        },

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

        <ul className='form'>
            <li>
                <FileInput
                    value={value.declaration_file}
                    placeholder='Upload Teilungserklärung'
                    error={formErrors.declaration_file}
                    onChange={files => {
                        onChange({declaration_file: files[0]})
                        toggleDeclarationFileParseDialog(true)
                    }}
                />

                <Dialog.Root
                    open={declarationFileParseDialogOpen}
                    onOpenChange={() => toggleDeclarationFileParseDialog(false)}
                >
                    <Dialog.Content aria-describedby={undefined}>
                        {declarationFileParseLoading
                            ? <Dialog.Title children='Patience' />

                            : <>
                                <Dialog.Title children='Auto extract?' />

                                <Button
                                    children='Yes'
                                    onClick={parseDeclarationFile}
                                    color='green'
                                />

                                <Button
                                    children='No'
                                    onClick={() => toggleDeclarationFileParseDialog(false)}
                                    color='red'
                                />
                            </>}
                    </Dialog.Content>
                </Dialog.Root>
            </li>

            <li>
                <Input
                    placeholder='Property Name'
                    value={value.name}
                    error={formErrors.name}
                    onChange={val => onChange({name: val})}
                />
            </li>

            <li>
                <Input
                    placeholder='Unique Number'
                    value={value.unique_number}
                    error={formErrors.unique_number}
                    onChange={val => onChange({unique_number: val})}
                />
            </li>

            <li>
                <Select
                    opts={{WEG: 'weg', MV: 'mv'}}
                    placeholder='Management Type'
                    value={value.management_type}
                    error={formErrors.management_type}
                    onChange={val => onChange({management_type: val})}
                />
            </li>

            <li>
                <Input
                    placeholder='Total MEA'
                    type='number'
                    value={value.total_mea}
                    error={formErrors.total_mea}
                    onChange={val => onChange({total_mea: val})}
                />
            </li>

            <li>
                <Select
                    placeholder='Property Manager'
                    value={value.property_manager_id}
                    error={formErrors.property_manager_id}
                    onChange={val => onChange({property_manager_id: val})}
                    opts={Object.fromEntries(
                        propManagers.map(pm => [pm.name, pm.id]))}
                />

                <Button
                    children='&nbsp;+&nbsp;'
                    onClick={() =>
                        openNewManagerDialog('property_manager')}
                />
            </li>

            <li>
                <Select
                    placeholder='Accountant'
                    value={value.accountant_id}
                    error={formErrors.accountant_id}
                    onChange={val => onChange({accountant_id: val})}
                    opts={Object.fromEntries(
                        accountants.map(a => [a.name, a.id]))}
                />

                <Button
                    children='&nbsp;+&nbsp;'
                    onClick={() => openNewManagerDialog('accountant')}
                />
            </li>
        </ul>

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
