import {Card} from '@radix-ui/themes'


export default ({items}) =>
    items.length > 0 &&
        items.map(p => <PropertyCard key={p.name} prop={p} />)


const PropertyCard = ({prop}) => {
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
        </Card>
    )
}
