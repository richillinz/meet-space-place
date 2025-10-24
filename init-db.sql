-- enable postgis extension for location queries
create extension if not exists postgis;

-- users table
create table users (
  id serial primary key,
  email varchar(255) unique,
  password_hash varchar(255),
  account_type varchar(20) check (account_type in ('registered', 'guest')) default 'registered',
  full_name varchar(255) not null,
  age integer check (age >= 13 and age <= 120),
  bio text,
  profile_photo_url varchar(500),
  town varchar(255),
  location geography(point, 4326),
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

-- interests table
create table interests (
  id serial primary key,
  name varchar(100) unique not null,
  category varchar(100),
  created_at timestamp default current_timestamp
);

-- user_interests junction table
create table user_interests (
  user_id integer references users(id) on delete cascade,
  interest_id integer references interests(id) on delete cascade,
  primary key (user_id, interest_id)
);

-- events table
create table events (
  id serial primary key,
  creator_id integer references users(id) on delete cascade,
  title varchar(255) not null,
  description text,
  activity_type varchar(100),
  location geography(point, 4326) not null,
  address varchar(500),
  town varchar(255),
  event_date timestamp not null,
  max_attendees integer check (max_attendees > 0),
  current_attendees integer default 0,
  min_age integer,
  max_age integer,
  experience_level varchar(50),
  allow_guest_accounts boolean default true,
  status varchar(20) check (status in ('open', 'full', 'cancelled', 'completed')) default 'open',
  created_at timestamp default current_timestamp,
  updated_at timestamp default current_timestamp
);

-- event_interests junction table
create table event_interests (
  event_id integer references events(id) on delete cascade,
  interest_id integer references interests(id) on delete cascade,
  primary key (event_id, interest_id)
);

-- qualifications table
create table qualifications (
  id serial primary key,
  event_id integer references events(id) on delete cascade,
  question text not null,
  question_type varchar(50) check (question_type in ('text', 'multiple_choice', 'yes_no', 'number')),
  options jsonb,
  required boolean default true,
  order_position integer,
  created_at timestamp default current_timestamp
);

-- event_applications table
create table event_applications (
  id serial primary key,
  event_id integer references events(id) on delete cascade,
  user_id integer references users(id) on delete cascade,
  status varchar(20) check (status in ('pending', 'approved', 'rejected', 'withdrawn')) default 'pending',
  applied_at timestamp default current_timestamp,
  reviewed_at timestamp,
  unique(event_id, user_id)
);

-- application_answers table
create table application_answers (
  id serial primary key,
  application_id integer references event_applications(id) on delete cascade,
  qualification_id integer references qualifications(id) on delete cascade,
  answer text not null,
  created_at timestamp default current_timestamp
);

-- matches table
create table matches (
  id serial primary key,
  event_id integer references events(id) on delete cascade,
  user1_id integer references users(id) on delete cascade,
  user2_id integer references users(id) on delete cascade,
  matched_at timestamp default current_timestamp,
  unique(event_id, user1_id, user2_id)
);

-- messages table
create table messages (
  id serial primary key,
  sender_id integer references users(id) on delete cascade,
  recipient_id integer references users(id) on delete cascade,
  event_id integer references events(id) on delete set null,
  message_text text not null,
  read boolean default false,
  sent_at timestamp default current_timestamp
);

-- create spatial index for location queries
create index idx_users_location on users using gist(location);
create index idx_events_location on events using gist(location);
create index idx_events_date on events(event_date);
create index idx_events_status on events(status);
create index idx_applications_status on event_applications(status);
create index idx_messages_recipient on messages(recipient_id, read);

-- create function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = current_timestamp;
  return new;
end;
$$ language plpgsql;

-- create triggers for updated_at
create trigger update_users_updated_at before update on users
  for each row execute procedure update_updated_at_column();

create trigger update_events_updated_at before update on events
  for each row execute procedure update_updated_at_column();
