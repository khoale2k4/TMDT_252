create type user_role as enum ('customer', 'staff', 'manager', 'owner', 'admin');

create type venue_status as enum ('active', 'closed', 'suspended');

create type court_status as enum ('active', 'maintenance', 'inactive');

create type slot_status as enum ('available', 'locked', 'booked', 'maintenance');

create type booking_status as enum ('pending_payment', 'confirmed', 'cancelled', 'completed');

create type payment_status as enum ('pending', 'paid', 'failed', 'refunded');

create type review_status as enum ('published', 'hidden');

create table if not exists users
(
    id            uuid                     default uuid_generate_v4() not null
    primary key,
    email         varchar(255)                                        not null
    unique,
    password_hash text                                                not null,
    full_name     varchar(255)                                        not null,
    phone         varchar(20),
    role          user_role                default 'customer'::user_role,
    avatar_url    text,
    created_at    timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at    timestamp with time zone default CURRENT_TIMESTAMP
                                );

create table if not exists venues
(
    id            uuid                     default uuid_generate_v4() not null
    primary key,
    owner_id      uuid
    references users,
    name          varchar(255)                                        not null,
    slug          varchar(300)
    unique,
    description   text,
    phone         varchar(20),
    email         varchar(255),
    address       text                                                not null,
    lat           numeric(10, 8)
    constraint chk_lat_range
    check ((lat >= ('-90'::integer)::numeric) AND (lat <= (90)::numeric)),
    lng           numeric(11, 8)
    constraint chk_lng_range
    check ((lng >= ('-180'::integer)::numeric) AND (lng <= (180)::numeric)),
    working_hours jsonb                    default '{}'::jsonb,
    amenities     jsonb                    default '[]'::jsonb,
    bank_account  jsonb                    default '{}'::jsonb,
    status        venue_status             default 'active'::venue_status,
    rating_avg    numeric(3, 2)            default 0.0
    constraint chk_rating
    check ((rating_avg >= (0)::numeric) AND (rating_avg <= (5)::numeric)),
    total_reviews integer                  default 0,
    created_at    timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at    timestamp with time zone default CURRENT_TIMESTAMP
                                );

create index if not exists idx_venues_status
    on venues (status);

create index if not exists idx_venues_coordinates
    on venues (lat, lng);

create index if not exists idx_venues_slug
    on venues (slug);

create index if not exists idx_venues_owner
    on venues (owner_id);

create table if not exists courts
(
    id           uuid                     default uuid_generate_v4() not null
    primary key,
    venue_id     uuid                                                not null
    references venues
    on delete cascade,
    court_name   varchar(100)                                        not null,
    sport_type   varchar(50)                                         not null,
    description  text,
    base_price   integer                  default 0                  not null
    constraint chk_base_price
    check (base_price >= 0),
    surface_type varchar(50),
    has_lighting boolean                  default false,
    has_roof     boolean                  default false,
    max_players  integer                  default 4
    constraint chk_max_players
    check (max_players > 0),
    images       jsonb                    default '[]'::jsonb,
    status       court_status             default 'active'::court_status,
    created_at   timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at   timestamp with time zone default CURRENT_TIMESTAMP,
        constraint uq_court_name_per_venue
        unique (venue_id, court_name)
    );

create index if not exists idx_courts_venue_id
    on courts (venue_id);

create index if not exists idx_courts_sport_type
    on courts (sport_type);

create index if not exists idx_courts_status
    on courts (status);

create table if not exists slots
(
    id            uuid                     default uuid_generate_v4() not null
    primary key,
    court_id      uuid                                                not null
    references courts
    on delete cascade,
    date          date                                                not null,
    start_time    time                                                not null,
    end_time      time                                                not null,
    price         integer                                             not null
    constraint chk_slot_price
    check (price > 0),
    dynamic_price integer,
    status        slot_status              default 'available'::slot_status,
    version       integer                  default 1                  not null,
    locked_by     uuid
    references users,
    locked_until  timestamp with time zone,
    created_at    timestamp with time zone default CURRENT_TIMESTAMP,
        constraint uq_slot
        unique (court_id, date, start_time),
    constraint chk_slot_time
    check (end_time > start_time)
    );

create index if not exists idx_slots_court_date
    on slots (court_id, date);

create index if not exists idx_slots_status
    on slots (status);

create index if not exists idx_slots_date
    on slots (date);

create index if not exists idx_slots_locked_until
    on slots (locked_until)
    where (locked_until IS NOT NULL);

create table if not exists bookings
(
    id              uuid                     default uuid_generate_v4() not null
    primary key,
    user_id         uuid
    references users,
    venue_id        uuid
    references venues,
    total_amount    integer                                             not null,
    discount_amount integer                  default 0,
    tax_amount      integer                  default 0,
    final_amount    integer                                             not null
    constraint chk_booking_amount
    check (final_amount >= 0),
    status          booking_status           default 'pending_payment'::booking_status,
    notes           text,
    created_at      timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at      timestamp with time zone default CURRENT_TIMESTAMP
                                  );

create index if not exists idx_bookings_user_id
    on bookings (user_id);

create index if not exists idx_bookings_venue_id
    on bookings (venue_id);

create index if not exists idx_bookings_status
    on bookings (status);

create table if not exists booking_items
(
    id         uuid default uuid_generate_v4() not null
    primary key,
    booking_id uuid                            not null
    references bookings
    on delete cascade,
    slot_id    uuid
    references slots,
    court_id   uuid
    references courts,
    price      integer                         not null
    constraint chk_bi_price
    check (price >= 0)
    );

create table if not exists products
(
    id          uuid                     default uuid_generate_v4() not null
    primary key,
    venue_id    uuid                                                not null
    references venues
    on delete cascade,
    name        varchar(255)                                        not null,
    description text,
    price       integer                                             not null
    constraint chk_product_price
    check (price >= 0),
    stock       integer                  default 0
    constraint chk_product_stock
    check (stock >= 0),
    created_at  timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at  timestamp with time zone default CURRENT_TIMESTAMP
        );

create table if not exists booking_products
(
    id         uuid    default uuid_generate_v4() not null
    primary key,
    booking_id uuid                               not null
    references bookings
    on delete cascade,
    product_id uuid
    references products,
    quantity   integer default 1
    constraint chk_bp_qty
    check (quantity > 0),
    price      integer                            not null
    constraint chk_bp_price
    check (price >= 0)
    );

create table if not exists pricing_rules
(
    id          uuid                     default uuid_generate_v4() not null
    primary key,
    venue_id    uuid                                                not null
    references venues
    on delete cascade,
    rule_name   varchar(255)                                        not null,
    description text,
    priority    integer                  default 0,
    is_active   boolean                  default true,
    conditions  jsonb                                               not null,
    adjustments jsonb                                               not null,
    valid_from  date,
    valid_to    date,
    created_at  timestamp with time zone default CURRENT_TIMESTAMP,
        constraint chk_pr_dates
        check ((valid_to IS NULL) OR (valid_to >= valid_from))
    );

create index if not exists idx_pricing_rules_venue
    on pricing_rules (venue_id, is_active);

create table if not exists reviews
(
    id            uuid                     default uuid_generate_v4() not null
    primary key,
    venue_id      uuid                                                not null
    references venues
    on delete cascade,
    booking_id    uuid
    references bookings,
    user_id       uuid
    references users,
    rating        integer                                             not null
    constraint reviews_rating_check
    check ((rating >= 1) AND (rating <= 5)),
    comment       text,
    images        jsonb                    default '[]'::jsonb,
    status        review_status            default 'published'::review_status,
    reply_content text,
    replied_by    uuid
    references users,
    replied_at    timestamp with time zone,
    created_at    timestamp with time zone default CURRENT_TIMESTAMP
        );

create index if not exists idx_reviews_venue
    on reviews (venue_id);

create index if not exists idx_reviews_user
    on reviews (user_id);

create index if not exists idx_reviews_status
    on reviews (status);

create table if not exists payments
(
    id                      uuid                     default uuid_generate_v4() not null
    primary key,
    booking_id              uuid                                                not null
    references bookings
    on delete cascade,
    method                  varchar(50)                                         not null,
    amount                  integer                                             not null
    constraint chk_payment_amount
    check (amount > 0),
    status                  payment_status           default 'pending'::payment_status,
    provider_transaction_id varchar(255),
    paid_at                 timestamp with time zone,
    created_at              timestamp with time zone default CURRENT_TIMESTAMP,
    updated_at              timestamp with time zone default CURRENT_TIMESTAMP
        );

create index if not exists idx_payments_booking_id
    on payments (booking_id);

create table if not exists invoices
(
    id              uuid                     default uuid_generate_v4() not null
    primary key,
    booking_id      uuid
    unique
    references bookings,
    misa_invoice_no varchar(100),
    pdf_url         text,
    status          varchar(50)              default 'issued'::character varying,
    issued_at       timestamp with time zone default CURRENT_TIMESTAMP
                                  );

create table if not exists audit_logs
(
    id           uuid                     default uuid_generate_v4() not null
    primary key,
    entity_name  varchar(100)                                        not null,
    entity_id    uuid                                                not null,
    action       varchar(50)                                         not null,
    old_value    jsonb,
    new_value    jsonb,
    reason       text,
    performed_by uuid
    references users,
    ip_address   inet,
    created_at   timestamp with time zone default CURRENT_TIMESTAMP
                               );

create index if not exists idx_audit_entity
    on audit_logs (entity_name, entity_id);

create index if not exists idx_audit_performed_by
    on audit_logs (performed_by);

create function uuid_nil() returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

create function uuid_ns_dns() returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

create function uuid_ns_url() returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

create function uuid_ns_oid() returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

create function uuid_ns_x500() returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

create function uuid_generate_v1() returns uuid
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

create function uuid_generate_v1mc() returns uuid
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

create function uuid_generate_v3(namespace uuid, name text) returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

create function uuid_generate_v4() returns uuid
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

create function uuid_generate_v5(namespace uuid, name text) returns uuid
    immutable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

create function unaccent(regdictionary, text) returns text
    stable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

create function unaccent(text) returns text
    stable
    strict
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

create function unaccent_init(internal) returns internal
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

create function unaccent_lexize(internal, internal, internal, internal) returns internal
    parallel safe
    language c
as
$$
begin
-- missing source code
end;
$$;

create function generate_slug(input text) returns text
    immutable
    language plpgsql
as
$$
DECLARE
result TEXT;
BEGIN
    result := lower(unaccent(input));
    result := regexp_replace(result, '[^a-z0-9\s-]', '', 'g');
    result := regexp_replace(result, '\s+', '-', 'g');
    result := regexp_replace(result, '-+', '-', 'g');
    result := trim(both '-' from result);
RETURN result;
END;
$$;

create function trg_venues_slug() returns trigger
    language plpgsql
as
$$
BEGIN
    IF NEW.slug IS NULL OR NEW.slug = '' THEN
        NEW.slug := generate_slug(NEW.name)
                    || '-' || substring(NEW.id::text, 1, 8);
END IF;
    NEW.updated_at := CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$;

create trigger venues_slug_trigger
    before insert or update
                         on venues
                         for each row
                         execute procedure trg_venues_slug();

create function trg_courts_updated_at() returns trigger
    language plpgsql
as
$$
BEGIN
    NEW.updated_at := CURRENT_TIMESTAMP;
RETURN NEW;
END;
$$;

create trigger courts_updated_at_trigger
    before update
    on courts
    for each row
    execute procedure trg_courts_updated_at();

create function trg_bookings_updated_at() returns trigger
    language plpgsql
as
$$
BEGIN NEW.updated_at := CURRENT_TIMESTAMP; RETURN NEW; END;
$$;

create trigger bookings_updated_at_trigger
    before update
    on bookings
    for each row
    execute procedure trg_bookings_updated_at();

create function trg_payments_updated_at() returns trigger
    language plpgsql
as
$$
BEGIN NEW.updated_at := CURRENT_TIMESTAMP; RETURN NEW; END;
$$;

create trigger payments_updated_at_trigger
    before update
    on payments
    for each row
    execute procedure trg_payments_updated_at();


