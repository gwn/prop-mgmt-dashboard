import {useState, useRef} from 'react'
import {extractPropertyDeclarationPdf} from '@/api'
import {useModal} from '@/context'
import {mapKeys, validateFormData} from '@/util'
import {ErrorScene, Button,
    FileInput, Input, Select, BulkAdd, ExcelTable} from '@/ui'
import {PropertySchema, BuildingSchema} from '@/../../schema'
import s from './editor.module.css'


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
        propManagerInputRef = useRef(),
        accountantInputRef = useRef(),

        [formErrors, setFormErrors] = useState({}),

        handleNewDeclarationFile = file => {
            onChange({declaration_file: file})

            if (!file)
                return

            setModalScene(DeclarationFileParseDialog, {
                onCancel: () => setModalScene(null),

                onConfirm: async () => {
                    setModalScene(() => 'Parsing, can take up to a minute')

                    let extractedPropRec

                    try {
                        extractedPropRec =
                            await extractPropertyDeclarationPdf(file)
                    } catch (e) {
                        return handleNetworkError(e)
                    }

                    onDeclarationFileParse({file, extractedPropRec})

                    setModalScene(null)
                },
            })
        },

        handleNetworkError = e => {
            console.error('Network error', e)
            setModalScene(ErrorScene, {message: 'Network error'})
        },

        openNewManagerDialog = managerType =>
            setModalScene(NewManagerForm, {
                title: 'Add ' + (
                    managerType === 'accountant'
                        ? 'Accountant'
                        : 'Property Manager'),

                onCancel: () => {
                    setModalScene(null)
                    propManagerInputRef.current?.focus()
                },

                onSubmit: managerRec => {
                    const id = onManagerAdd(managerType, managerRec)
                    onChange({[managerType + '_id']: id})
                    setModalScene(null)
                    accountantInputRef.current?.focus()
                },
            }),

        handleSubmit = () => {
            const errors = validateFormData(value, PropertySchema)

            delete errors.declaration_file
            // ^TODO: Might be a better way to handle

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

        <hr />

        <ul className={s.form}>
            <li><FileInput
                accept='application/pdf'
                className={s.teilung}
                value={value.declaration_file}
                placeholder='Upload Teilungserklärung'
                error={formErrors.declaration_file}
                onChange={files => handleNewDeclarationFile(files[0])}
            /></li>

            <li><Input
                autoFocus
                placeholder='Property Name'
                value={value.name}
                error={formErrors.name}
                onChange={val => onChange({name: val})}
            /></li>

            <li><Input
                placeholder='Unique Number'
                value={value.unique_number}
                error={formErrors.unique_number}
                onChange={val => onChange({unique_number: val})}
            /></li>

            <li><Select
                opts={{WEG: 'weg', MV: 'mv'}}
                placeholder='Management Type'
                value={value.management_type}
                error={formErrors.management_type}
                onChange={val => onChange({management_type: val})}
            /></li>

            <li><Input
                placeholder='Total MEA'
                type='number'
                value={value.total_mea}
                error={formErrors.total_mea}
                onChange={val => onChange({total_mea: val})}
            /></li>

            <li>
                <Select
                    ref={propManagerInputRef}
                    placeholder='Property Manager'
                    value={value.property_manager_id}
                    error={formErrors.property_manager_id}
                    onChange={val => onChange({property_manager_id: val})}
                    opts={Object.fromEntries(
                        propManagers.map(pm => [pm.name, pm.id]))}
                />

                <Button
                    children='+'
                    onClick={() => openNewManagerDialog('property_manager')}
                />
            </li>

            <li>
                <Select
                    ref={accountantInputRef}
                    placeholder='Accountant'
                    value={value.accountant_id}
                    error={formErrors.accountant_id}
                    onChange={val => onChange({accountant_id: val})}
                    opts={Object.fromEntries(
                        accountants.map(a => [a.name, a.id]))}
                />

                <Button
                    children='+'
                    onClick={() => openNewManagerDialog('accountant')}
                />
            </li>
        </ul>

        <hr />

        <Button children='Save' onClick={handleSubmit} />
        <Button children='Cancel' onClick={onCancel} />

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
                ['Units', 'number', 'btn', item => item.units.length],
                ['Zoom', '', 'btn', (_, i) =>
                    <Button
                        children='>'
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
            jsonSchema={{
                ...BuildingSchema,

                required:
                    BuildingSchema.required
                        .filter(fName => fName !== 'units'),
            }}
            onComplete={parsed => {
                onBuildingBulkAdd(
                    parsed.valid.map(b => ({...b, units: []})))
            }}
        />
    </>
}


const
    NewManagerForm = ({title, onSubmit, onCancel}) =>
        <form onSubmit={e => {
            e.preventDefault()

            onSubmit({
                name: e.target.name.value,
                address: e.target.address.value,
            })
        }}>
            <h3 children={title} />

            <ul style={{listStyleType: 'none', padding: 0}}>
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

            <p>
                <Button
                    children='Add'
                    type='submit'
                />
                <Button
                    children='Cancel'
                    onClick={onCancel}
                />
            </p>
        </form>,


    DeclarationFileParseDialog = ({onConfirm, onCancel}) => <>
        <h3 children='Auto extract?' />

        <p>
            <Button children='Yes' onClick={onConfirm} />
            <Button children='No' onClick={onCancel} />
        </p>
    </>
