import {Button} from '@/ui'


export default function PropertyListing({
    items = [],
    onEditRequest,
}) {
    return <>
        <h1>All Properties</h1>

        <hr />

        {items.length > 0 && <>
            <table className='listing'>
                <thead>
                    <tr>
                        <th></th>
                        <th>No</th>
                        <th>B</th>
                        <th>U</th>
                        <th>Zoom</th>
                    </tr>
                </thead>

                <tbody>{items.map((prop, idx) =>
                    <tr key={prop.id}>
                        <th children={prop.name} />
                        <td children={prop.unique_number} />
                        <td children={prop.buildings.length} />
                        <td children={calcTotalUnits(prop)} />
                        <td>
                            <Button
                                children='>'
                                onClick={() => onEditRequest(idx)}
                            />
                        </td>
                    </tr>,
                )}</tbody>
            </table>

            <hr />
        </>}

        <Button
            children='Add New'
            onClick={() => onEditRequest(-1)}
        />
    </>
}

const calcTotalUnits = prop =>
    prop.buildings?.reduce(
        (sum, b) => sum + b.units?.length || 0,
        0,
    )
