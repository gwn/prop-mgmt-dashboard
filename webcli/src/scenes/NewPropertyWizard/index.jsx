import {useState} from 'react'
import {updateCollectionItem} from '@/util'
import DeclarationFileEditor from './DeclarationFileEditor'
import PropertyEditor from './PropertyEditor'
import BuildingEditor from './BuildingEditor'


const
    emptyPropState = {
        name: '',
        unique_number: '',
        management_type: 'weg',
        total_mea: '',
        property_manager: null, // {id?, name, address}
        accountant: null, // {id?, name, address}
        declaration_file: null, // File object
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


export default ({
    propManagers = [],
    accountants = [],
    onManagerAdd,
    initState,
    onSubmit,
}) => {
    const
        initPropState = initState || {
            ...emptyPropState,
            property_manager: propManagers[0],
            accountant: accountants[0],
        },

        [activeSceneName, setActiveScene] = useState('DeclarationFileEditor'),

        [propState, setPropState] = useState(initPropState),

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

            setActiveScene('PropertyEditor')
        }

    return <>
        {activeSceneName === 'DeclarationFileEditor' &&
            <DeclarationFileEditor
                value={propState.declaration_form}
                onChange={updateDeclarationFile}
                onCancel={() => setActiveScene('PropertyEditor')}
            />}

        {activeSceneName === 'PropertyEditor' &&
            <PropertyEditor
                value={propState}
                onChange={updateProp}
                onBuildingChange={updateBuilding}
                propManagers={propManagers}
                accountants={accountants}
                onManagerAdd={onManagerAdd}
                onBuildingAdd={handleBuildingAdd}
                onBuildingBulkAdd={handleBuildingBulkAdd}
                onBuildingDelete={handleBuildingDelete}
                onBuildingEdit={handleBuildingEdit}
                onSubmit={() => onSubmit(propState)}
            />}

        {activeSceneName === 'BuildingEditor' &&
            <BuildingEditor
                value={propState.buildings[currentBuildingIdx]}
                onChange={patch => updateBuilding(currentBuildingIdx, patch)}
                onDelete={() => handleBuildingDelete[currentBuildingIdx]}
                onExit={() => setActiveScene('PropertyEditor')}
            />}
    </>
}
