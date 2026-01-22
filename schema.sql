begin;


create type management_type as enum ('weg', 'mv');
create type unit_type as enum ('apartment', 'office', 'garden', 'parking');


create table property_managers (
    id      serial primary key,
    name    text not null,
    address text not null,

    unique (name, address)
);


create table accountants (
    id      serial primary key,
    name    text not null,
    address text not null,

    unique (name, address)
);


create table properties (
    id                  serial primary key,
    name                text not null,
    unique_number       text not null unique,
    management_type     management_type not null,
    total_mea           numeric not null,
    property_manager_id int not null references property_managers(id),
    accountant_id       int not null references accountants(id)
);


create table declaration_files (
    property_id int primary key references properties(id) on update cascade on delete cascade,
    content bytea not null
);


create table buildings (
    id                serial primary key,
    property_id       int not null references properties(id) on update cascade on delete cascade,
    name              text not null,
    street            text not null,
    house_number      text not null,
    construction_year int not null,
    description       text not null default ''
);


create table units (
    id                 serial primary key,
    building_id        int not null references buildings(id) on update cascade on delete cascade,
    number             text not null,
    type               unit_type not null,
    floor              text not null,
    entrance           text not null,
    size               numeric not null,
    co_ownership_share numeric not null,
    construction_year  int not null,
    rooms              int not null default 0,
    description        text not null default ''
);


commit;
