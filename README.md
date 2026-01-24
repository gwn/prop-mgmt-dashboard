# gwn's simple property management dashboard for Buena

## Project Info

See the requirement and technical specs under the `meta` folder.


## Dependencies

- PostgreSQL >= v13
- Node, NPM (Find required versions under `package.json/engines`)
- Anthropic API access


## Setup

    psql < schema.sql
    cp env-example env
    $EDITOR env # fill accordingly
    npm run dev

Note that a Swagger API documentation is available, see backend
logs for the URL.


## Notes

Tested in Google Chrome.
