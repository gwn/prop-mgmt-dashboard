import {Button} from '@/ui'


export default function PropertyListing({
    items = [],
    onEditRequest,
}) {
    return <>
        <Button
            children='Add New'
            onClick={() => onEditRequest(-1)}
        />

        {items.length > 0 &&
            items.map((p, idx) =>
                <PropertyCard
                    key={p.name}
                    prop={p}
                    onEditRequest={() => onEditRequest(idx)}
                />)}
    </>
}


const PropertyCard = ({prop, onEditRequest}) => {
    const unitNumber =
        prop.buildings?.reduce(
            (sum, b) => sum + b.units?.length || 0,
            0,
        )

    return (
        <article>
            <strong>{prop.name}</strong>

            <br />No: {prop.unique_number || '—'}
            <br />Buildings: {prop.buildings?.length || 0}
            <br />Units: {unitNumber}

            <Button
                children='Edit'
                onClick={onEditRequest}
            />
        </article>
    )
}
