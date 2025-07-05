
CREATE TYPE library_access_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE book_access_status    AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE handover_status       AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE book_handover_type    AS ENUM ('return', 'borrow');

-- 4. Create tables

-- Note: "user" is a reserved word, so we quote it
CREATE TABLE IF NOT EXISTS "user" (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  thumbnail   TEXT,
  password    VARCHAR(255) NOT NULL,
  email       VARCHAR(100) NOT NULL UNIQUE,
  status      VARCHAR(100) NOT NULL,
  address     VARCHAR(255),
  createdAt  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "library" (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  user_id     INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  thumbnail   TEXT,
  address     VARCHAR(255),
  is_private  BOOLEAN DEFAULT FALSE,
  status      VARCHAR(100) NOT NULL,
  createdAt  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "book" (
  id             SERIAL PRIMARY KEY,
  title          VARCHAR(255) NOT NULL,
  author         VARCHAR(255) NOT NULL,
  thumbnail      TEXT,
  description    TEXT,
  owner_id       INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  library_id     INT REFERENCES library(id) ON DELETE CASCADE,
  borrower_id    INT REFERENCES "user"(id),
  is_private     BOOLEAN DEFAULT FALSE,
  borrowed_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  return_by_date TIMESTAMP,
  status         VARCHAR(100) NOT NULL,
  createdAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "library_access" (
  id            SERIAL PRIMARY KEY,
  library_id    INT NOT NULL REFERENCES library(id) ON DELETE CASCADE,
  user_id       INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  owner_id      INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  status        library_access_status NOT NULL DEFAULT 'pending',
  requested_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at   TIMESTAMP,
  createdAt    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "book_access" (
  id             SERIAL PRIMARY KEY,
  book_id        INT NOT NULL REFERENCES book(id) ON DELETE CASCADE,
  borrower_id    INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  owner_id       INT NOT NULL REFERENCES "user"(id) ON DELETE CASCADE,
  library_id     INT NOT NULL REFERENCES library(id) ON DELETE CASCADE,
  status         book_access_status NOT NULL DEFAULT 'pending',
  requested_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  approved_at    TIMESTAMP,
  return_by_date TIMESTAMP,
  createdAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "book_handovers" (
  id                   SERIAL PRIMARY KEY,
  book_id              INT NOT NULL REFERENCES book(id),
  lender_id            INT NOT NULL REFERENCES "user"(id),
  borrower_id          INT NOT NULL REFERENCES "user"(id),
  meeting_location     VARCHAR(255),
  meeting_date         DATE,
  meeting_time         TIME,
  handover_status      handover_status NOT NULL DEFAULT 'pending',
  book_handover_type   book_handover_type NOT NULL DEFAULT 'borrow',
  handover_confirmed   BOOLEAN NOT NULL DEFAULT FALSE,
  borrower_phone_number VARCHAR(10),
  lender_phone_number   VARCHAR(10),
  last_editor_id       INT REFERENCES "user"(id),
  handover_pin         INT,
  createdAt            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt            TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. Seed data
INSERT INTO "user"(id, name, email, password, status, address, thumbnail)
VALUES
  (1, 'John Doe',  'john.doe@example.com',  'password123', 'active', '123 Main St, Springfield', 'https://example.com/john-thumbnail.jpg'),
  (2, 'Jane Smith','jane.smith@example.com','password456', 'active', '456 Elm St, Springfield', 'https://example.com/jane-thumbnail.jpg');

INSERT INTO library(name, description, status, user_id, is_private, thumbnail)
VALUES
  ('Central Library',   'This is the main library',     'active', 1, FALSE, 'https://example.com/central-library-thumbnail.jpg'),
  ('Community Library', 'A small community library',     'active', 2, TRUE,  'https://example.com/community-library-thumbnail.jpg');
