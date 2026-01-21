import ReactDOM from 'react-dom/client'
import {createElement as e, StrictMode, useState} from 'react'
import {Theme} from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import {getProperties, getPropertyManagers, getAccountants} from './api'
import ErrorScene from './scenes/Error'
import PropertyListingScene from './scenes/PropertyListing'
import PropertyCreationWizard from './scenes/PropertyCreationWizard'


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

    render = (component, props) => {
        ReactDOM
            .createRoot(document.getElementById('root'))
            .render(e(StrictMode, {}, e(Theme, {}, e(component, props))))
    },

    App = ({propManagers, accountants, properties}) => {
        const
            [wizardOpen, toggleWizard] = useState(false),

            activeScene =
                wizardOpen ? PropertyCreationWizard : PropertyListingScene

        return e(activeScene, {
            properties,
            propManagers,
            accountants,
            onToggleWizard: toggleWizard,
        })
    }


boot()
