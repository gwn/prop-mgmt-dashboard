import {useState, useEffect} from 'react'
import {clone, keyBy,
    readFile, base64ToFile, updateCollectionItem} from '@/util'
import {useModal} from './context'
import {createProperty, editProperty, deleteProperty} from './api'
import {ErrorScene} from './ui'
import PropertyListing from './scenes/PropertyListing'
import NewPropertyWizard from './scenes/NewPropertyWizard'


export default function App({
    error,
    propManagers = [],
    accountants = [],
    properties = [],
}) {
    const
        setModalScene = useModal(),

        [wizardOpen, toggleWizard] = useState(false),

        [properties_, setProperties] =
            useState(properties.map(deserializePropRec)),

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

            let newPropRec

            if (editedPropertyIdx > -1) { // edit mode
                try {
                    newPropRec = await editProperty(propRec.id, serialized)
                } catch (e) {
                    handleNetworkError(e)
                }

                setProperties(prev =>
                    updateCollectionItem(
                        prev, editedPropertyIdx, {...propRec, ...newPropRec}))

                setEditedPropertyIdx(-1)

            } else { // create mode
                try {
                    newPropRec = await createProperty(serialized)
                } catch (e) {
                    handleNetworkError(e)
                }

                setProperties(prev => [...prev, {
                    ...propRec,
                    ...newPropRec,
                }])
            }

            replaceDummyManagerIds(propRec, newPropRec)

            toggleWizard(false)
        },

        replaceDummyManagerIds = (oldPropRec, newPropRec) => {
            if (oldPropRec.property_manager_id >= 1e6) {
                const pmIdx =
                    propManagers_.findIndex(pm =>
                        pm.id === oldPropRec.property_manager_id)

                setPropManagers(prev =>
                    updateCollectionItem(
                        prev, pmIdx, {id: newPropRec.property_manager_id}))
            }

            if (oldPropRec.accountant_id >= 1e6) {
                const accIdx =
                    accountants_.findIndex(acc =>
                        acc.id === oldPropRec.accountant_id)

                setAccountants(prev =>
                    updateCollectionItem(
                        prev, accIdx, {id: newPropRec.accountant_id}))
            }
        },

        handlePropertyEditRequest = propIdx => {
            setEditedPropertyIdx(propIdx)
            toggleWizard(true)
        },

        handlePropertyDeleteRequest = async propIdx => {
            try {
                await deleteProperty(properties_[propIdx].id)
            } catch (e) {
                return handleNetworkError(e)
            }

            setProperties(prev => [
                ...prev.slice(0, propIdx),
                ...prev.slice(propIdx + 1),
            ])
        },

        handleNetworkError = e => {
            console.error('Network error', e)

            let message = 'Network error'

            if (e.cause.status === 409)
                message = 'There is already a property with this unique number'

            setModalScene(ErrorScene, {message})
        }

    useEffect(() => {
        if (error)
            setModalScene(ErrorScene, {message: error})
    }, [
        error,
    ])

    return wizardOpen
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
        />
}


const
    serializePropRec = async (p, propManagers, accountants) => {
        p = clone(p)

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
    },

    deserializePropRec = p => ({
        ...p,

        property_manager_id: p.property_manager.id,
        accountant_id: p.accountant.id,

        property_manager: undefined,
        accountant: undefined,

        declaration_file:
            p.declaration_file
                ? base64ToFile(
                    p.declaration_file, 'declarationFile.pdf','application/pdf')

                : null,
    })
