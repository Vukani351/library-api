# Wishlist feature for your personal library platform

Given your current setup — Supabase/PostgreSQL, with each user creating their own book records — I would build the wishlist as a separate feature that connects to your existing books, without requiring you to rebuild your library around a shared catalogue.

The long-term vision is particularly interesting: your platform can help people track the books they want, discover books owned by other members, and eventually buy, swap, or receive books from the community.

I would design this around three principles:

- Simple now: adding a book to a wishlist should take seconds.
- Separate ownership from desire: owning a book and wanting a book are different things.
- Ready for the community: the database should eventually support book matching and exchanges without a major redesign.

## 1. Recommended architecture

## User account

Supabase Auth

### My Library

Books the user owns

Existing feature

### My Wishlist

Books the user wants

New feature

### Supabase / PostgreSQL

Separate wishlist records, existing book records, Row Level Security

### Community Book Exchange

Discover matches, make offers, arrange exchanges

Future phase

The most important architectural choice is that a wishlist entry should not be a new owned-book record.

Your existing book table remains responsible for books in personal libraries. A new wishlist table records what a user wants. Initially, a wishlist entry can contain its own title and author. Later, it can optionally reference a book in another member's library or a shared catalogue record.

This lets you launch the wishlist without having to consolidate every user's existing book records.

## 2. Database design for Supabase

I would start with one new table called `wishlist_items`. Do not rename or repurpose your existing books table.

### A. The `wishlist_items` table

Here is the initial schema I recommend.

| Column | Type | Purpose |
| --- | --- | --- |
| `id` | `uuid` | Unique wishlist entry |
| `user_id` | `uuid` | User who wants the book |
| `title` | `text` | Book title |
| `author` | `text` | Author |
| `isbn` | `text` | Optional edition identifier |
| `cover_url` | `text` | Optional cover image |
| `intent` | `text` | `read`, `buy`, or `both` |
| `priority` | `text` | `low`, `medium`, `high` |
| `visibility` | `text` | `public` or `private` |
| `status` | `text` | `active`, `acquired`, `removed` |
| `notes` | `text` | Personal notes |
| `created_at` | `timestamptz` | Date added |
| `updated_at` | `timestamptz` | Last updated |

I would deliberately store the title and author directly in the wishlist entry for your first version. Since every user currently creates their own book records, this makes the wishlist independent of the existing ownership model.

Later, when you introduce a shared catalogue, you can add a nullable `catalogue_book_id` that references a canonical book record. You can then match older wishlist entries to the catalogue gradually.

### B. Initial SQL migration

The following is a starting migration you can adapt to your project. It assumes Supabase Auth user IDs are UUIDs.

sql

```

create table public.wishlist_items (
  id uuid primary key default gen_random_uuid(),

  user_id uuid not null
    references auth.users(id) on delete cascade,

  title text not null
    check (length(trim(title)) > 0),

  author text,

  isbn text,
  cover_url text,

  intent text not null default 'read'
    check (intent in ('read', 'buy', 'both')),

  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),

  visibility text not null default 'public'
    check (visibility in ('public', 'private')),

  status text not null default 'active'
    check (status in ('active', 'acquired', 'removed')),

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index wishlist_items_user_status_idx
  on public.wishlist_items (user_id, status);

create index wishlist_items_public_idx
  on public.wishlist_items (created_at desc)
  where visibility = 'public' and status = 'active';

create index wishlist_items_isbn_idx
  on public.wishlist_items (isbn)
  where isbn is not null;

alter table public.wishlist_items
  enable row level security;

revoke all on public.wishlist_items from anon, authenticated;

grant select, insert, update, delete
  on public.wishlist_items to authenticated;

-- Owners can see all their entries, including private
-- entries and items marked as acquired or removed.
create policy "Owners can read their wishlist"
  on public.wishlist_items
  for select to authenticated
  using ((select auth.uid()) = user_id);

-- Signed-in community members can read active public wishes.
create policy "Members can read public wishes"
  on public.wishlist_items
  for select to authenticated
  using (
    visibility = 'public'
    and status = 'active'
  );

create policy "Owners can add wishlist items"
  on public.wishlist_items
  for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Owners can update wishlist items"
  on public.wishlist_items
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Owners can delete wishlist items"
  on public.wishlist_items
  for delete to authenticated
  using ((select auth.uid()) = user_id);
```

The SQL applies the important ownership and visibility rules at the database level. Supabase recommends combining grants with Row Level Security (RLS), rather than relying on front-end visibility controls alone.

Supabase Docs

Important behaviour: this example makes public wishes visible to signed-in community members, not unauthenticated visitors. If you want anyone on the internet to browse public wishlists without logging in, that requires a deliberate additional public-read policy and a review of the profile information exposed alongside those entries.

Also, `updated_at` will need a small PostgreSQL trigger to update automatically on edits. Add that before shipping.

### C. What about the user's existing book records?

Leave the existing table intact. For example, if you currently have:

- `books` — books created by individual users
- `user_id` — owner of each record
- `title`, `author`, `isbn`, `cover_url` — book metadata

Then the wishlist should initially be independent of that table.

When a user adds a book from their own library, you can offer a shortcut to create a wishlist entry from that book's metadata. However, you should not require every wishlist entry to reference an owned book, because the entire purpose is to save books the user does not yet own.

## 3. Visibility and privacy rules

Because you've chosen public by default, I would make the visibility control prominent but easy to change.

| Situation | Expected behaviour |
| --- | --- |
| New wish created | Public by default |
| User changes it to private | Only its owner can see it |
| User marks it acquired | It disappears from public active-wishlist views |
| User marks it removed | It disappears from public views |
| Another member views the owner's profile | They see only public, active wishes |
| Another member tries to edit or delete a wish | Denied by RLS |

The last two rules are particularly important. The owner should be able to see their complete wishlist history, but other users should not be able to see private entries or alter somebody else's wishes.

I would also avoid exposing email addresses, personal notes, or other private profile information through community wishlist pages. If you want to show who wants a book, use a public profile or display name.

Before release, test the policies using at least two accounts and a signed-out session. Supabase also recommends testing allowed and denied operations for each exposed table.

Supabase Docs

## 4. Wishlist page UX

I would give the wishlist its own page in the main navigation, alongside My Library, rather than burying it inside the library management screens.

The page should support three main activities: adding books, organising wishes, and discovering books from the community.

### A. Page layout

# My Wishlist

Your next reads, all in one place.

Search title or author...

AllWant to readWant to buyAcquired

### Your books

12 items

The Hobbit - HO-9780618260300 | Houghton Mifflin | Classics

### The Hobbit

J.R.R. Tolkien

Want to readHigh priority

Public

Looking for a second-hand copy.

Edit

More options ···

### Atomic Habits

James Clear

Want to buy

Private

Paperback preferred.

Edit

More options ···

### Add another book

Search for a book or enter its details.

Illustrative design concept, not connected to your database.

### B. The Add Book flow

I would make this a modal or side panel on desktop, and a full-screen sheet on mobile.

## Add to wishlist

Book title \*

Author

What do you want to do with this book?read Read it

Buy a copy

Read it and buy a copy

PriorityLow

medium Medium

High

Visibilitypublic Public — visible to the community

Private — only visible to me

Notes (optional)

 Copy sample entry Interactive mockup only. It prepares a sample entry for copying; it does not save anything to Supabase.

In the actual application, I would use this workflow:

1. Search existing books in the user's library first, and eventually in the shared catalogue.
2. Show matching results with title, author, and cover.
3. Let the user select a result or choose manual entry.
4. Ask for intent, priority, and visibility, with sensible defaults.
5. Save and immediately show the book in the wishlist.

Do not force users to complete every field. Title alone should be enough to create a basic wishlist entry.

### C. Filters and sorting

For the initial release, I would include:

- Search by title or author.
- Filter by Want to Read, Want to Buy, Both, and Acquired.
- Filter by Public and Private.
- Sort by Recently Added, Highest Priority, and Title.
- A toggle to view or hide acquired books.

I would keep a separate Community Wishlist page or tab for browsing other members' public, active wishes. That keeps personal organisation distinct from community discovery.

## 5. The future community book exchange

This is where your platform can become more than a library tracker.

I would build the community experience around three separate entities:

- A wishlist item — someone wants a book.
- An available book listing — someone has a specific copy they are willing to sell, swap, or give away.
- An offer or exchange — a proposed transaction between two members.

These should not be the same database record.

### Phase 1 — Launch the personal wishlist

Build the wishlist table, page, editing tools, filters, visibility settings, and acquired status.

When a user acquires a book, give them the option to add it to their existing library. If they already have that book recorded, let them choose the relevant existing entry rather than automatically creating a duplicate.

### Phase 2 — Introduce community discovery

Allow members to browse public wishes and see aggregate demand.

For example:

The Hobbit, J.R.R Tolkien – thevintagebookcompany

## The Hobbit

J.R.R. Tolkien

12 members want this book.

Community demand

Illustrative example. Demand counts would be calculated from actual public, active wishlist entries.

Initially, use title, author, and ISBN to identify likely matches. ISBN is especially useful for editions, while title and author matching can help with older books that lack an ISBN or have incomplete metadata.

Avoid treating every matching title as the same physical edition. The same book can have different translations, formats, publication years, and cover designs.

### Phase 3 — Add availability listings

Create a new table for individual copies that members explicitly make available.

A possible `book_listings` table would contain:

| Field | Purpose |
| --- | --- |
| `id` | Unique listing |
| `owner_id` | Member offering the copy |
| `book_id` | Reference to their existing book record |
| `listing_type` | Sale, swap, or giveaway |
| `price_amount` | Optional asking price |
| `currency` | Currency for the asking price |
| `condition` | Book's physical condition |
| `status` | Available, reserved, completed, withdrawn |
| `created_at` | Date listed |

This model makes an important distinction: a person can own a book without being willing to part with it.

A book only becomes a potential marketplace match when its owner creates an active listing. You can then show matching listings on a wishlist entry, notify interested members, or provide a contact action.

### Phase 4 — Add offers and exchanges

Add a separate `book_offers` or `exchange_requests` table. Each record should link the requesting member to a specific listing and track the lifecycle of the offer.

A simple lifecycle might be:

`pending → accepted → completed`

With alternative outcomes such as `declined`, `cancelled`, and `expired`.

At this stage, you can add messaging, reservation windows, trade proposals, delivery or collection arrangements, and eventually payment integrations.

Keep transaction details and status changes server-validated so users cannot mark somebody else's listing as sold or complete an offer they do not control.

## 6. How to match wishlists to books in existing libraries

Since your books are currently stored as separate user-created records, matching will be the most technically challenging part of the future community feature.

I would introduce matching in stages.

| Matching method | Reliability | Best use |
| --- | --- | --- |
| Exact ISBN | High for edition identification | Primary match when available |
| Normalised title + author | Moderate | Books without ISBNs |
| Fuzzy title search | Variable | Suggesting possible matches |
| Shared catalogue ID | High when correctly assigned | Long-term solution |

For example, these records may refer to the same book:

- `The Hobbit` — J.R.R. Tolkien
- `The Hobbit: Or There and Back Again` — J.R.R. Tolkien
- `El Hobbit` — J.R.R. Tolkien

You should not automatically assume these are interchangeable. The third may be a Spanish-language edition, and the second may be a differently recorded title.

My long-term recommendation is to introduce a canonical book catalogue. Each user's owned copy can eventually reference a shared book or edition record, while retaining its own condition, location, ownership, and personal notes.

You do not have to migrate all your existing records immediately. You can add catalogue matching incrementally as users add or edit books.

## 7. Supabase security and implementation details

There are a few technical details I would address before launching.

### Automatic `updated_at` handling

The earlier SQL schema needs a trigger to maintain `updated_at` whenever an entry changes.

sql

```

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger wishlist_items_set_updated_at
before update on public.wishlist_items
for each row
execute function public.set_updated_at();
```

### RLS testing checklist

Test the following using separate test accounts:

- A user can create, edit, and delete their own wishlist entries.
- A user cannot create an entry on behalf of another user.
- A user can read their own private entries.
- Another signed-in user can read public, active entries.
- Another signed-in user cannot read private, acquired, or removed entries.
- Another signed-in user cannot edit or delete someone else's entry.
- A signed-out visitor cannot access the table under the proposed authenticated-only policy.

Also ensure that your community page queries only the fields it needs. If you later create views or database functions for public wishlist discovery, review their security configuration carefully: PostgreSQL views can bypass underlying RLS policies unless configured appropriately.

Supabase Docs

## 8. Suggested implementation roadmap

Here is the order I would use to build this with the least disruption to your current application.

### Step 1 — Database

Foundation

Create `wishlist_items`, add indexes, configure RLS, and test ownership and visibility.

### Step 2 — Wishlist interface

User experience

Build the wishlist page, add-book form, editing, filters, sorting, and empty states.

### Step 3 — Library integration

Connect existing features

Add actions to move acquired books into the personal library without creating accidental duplicates.

### Step 4 — Community discovery

After the personal feature is stable

Build public wishlist browsing, book demand counts, and matching against member-owned books.

### Step 5 — Marketplace

Future release

Add listings, offers, exchanges, messaging, and transaction management.

## My final recommendation

Start with the separate `wishlist_items` table and the personal wishlist page. Keep the existing user-created books table intact, make wishlist entries public by default with a clear private option, and enforce those rules using RLS.

Then introduce a shared book catalogue and separate availability listings when you're ready for community exchanges. That will give your platform a much stronger foundation than trying to turn every wishlist entry into an owned book or a marketplace listing.

One final detail would help me tailor the next step: what is the name of your existing books table, and what are its current columns — especially the user ID, title, author, ISBN, and cover image fields? If you share that schema (you can copy it from the Supabase Table Editor), I can adapt the migration and design the integration with your existing database rather than guessing at your structure.