# Technical Spec

## Summary

- Language: Javascript

- DB: PostgreSQL

- Backend: REST API powered by Node & Fastify. Massive.js as DB
  interface.

- Frontend: React & Vite

- Teilungserklärung Parsing: Anthropic Claude API


## Language

Considered: Javascript, Typescript

Winner: Javascript

Javascript was chosen for its better development velocity
especially in new projects. Migration to Typescript might be an
option in the future.


## Database

Considered: Postgres, MariaDB, MongoDB, Redis, Cassandra

Winner: Postgres

Opted for a SQL RDBMS instead of noSQL options. Strict schemas,
referential integration, ACID guarantees and SQL's stellar
analysis capabilities as well as the sheer number of compatible
tools in the ecosystem are big pluses.

Unless there is a specific need that would justify noSQL solutions
(such as concurrent write heavy apps), Postgres is a go-to.

MariaDB wasn't chosen because Postgres is simply better overall
except for performance in some larger scale scenarios.


## API Protocol

Considered: REST, GraphQL, gRPC, tRPC

Winner: REST

REST is a default choice as it's simple to implement and widely
recognized. It is usually the go-to option unless the project
really benefits from the killer features of the alternatives.

GraphQL: The project doesn't require its read/write granularity.

gRPC: The project doesn't require its performance benefits.

tRPC: Good contender but results in heavy coupling between the
frontend and the backend and I don't prefer it unless it really
makes a difference. For reusing the same schemas on both the
backend and the frontend, we can also opt for shared JSONSchemas
which is the approach I followed in this project.


## Backend Framework

Considered: Fastify, NestJS, Express

Winner: Fastify

For the purposes of this project a micro-framework is sufficient,
which is why I went with Fastify. Express was not chosen as it is
dated, even if very stable.


## Backend - Database Integration

Considered: Massive, Sequelize, raw SQL

Winner: Massive

Massive is preferred because it is designed specifically for
Postgres and gives an ORM feel despite not being one. Fetches
table and field declarations automatically using Postgres'
introspection features so no schema declaration in Javascript is
needed as well. It is my go-to when using Postgres.

Raw SQL isn't such a bad option as well in case of small projects,
but it is still too low level for this one. Since most database
operations are pretty standard here, we have much to benefit from
a higher level library.


## Frontend Framework

Considered: Bare-bones React, CRA, Next

Winner: Bare-bones React

Project requirements are little so a minimalistic configuration
will serve us better.


## Frontend State Management

Considered: Zustand, Context, None

Winner: None

We have so few scenes that there isn't a need to use central state
management. Everything is better done with prop drilling in this
case.


## Teilungserklärung Parsing

Considered: Gemini, OpenAI, Claude

Winner: Claude

Gemini and OpenAI are declining my credit card. Not a lot of
technical considerations made here.
