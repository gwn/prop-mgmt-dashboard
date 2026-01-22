import {createElement as e, useState} from 'react'
import {extractPdf, createProperty} from '../api'
import EditProperty from './EditProperty'
import EditBuildings from './EditBuildings'
import EditUnits from './EditUnits'


const steps = [EditProperty, EditBuildings, EditUnits]


export default ({propManagers, accountants, onToggleWizard, onManagerAdd}) => {
    const
        [currentStepIdx, setStep] = useState(0),
        goToPrevStep = () => setStep(p => p - 1),
        goToNextStep = () => setStep(p => p + 1),
        activeScene = steps[currentStepIdx],

        [formData, setFormData] = useState({
            name: '',
            unique_number: '',
            management_type: 'weg',
            property_manager: propManagers[0], // {id?, name, address}
            accountant: accountants[0], // {id?, name, address}
            declaration_file: null, // File object
            buildings: [], // [{name, street, house_number, construction_year, description, units: []}]
        }),

        updateFormData = patch =>
            typeof patch === 'function'
                ? setFormData(patch)
                : setFormData(prev => ({...prev, ...patch})),

        handleExtract = async file => {
            const extractedPropRecord = await extractPdf(file)

            if (!propManagers.includes(extractedPropRecord.property_manager))
                onManagerAdd('property_manager', extractedPropRecord.property_manager)

            if (!accountants.includes(extractedPropRecord.accountant))
                onManagerAdd('accountant', extractedPropRecord.accountant)

            updateFormData(Object.assign(extractedPropRecord, {
                declaration_file: file,
            }))
        },

        handleSubmit = async () => {
            await createProperty({
                ...formData,

                declaration_file:
                    (await fileToBase64(formData.declaration_file)),
            })

            setStep(0)
        }

    return (
        <div>
            <button
                onClick={() => onToggleWizard(false)}
                children='Close'
            />

            {e(activeScene, {
                formData,
                propManagers,
                accountants,
                onManagerAdd,
                onUpdate: updateFormData,
                onExtract: handleExtract,
                onNext: goToNextStep,
                onPrev: goToPrevStep,
                onSubmit: handleSubmit,
            })}
        </div>
    )
}


async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onerror = (error) => reject(error)
        reader.onload = () => resolve(reader.result.split(',')[1])

        reader.readAsDataURL(file)
    })
}
