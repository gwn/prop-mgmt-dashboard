import ReactDOM from 'react-dom/client'
import {createElement as e, StrictMode} from 'react'
import {Theme} from '@radix-ui/themes'
import '@radix-ui/themes/styles.css'
import {getProperties, getPropertyManagers, getAccountants} from './api'
import App from './App'
import ErrorScene from './scenes/Error'
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
            .render(e(StrictMode, {}, e(Theme, {}, e(component, props))))


boot()
