import {useState} from 'react'
import {clone, updateCollectionItem} from '@/util'
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

        [propState, setPropState] = useState(initState || emptyPropState),

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
            propRec.declaration_file = file

            ;[
                ['property_manager', pm, propManagers],
                ['accountant', acc, accountants],
            ]
                .forEach(([managerType, managerRec, existingManagerList]) => {
                    if (!managerRec)
                        return

                    const existingManagerId =
                        existingManagerList.find(m =>
                            m.name === managerRec.name
                            && m.address === managerRec.address,
                        )
                            ?.id

                    propRec[managerType + '_id'] =
                        existingManagerId
                        || onManagerAdd(managerType, managerRec)
                })

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
