import {createContext, useContext, useState} from 'react'
import {Modal} from './ui'


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
    }


export {
    ModalProvider,
    useModal,
}
