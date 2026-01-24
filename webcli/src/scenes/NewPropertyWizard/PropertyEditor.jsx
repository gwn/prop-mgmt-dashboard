import {useState} from 'react'
import {extractPropertyDeclarationPdf} from '@/api'
import {useModal} from '@/context'
import {mapKeys, validateFormData} from '@/util'
import {Button, FileInput, Input, Select, BulkAdd, ExcelTable} from '@/ui'
import {PropertySchema, BuildingSchema} from '@/../../schema'


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
        setModalScene = useModal(),

        [formErrors, setFormErrors] = useState({}),

        handleNewDeclarationFile = file => {
            if (!file)
                return

            onChange({declaration_file: file})

            setModalScene(DeclarationFileParseDialog, {
                onCancel: () => setModalScene(null),

                onConfirm: async () => {
                    setModalScene(() => 'Parsing, can take up to a minute')

                    const extractedPropRec =
                        await extractPropertyDeclarationPdf(file)

                    onDeclarationFileParse({file, extractedPropRec})

                    setModalScene(null)
                },
            })
        },

        openNewManagerDialog = managerType =>
            setModalScene(NewManagerForm, {
                title: 'Add ' + (
                    managerType === 'accountant'
                        ? 'Accountant'
                        : 'Property Manager'),

                onSubmit: managerRec => {
                    const id = onManagerAdd(managerType, managerRec)
                    onChange({[managerType + '_id']: id})
                    setModalScene(null)
                },
            }),

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
                    onChange={files => handleNewDeclarationFile(files[0])}
                />
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
    </>
}


const
    NewManagerForm = ({title, onSubmit}) =>
        <form onSubmit={e => {
            e.preventDefault()

            onSubmit({
                name: e.target.name.value,
                address: e.target.address.value,
            })
        }}>
            <h3 children={title} />

            <ul className='form'>
                <li><Input
                    placeholder='Name'
                    name='name'
                    required
                    autoFocus
                /></li>

                <li><Input
                    placeholder='Address'
                    name='address'
                    required
                /></li>
            </ul>

            <Button
                children='Add'
                type='submit'
            />
        </form>,


    DeclarationFileParseDialog = ({onConfirm, onCancel}) => <>
        <h3 children='Auto extract?' />

        <Button children='Yes' onClick={onConfirm} />
        <Button children='No' onClick={onCancel} />
    </>
