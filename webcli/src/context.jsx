import {createContext, useContext, useState} from 'react'
import {Modal, Confirm} from './ui'


const
    ModalContext = createContext(),


    useModal = () => useContext(ModalContext),


    ModalProvider = ({children}) => {
        const
            [modalScene, setModalScene] = useState(),

            setModalScene_ = (component, props) =>
                !component
                    ? setModalScene(null)
                    : setModalScene({component, props})

        return <>
            {modalScene &&
                <Modal
                    onClose={() => setModalScene_(null)}
                >
                    <modalScene.component {...modalScene.props} />
                </Modal>}

            <ModalContext.Provider
                value={setModalScene_}
                children={children}
            />
        </>
    },


    useConfirm = () => {
        const setModalScene = useModal()

        return (onConfirm, onCancel = ()=>{}) =>
            setModalScene(Confirm, {
                onConfirm: () => {
                    setModalScene(null)
                    onConfirm()
                },
                onCancel: () => {
                    setModalScene(null)
                    onCancel()
                },
            })
    }


export {
    ModalProvider,
    useModal,
    useConfirm,
}
