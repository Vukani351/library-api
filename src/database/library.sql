-- Create the database
CREATE DATABASE IF NOT EXISTS test_library_db;

-- Use the database
USE library_db;

-- Create the `user` table
CREATE TABLE IF NOT EXISTS user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  thumbnail TEXT,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(100) NOT NULL,
  address VARCHAR(255),
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the `library` table
CREATE TABLE IF NOT EXISTS library (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  user_id INT NOT NULL,
  thumbnail TEXT,
  address VARCHAR(255),
  is_private INT DEFAULT 0,
  status VARCHAR(100) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Create the `book` table
CREATE TABLE IF NOT EXISTS book (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  thumbnail TEXT,
  description TEXT,
  owner_id INT NOT NULL,
  library_id INT,
  borrower_id INT,
  is_private INT DEFAULT 0,
  borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  return_by_date TIMESTAMP,
  status VARCHAR(100) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (library_id) REFERENCES library(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS library_access (
  id INT AUTO_INCREMENT PRIMARY KEY,
  library_id INT NOT NULL,
  user_id INT NOT NULL,
  owner_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (library_id) REFERENCES library(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS book_access (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  borrower_id INT NOT NULL,
  owner_id INT NOT NULL,
  library_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  return_by_date TIMESTAMP,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE CASCADE,
  FOREIGN KEY (borrower_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS book_handovers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    book_id INT NOT NULL,
    lender_id INT NOT NULL,
    borrower_id INT NOT NULL,
    meeting_location VARCHAR(255),
    meeting_date DATE,
    meeting_time TIME,
    handover_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
    handover_confirmed BOOLEAN DEFAULT FALSE,
    borrower_phone_number VARCHAR(10),
    lender_phone_number VARCHAR(10),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (book_id) REFERENCES book(id),
    FOREIGN KEY (lender_id) REFERENCES user(id),
    FOREIGN KEY (borrower_id) REFERENCES user(id)
);

-- Insert a new user with explicit ID's.
INSERT INTO user (id, name, email, password, status, address, thumbnail)
VALUES 
(1, 'John Doe', 'john.doe@example.com', 'password123', 'active', '123 Main St, Springfield', 'https://example.com/john-thumbnail.jpg'),
(2, 'Jane Smith', 'jane.smith@example.com', 'password456', 'active', '456 Elm St, Springfield', 'https://example.com/jane-thumbnail.jpg');

-- Insert a new library referencing those user IDs
INSERT INTO library (name, description, status, user_id, is_private, thumbnail)
VALUES 
('Central Library', 'This is the main library', 'active', 1, 0, 'https://example.com/central-library-thumbnail.jpg'),
('Community Library', 'A small community library', 'active', 2, 1, 'https://example.com/community-library-thumbnail.jpg');