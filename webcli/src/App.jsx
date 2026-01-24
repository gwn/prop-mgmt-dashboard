import {useState} from 'react'
import {clone, keyBy, readFile, updateCollectionItem} from '@/util'
import {createProperty, editProperty, deleteProperty} from './api'
import {ModalProvider} from './context'
import PropertyListing from './scenes/PropertyListing'
import NewPropertyWizard from './scenes/NewPropertyWizard'


export default function App({
    propManagers = [],
    accountants = [],
    properties = [],
}) {
    const
        [wizardOpen, toggleWizard] = useState(false),

        [properties_, setProperties] = useState(properties),
        [propManagers_, setPropManagers] = useState(propManagers),
        [accountants_, setAccountants] = useState(accountants),
        [editedPropertyIdx, setEditedPropertyIdx] = useState(-1),

        [newManagerCounter, setNewManagerCounter] = useState(0),

        managerSetters = {
            property_manager: setPropManagers,
            accountant: setAccountants,
        },

        handleManagerAdd = (managerType, managerRec) => {
            const id = 1e6 + newManagerCounter

            setNewManagerCounter(c => c + 1)

            managerSetters[managerType](
                prev => [...prev, {id, ...managerRec}])

            return id
        },

        handleWizardSubmit = async propRec => {
            const serialized =
                await serializePropRec(propRec, propManagers_, accountants_)

            if (editedPropertyIdx > -1) { // edit mode
                await editProperty(propRec.id, propRec)

                setProperties(prev =>
                    updateCollectionItem(prev, editedPropertyIdx, propRec))

                setEditedPropertyIdx(-1)

            } else { // create mode
                await createProperty(serialized)
                setProperties(prev => [...prev, propRec])
            }

            toggleWizard(false)
        },

        handlePropertyEditRequest = propIdx => {
            setEditedPropertyIdx(propIdx)
            toggleWizard(true)
        },

        handlePropertyDeleteRequest = async propIdx => {
            await deleteProperty(properties[propIdx].id)

            setProperties(prev => [
                ...prev.slice(0, propIdx),
                ...prev.slice(propIdx + 1),
            ])
        }

    return (
        <ModalProvider>
            {wizardOpen
                ? <NewPropertyWizard
                    propManagers={propManagers_}
                    accountants={accountants_}
                    onManagerAdd={handleManagerAdd}
                    onSubmit={handleWizardSubmit}
                    onCancel={() => toggleWizard(false)}
                    initState={properties_[editedPropertyIdx]}
                    initScene={editedPropertyIdx > -1 ? 'PropertyEditor' : null}
                />

                : <PropertyListing
                    items={properties_}
                    onEditRequest={handlePropertyEditRequest}
                    onDeleteRequest={handlePropertyDeleteRequest}
                />}
        </ModalProvider>
    )
}


const serializePropRec = async (p, propManagers, accountants) => {
    if (p.declaration_file)
        p.declaration_file = await readFile(p.declaration_file, 'base64')

    const
        propManagersById = keyBy(propManagers, 'id'),
        accountantsById = keyBy(accountants, 'id')

    p.property_manager = clone(propManagersById[p.property_manager_id])
    p.accountant = clone(accountantsById[p.accountant_id])

    if (p.property_manager_id >= 1e6)
        delete p.property_manager.id

    if (p.accountant_id >= 1e6)
        delete p.accountant.id

    delete p.property_manager_id
    delete p.accountant_id

    return p
}
