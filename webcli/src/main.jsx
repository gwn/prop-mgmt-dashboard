import ReactDOM from 'react-dom/client'
import {createElement as e, StrictMode, useState} from 'react'
import {Theme, Button} from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import {keyBy} from 'lodash'
import {readFile} from '@/util'
import {getProperties,
    getPropertyManagers, getAccountants, createProperty} from './api'
import ErrorScene from './scenes/Error'
import PropertyListing from './scenes/PropertyListing'
import NewPropertyWizard from './scenes/NewPropertyWizard'
import './global.css'


const
    boot = async () => {
        try {
            const [propManagers, accountants, properties] =
                await Promise.all([
                    getPropertyManagers(), getAccountants(), getProperties()])

            render(App, {propManagers, accountants, properties})

        } catch (e) {
            console.error(e)
            render(ErrorScene, {error: e})
        }
    },

    render = (component, props) =>
        ReactDOM
            .createRoot(document.getElementById('root'))
            .render(e(StrictMode, {}, e(Theme, {}, e(component, props)))),

    App = ({propManagers, accountants, properties}) => {
        const
            [wizardOpen, toggleWizard] = useState(true),

            [propManagers_, setPropManagers] = useState(propManagers),
            [accountants_, setAccountants] = useState(accountants),

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

            handleWizardSubmit = async newPropRec => {
                createProperty(
                    await serializePropRec(
                        newPropRec, propManagers_, accountants_))

                toggleWizard(false)
            }

        return <>
            <Button
                onClick={() => toggleWizard(false)}
                children='Listing'
                color={wizardOpen ? 'gray' : 'blue'}
            />

            <Button
                onClick={() => toggleWizard(true)}
                children='Add New'
                color={wizardOpen ? 'blue' : 'gray'}
            />

            <hr />

            {wizardOpen
                ? <NewPropertyWizard
                    propManagers={propManagers_}
                    accountants={accountants_}
                    onManagerAdd={handleManagerAdd}
                    initState={undefined}
                    onSubmit={handleWizardSubmit}
                />

                : <PropertyListing items={properties} />}
        </>
    },

    serializePropRec = async (p, propManagers, accountants) => {
        if (p.declaration_file)
            p.declaration_file = await readFile(p.declaration_file, 'base64')

        const
            propManagersById = keyBy(propManagers, 'id'),
            accountantsById = keyBy(accountants, 'id')

        p.property_manager = propManagersById[p.property_manager_id]
        p.accountant = accountantsById[p.accountant_id]

        if (p.property_manager_id >= 1e6)
            delete p.property_manager.id

        if (p.accountant_id >= 1e6)
            delete p.accountant.id

        delete p.property_manager_id
        delete p.accountant_id

        return p
    }


boot()
