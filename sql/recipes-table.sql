create table recipes (
  id uuid primary key default gen_random_uuid(),
  title text,
  image_url text,
  link text unique,
  ingredients text[],
  category text,
  source text default 'lecker',
  created_at timestamp with time zone default now()
);
create index idx_recipes_category on recipes(category);
