export default ({properties, onToggleWizard}) =>
    <div>
        <h1>Property Dashboard</h1>

        <button
            onClick={() => onToggleWizard(true)}
            children='Create new property'
        />

        {properties.length > 0 &&
            <div>
                <h2>Existing Properties</h2>

                <ul>{properties.map(p =>
                    <li key={p.id}>
                        <PropertyCard prop={p} />
                    </li>,
                )}</ul>
            </div>
        }
    </div>


const PropertyCard = ({prop}) => {
    const unitNumber =
        prop.buildings?.reduce(
            (sum, b) => sum + b.units?.length || 0,
            0,
        )

    return (
        <article>
            <strong>{prop.name}</strong>

            <br />Type: {prop.management_type}
            <br />Number: {prop.unique_number || '—'}
            <br />Buildings: {prop.buildings?.length || 0}
            <br />Units: {unitNumber}
        </article>
    )
}
