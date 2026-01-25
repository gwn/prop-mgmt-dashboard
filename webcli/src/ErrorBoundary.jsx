import React from 'react'
import {ModalContext} from './context'
import {ErrorScene} from './ui'


export default class ErrorBoundary extends React.Component {
    static contextType = ModalContext

    constructor(props) {
        super(props)
        this.state = {hasError: false, error: null}
    }

    static getDerivedStateFromError(error) {
        return {hasError: true, error}
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary', error, errorInfo)

        this.context(ErrorScene, {
            message: 'App crashed: You probably caught a bug'})
    }

    render() {
        if (this.state.hasError)
            return null

        return this.props.children
    }
}
