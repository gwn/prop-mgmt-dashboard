# gwn's simple property management dashboard for Buena

## What is this

See the requirement and technical specs under the `meta` folder.


## Dependencies

- PostgreSQL >= v13
- Node, NPM (Find required versions under `package.json/engines`)
- Google Gemini API access


## Setup

    psql < backend/schema.sql
    cp env-example env
    $EDITOR env # fill accordingly
    npm run dev

Note that a Swagger API documentation is available, see backend
logs for the URL.
