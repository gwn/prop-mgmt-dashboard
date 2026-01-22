import {useState} from 'react'
import {keyBy} from 'lodash'
import {Button, Dialog} from '@radix-ui/themes'
import {Input, FileInput, Select} from '../ui'


export default ({
    formData,
    propManagers,
    accountants,
    onManagerAdd,
    onUpdate,
    onExtract,
    onNext,
}) => {
    const
        [declarationFile, setDeclarationFile] = useState(null),

        emptyManagerState = {name: '', address: ''},

        [newManagerType, setNewManagerType] = useState(),
        [newManager, setNewManager] = useState(emptyManagerState),
        updateNewManager = patch => setNewManager(pm => ({...pm, ...patch})),

        [managerDialogOpen, setManagerDialogOpen] = useState(false),

        openNewManagerDialog = managerType => {
            setNewManagerType(managerType)
            setManagerDialogOpen(true)
        },

        createNewManager = () => {
            onManagerAdd(newManagerType, newManager)
            onUpdate({[newManagerType]: newManager})
            setNewManager(emptyManagerState)
            setManagerDialogOpen(false)
        },

        handleDeclarationFileChange = e => {
            const file = e.target.files[0]

            if (file) {
                setDeclarationFile(file)
                onUpdate({declaration_file: file})
            }
        },

        handleExtractClick = async () =>
            declarationFile && onExtract(declarationFile)

    return (
        <div>
            <h1>Step 1: General Information</h1>

            <div>
                <Input
                    label='Property Name'
                    value={formData.name}
                    onChange={val => onUpdate({name: val})}
                />
            </div>

            <div>
                <Input
                    label='Unique Number'
                    value={formData.unique_number}
                    onChange={val => onUpdate({unique_number: val})}
                />
            </div>

            <div>
                <Select
                    label='Management Type'
                    opts={{WEG: 'weg', MV: 'mv'}}
                    value={formData.management_type}
                    onChange={val => onUpdate({management_type: val})}
                />
            </div>

            <div>
                <Select
                    label='Property Manager'
                    placeholder='Select'
                    opts={keyBy(propManagers, 'name')}
                    value={formData.property_manager}
                    onChange={val => onUpdate({property_manager: val})}
                />

                <Button
                    children='Add New'
                    onClick={() => openNewManagerDialog('property_manager')}
                />
            </div>

            <div>
                <Select
                    label='Accountant'
                    placeholder='Select'
                    opts={keyBy(accountants, 'name')}
                    value={formData.accountant}
                    onChange={val => onUpdate({accountant: val})}
                />

                <Button
                    children='Add New'
                    onClick={() => openNewManagerDialog('accountant')}
                />
            </div>

            <div>
                <FileInput
                    label='Declaration of Division (PDF)'
                    type='file'
                    accept='application/pdf'
                    onChange={handleDeclarationFileChange}
                />

                {declarationFile && (
                    <button
                        type='button'
                        onClick={handleExtractClick}
                        children='Extract Data from PDF'
                    />
                )}
            </div>

            <div>
                <button
                    onClick={onNext}
                    disabled={!formData.name.trim()}
                    children='Next'
                />
            </div>

            <NewManagerDialog
                open={managerDialogOpen}
                onOpenChange={setManagerDialogOpen}
                title={'Add New ' + newManagerType}
                value={newManager}
                onChange={updateNewManager}
                onSubmit={() => createNewManager(newManagerType)}
            />
        </div>
    )
}

const NewManagerDialog = ({
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
