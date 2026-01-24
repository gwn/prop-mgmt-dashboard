import {Card, Button} from '@radix-ui/themes'


export default function PropertyListing({
    items = [],
    onEditRequest,
}) {
    return items.length > 0 &&
        items.map((p, idx) =>
            <PropertyCard
                key={p.name}
                prop={p}
                onEditRequest={() => onEditRequest(idx)}
            />)
}


const PropertyCard = ({prop, onEditRequest}) => {
    const unitNumber =
        prop.buildings?.reduce(
            (sum, b) => sum + b.units?.length || 0,
            0,
        )

    return (
        <Card size={2}>
            <strong>{prop.name}</strong>

            <br />Type: {prop.management_type}
            <br />Number: {prop.unique_number || '—'}
            <br />Buildings: {prop.buildings?.length || 0}
            <br />Units: {unitNumber}

            <Button
                children='Edit'
                onClick={onEditRequest}
            />
        </Card>
    )
}
