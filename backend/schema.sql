create type management_type as enum ('weg', 'mv');
create type unit_type as enum ('apartment', 'office', 'garden', 'parking');

create table property_managers (
    id          serial primary key,
    name        text not null,               -- e.g. "immoguard berlin gmbh"
    address     text,                        -- e.g. "musterstraße 1, 10115 berlin"
    notes       text                         -- optional free text
);

create table accountants (
    id          serial primary key,
    name        text not null,               -- e.g. "finanzexpertise müller & co kg"
    address     text,                        -- e.g. "rechnungsallee 99, 10557 berlin"
    notes       text                         -- optional
);

create table properties (
    id                      serial primary key,
    name                    text not null,               -- e.g. "parkview residences berlin"
    unique_number           text unique,                 -- e.g. "10-557-prb"
    management_type         management_type not null,
    property_manager_id     integer references property_managers(id) on delete set null,
    accountant_id           integer references accountants(id) on delete set null,
    declaration_file_path   text,                        -- path to uploaded teilungserklärung pdf
    total_mea               numeric                      -- optional total co-ownership (1000/1000 etc.)
);

create table buildings (
    id              serial primary key,
    property_id     integer not null references properties(id) on delete cascade,
    name            text not null,               -- e.g. "haus a – parkside", "haus b – cityside"
    street          text not null,
    house_number    text not null,
    construction_year integer,
    description     text                          -- e.g. energy standard, floors, elevator info
);

create table units (
    id                  serial primary key,
    building_id         integer not null references buildings(id) on delete cascade,
    number              text not null,               -- e.g. "01", "tg-01", "14"
    type                unit_type not null,
    floor               text,                        -- e.g. "erdgeschoss", "1 obergeschoss", "penthouse"
    entrance            text,                        -- e.g. "eingang a", "eingang b"
    size                numeric,                     -- m², e.g. 95.00
    co_ownership_share  numeric,                     -- e.g. 110.0 (meaning 110/1000)
    construction_year   integer,
    rooms               integer,                     -- e.g. 3; null for parking/garden/office if not applicable
    description         text                         -- e.g. "erdgeschosswohnung links gelegen, inklusive terrasse"
);
