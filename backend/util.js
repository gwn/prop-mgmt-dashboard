const
    groupBy = (collection, keySelector) =>
        collection.reduce(
            (grouped, item) => {
                const key =
                    typeof keySelector === 'function'
                        ? keySelector(item)
                        : item[keySelector]

                if (!grouped[key])
                    grouped[key] = []

                grouped[key].push(item)

                return grouped
            },
            {},
        ),

    keyBy = (collection, keySelector) =>
        Object.fromEntries(
            Object.entries(
                groupBy(collection, keySelector),
            )
                .map(([k ,v]) => [k, v[0]]),
        )


module.exports = {
    groupBy,
    keyBy,
}
