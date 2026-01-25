# gwn's simple property management dashboard for Buena

## Project Info

Simple property management dashboard designed for efficiency.

[Check out the demo
here](https://www.loom.com/share/7db8585a6fa649beb4bbbd3188b25749)

See [the requirement specification](meta/reqspec.md) for the
original project requirements.

See [the technical specification](meta/techspec.md) for the
summary of the tech stack and the reasons behind the choices.


## Dependencies

- PostgreSQL >= v13
- Node, NPM (Find required versions under `package.json/engines`)
- Anthropic API access


## Setup

```bash
psql < schema.sql
cp env-example env
$EDITOR env
npm i
npm run dev:be
npm run dev:fe
```

Note that a Swagger API documentation is available, see backend
logs for the URL.
