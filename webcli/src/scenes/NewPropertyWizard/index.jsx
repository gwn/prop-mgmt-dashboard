import {useState} from 'react'
import {clone, base64ToFile, updateCollectionItem} from '@/util'
import PropertyEditor from './PropertyEditor'
import BuildingEditor from './BuildingEditor'


const
    emptyPropState = {
        name: '',
        unique_number: '',
        management_type: '',
        total_mea: '',
        property_manager_id: '',
        accountant_id: '',
        declaration_file: undefined, // File object
        buildings: [],
    },

    emptyBuildingState = {
        name: '',
        street: '',
        house_number: '',
        construction_year: '',
        description: '',
        units: [],
    }


export default function NewPropertyWizard({
    propManagers = [],
    accountants = [],
    onManagerAdd,
    initState,
    onSubmit,
    onCancel,
}) {
    const
        [activeSceneName, setActiveScene] = useState('PropertyEditor'),

        [propState, setPropState] =
            useState(
                initState
                    ? {
                        ...initState,
                        property_manager_id: initState.property_manager_id || initState.property_manager.id,
                        accountant_id: initState.accountant_id || initState.accountant.id,
                        declaration_file: initState.declaration_file instanceof File ? initState.declaration_file : base64ToFile(initState.declaration_file, 'declarationFile.pdf', 'application/pdf'),
                    }

                    : emptyPropState,
            ),

        [currentBuildingIdx, setCurrentBuildingIdx] = useState(),

        handleBuildingEdit = buildingIdx => {
            setCurrentBuildingIdx(buildingIdx)
            setActiveScene('BuildingEditor')
        },

        handleBuildingAdd = () =>
            setPropState(prev => ({
                ...prev,
                buildings: [...prev.buildings, emptyBuildingState],
            })),

        handleBuildingBulkAdd = newBuildingRecs =>
            setPropState(prev => ({
                ...prev,
                buildings: [...prev.buildings, ...newBuildingRecs],
            })),

        handleBuildingDelete = buildingIdx =>
            setPropState(prev => ({
                ...prev,

                buildings: [
                    ...prev.buildings.slice(0, buildingIdx),
                    ...prev.buildings.slice(buildingIdx + 1),
                ],
            })),

        updateProp = patch =>
            setPropState(prev => ({...prev, ...patch})),

        updateBuilding = (buildingIdx, patch) =>
            setPropState(prev => ({
                ...prev,

                buildings:
                    updateCollectionItem(prev.buildings, buildingIdx, patch),
            })),

        updateDeclarationFile = ({
            file,
            extractedPropRec: {
                property_manager: pm,
                accountant: acc,
                ...propRec
            },
        }) => {
            if (pm) {
                let pmId =
                    propManagers.find(pm_ =>
                        pm_.name === pm.name && pm_.address === pm.address,
                    )
                        ?.id

                if (!pmId)
                    pmId = onManagerAdd('property_manager', pm)

                propRec.property_manager_id = pmId
            }

            if (acc) {
                let accId =
                    accountants.find(acc_ =>
                        acc_.name === acc.name && acc_.address === acc.address,
                    )
                        ?.id

                if (!accId)
                    accId = onManagerAdd('accountant', acc)

                propRec.accountant_id = accId
            }

            propRec.declaration_file = file

            setPropState(propRec)
        }

    return <>
        {activeSceneName === 'PropertyEditor' &&
            <PropertyEditor
                value={propState}
                onChange={updateProp}
                onDeclarationFileParse={updateDeclarationFile}
                onBuildingChange={updateBuilding}
                propManagers={propManagers}
                accountants={accountants}
                onManagerAdd={onManagerAdd}
                onBuildingAdd={handleBuildingAdd}
                onBuildingBulkAdd={handleBuildingBulkAdd}
                onBuildingDelete={handleBuildingDelete}
                onBuildingEdit={handleBuildingEdit}
                onSubmit={() => onSubmit(clone(propState))}
                onCancel={onCancel}
            />}

        {activeSceneName === 'BuildingEditor' &&
            <BuildingEditor
                value={propState.buildings[currentBuildingIdx]}
                onCancel={() => setActiveScene('PropertyEditor')}
                onSubmit={patch => {
                    updateBuilding(currentBuildingIdx, patch)
                    setActiveScene('PropertyEditor')
                }}
            />}
    </>
}
