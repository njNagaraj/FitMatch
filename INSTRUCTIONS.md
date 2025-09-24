# Migrating FitMatch to Supabase Backend

This guide will walk you through setting up a Supabase project to act as the backend for the FitMatch application.

### Step 1: Create a Supabase Project

1.  Go to [supabase.com](https://supabase.com/) and sign up or log in.
2.  Click on "New project" and choose an organization.
3.  Fill in the project details (Name, Password, Region). It's recommended to choose a region physically close to your users.
4.  Wait for your new project to be provisioned. This may take a couple of minutes.

### Step 2: Get API Credentials

1.  In your Supabase project dashboard, navigate to **Project Settings** (the gear icon in the left sidebar).
2.  Click on **API**.
3.  You will find your **Project URL** and **Project API Keys**. You need the `anon` `public` key.
4.  Open the file named `src/config.ts` in your project and add your credentials. The application is configured to use these variables.

    ```typescript
    // src/config.ts
    
    // IMPORTANT: DO NOT COMMIT THIS FILE TO VERSION CONTROL IF IT'S A PUBLIC REPOSITORY
    // This file should contain your Supabase credentials.
    
    export const SUPABASE_URL = "YOUR_SUPABASE_PROJECT_URL";
    export const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
    ```

### Step 3: Set up the Database Schema

Navigate to the **SQL Editor** in your Supabase dashboard (icon with 'SQL' on it) and run the following SQL queries one by one to create the necessary tables and relationships.

#### 1. Profiles Table

This table stores public user data and is linked to the `auth.users` table, which Supabase manages.

```sql
-- Create a table for public profiles
create table profiles (
  id uuid references auth.users not null primary key,
  name text not null,
  avatar_url text,
  is_admin boolean default false,
  view_radius int default 5,
  home_location jsonb
);

-- Set up Row Level Security (RLS)
alter table profiles enable row level security;

create policy "Public profiles are viewable by everyone." on profiles
  for select using (true);

create policy "Users can insert their own profile." on profiles
  for insert with check (auth.uid() = id);

create policy "Users can update their own profile." on profiles
  for update using (auth.uid() = id);

-- This trigger automatically creates a profile entry when a new user signs up
create function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, name, avatar_url)
  values (new.id, new.raw_user_meta_data->>'name', 'https://www.w3schools.com/howto/img_avatar.png');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

#### 2. Sports Table
```sql
create table sports (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    is_team_sport boolean not null,
    activity_types text[] not null,
    levels text[] not null
);

alter table sports enable row level security;

create policy "Sports are viewable by authenticated users." on sports
  for select using (auth.role() = 'authenticated');

create policy "Admins can manage sports." on sports
  for all using (
    (select is_admin from profiles where id = auth.uid()) = true
  );
```

#### 3. Activities Table
```sql
create table activities (
    id uuid default gen_random_uuid() primary key,
    created_at timestamptz default now(),
    sport_id uuid references sports(id) on delete set null,
    other_sport_name text,
    title text not null,
    creator_id uuid references profiles(id) on delete cascade not null,
    date_time timestamptz not null,
    location_name text not null,
    location_coords jsonb not null,
    activity_type text not null,
    level text not null,
    partners_needed int not null
);

alter table activities enable row level security;

create policy "Activities are viewable by authenticated users." on activities
    for select using (auth.role() = 'authenticated');

create policy "Users can create activities." on activities
    for insert with check (auth.uid() = creator_id);

create policy "Creators can update their own activities." on activities
    for update using (auth.uid() = creator_id);

create policy "Creators can delete their own activities." on activities
    for delete using (auth.uid() = creator_id);

create policy "Admins can manage all activities." on activities
    for all using ((select is_admin from profiles where id = auth.uid()) = true);
```

#### 4. Activity Participants (Junction Table)
```sql
create table activity_participants (
    activity_id uuid references activities(id) on delete cascade not null,
    user_id uuid references profiles(id) on delete cascade not null,
    primary key (activity_id, user_id)
);

alter table activity_participants enable row level security;

create policy "Participants are viewable by authenticated users." on activity_participants
    for select using (auth.role() = 'authenticated');

create policy "Users can join an activity (insert themselves)." on activity_participants
    for insert with check (auth.uid() = user_id);

create policy "Users can leave an activity (delete themselves)." on activity_participants
    for delete using (auth.uid() = user_id);

create policy "Admins can manage participants." on activity_participants
    for all using ((select is_admin from profiles where id = auth.uid()) = true);
```

#### 5. Events Table
```sql
create table events (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    sport text not null,
    city text not null,
    date timestamptz not null,
    description text not null,
    image_url text,
    registration_url text
);

alter table events enable row level security;

create policy "Events are viewable by authenticated users." on events
    for select using (auth.role() = 'authenticated');

create policy "Admins can manage events." on events
    for all using ((select is_admin from profiles where id = auth.uid()) = true);
```

#### 6. Messages Table
```sql
create table messages (
    id uuid default gen_random_uuid() primary key,
    created_at timestamptz default now(),
    sender_id uuid references profiles(id) on delete set null,
    activity_id uuid references activities(id) on delete cascade not null,
    text text not null,
    is_system_message boolean default false
);

alter table messages enable row level security;

-- Helper function to check if a user is a participant of an activity
create or replace function is_participant(activity_id_check uuid, user_id_check uuid)
returns boolean as $$
  select exists (
    select 1 from activity_participants
    where activity_id = activity_id_check and user_id = user_id_check
  );
$$ language sql security definer;

create policy "Participants can view messages in their activity chat." on messages
    for select using (is_participant(activity_id, auth.uid()));

create policy "Participants can send messages in their activity chat." on messages
    for insert with check (is_participant(activity_id, auth.uid()) and auth.uid() = sender_id and is_system_message = false);

create policy "Admins can manage messages." on messages
    for all using ((select is_admin from profiles where id = auth.uid()) = true);
```

### Step 4: Enable Realtime for Chats

1.  In your Supabase dashboard, go to **Database** (the database icon).
2.  In the sidebar, click on **Replication**.
3.  Click on the text that says `0 tables` under "Source". Find `messages` in the list, and toggle the switch to enable it. This allows the application to listen for new messages in real-time.

### Step 5: Seed Initial Data (Optional)

Run the following SQL in the **SQL Editor** to populate your database with sports and events.

**Important:** User accounts from the mock data are gone. You must **sign up** with new or the same credentials using the app's UI. To create an admin user:
1. Sign up with an email like `admin@fitmatch.com`.
2. Go to the `profiles` table in the Supabase Table Editor.
3. Find the new admin user and change their `is_admin` column from `false` to `true`.

```sql
-- Seed Sports
insert into sports (name, is_team_sport, activity_types, levels) values
('Running', false, '{"Easy Run", "Threshold", "Long Run", "Intervals"}', '{"Beginner", "Intermediate", "Advanced"}'),
('Cycling', false, '{"Road", "Mountain", "Gravel"}', '{"Beginner", "Intermediate", "Advanced"}'),
('Swimming', false, '{"Lap Swim", "Open Water"}', '{"Beginner", "Intermediate", "Advanced"}'),
('Football', true, '{"5-a-side", "7-a-side", "11-a-side"}', '{"Casual", "Competitive"}'),
('Basketball', true, '{"3v3", "5v5", "Shooting Practice"}', '{"Casual", "Competitive"}');

-- Seed Events
insert into events (title, sport, city, date, description, image_url, registration_url) values
('Bangalore Marathon 2025', 'Running', 'Bangalore', '2025-10-12 06:00:00+00', 'The premier running event of the city. Choose from Full Marathon, Half Marathon, and 10K.', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=2070&auto=format&fit=crop', 'https://example.com/blrmarathon'),
('Mumbai Cyclothon', 'Cycling', 'Mumbai', '2025-11-23 07:00:00+00', 'Ride through the iconic streets of Mumbai in this celebrated cyclothon.', 'https://images.unsplash.com/photo-1541625602330-2277a4c46182?q=80&w=2070&auto=format&fit=crop', 'https://example.com/mumbaicyclo'),
('Chennai Soccer League Finals', 'Football', 'Chennai', '2025-09-28 18:00:00+00', 'Watch the thrilling conclusion to the Chennai Soccer League season.', 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?q=80&w=1923&auto=format&fit=crop', 'https://example.com/chennaisoccer');
```

### Step 6: Automate Chat Creation with a Database Trigger

This final step creates a trigger that automatically posts a "User has joined" or "User has left" message to a chat, ensuring chats are created and updated reliably.

**1. Create the Trigger Function**
This function contains the logic to post a message. Copy this into the Supabase **SQL Editor** and click **RUN**.
```sql
-- This function runs when a user joins or leaves an activity.
-- It securely posts a system message to the correct chat.
create or replace function public.handle_activity_participation_change()
returns trigger as $$
declare
  user_profile record;
begin
  -- Temporarily elevate privileges to bypass RLS policies for this internal operation.
  -- This is a secure way to allow the database to perform actions that users cannot.
  set local role postgres;

  if (tg_op = 'INSERT') then
    -- Get the profile of the user who joined
    select name into user_profile from public.profiles where id = new.user_id;
    -- Post a "joined" message
    insert into public.messages (activity_id, text, is_system_message)
    values (new.activity_id, user_profile.name || ' has joined the activity!', true);
  elsif (tg_op = 'DELETE') then
    -- Get the profile of the user who left
    select name into user_profile from public.profiles where id = old.user_id;
    -- Post a "left" message
    insert into public.messages (activity_id, text, is_system_message)
    values (old.activity_id, user_profile.name || ' has left the activity.', true);
  end if;

  -- Revert to the original role
  reset role;

  return null; -- The return value is ignored for AFTER triggers.
end;
$$ language plpgsql security definer;
```

**2. Create the Trigger**
This trigger attaches the function to the `activity_participants` table, so it runs automatically. Run this code in the **SQL Editor**.
```sql
-- This ensures you don't get an error if you run the script more than once.
drop trigger if exists on_participation_change on public.activity_participants;

-- This trigger calls the function above after a user is added to or removed from an activity.
create trigger on_participation_change
  after insert or delete on public.activity_participants
  for each row execute procedure public.handle_activity_participation_change();
```

You are now all set! The app will use your Supabase backend.