-- Create the database
CREATE DATABASE IF NOT EXISTS library_db;

-- Use the database
USE library_db;

-- Create the `user` table
CREATE TABLE IF NOT EXISTS user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  thumbnail TEXT,
  name VARCHAR(100) NOT NULL,
  password VARCHAR(255) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  status VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the `library` table
CREATE TABLE IF NOT EXISTS library (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_private INT DEFAULT 0,
  user_id INT NOT NULL,
  hash VARCHAR(255) NOT NULL,
  status VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Create the `book` table
CREATE TABLE IF NOT EXISTS book (
  id INT AUTO_INCREMENT PRIMARY KEY,
  thumbnail TEXT,
  borrower_id INT,
  description TEXT,
  owner_id INT NOT NULL,
  library_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  is_private INT DEFAULT 0,
  returned_at TIMESTAMP,
  return_by_date TIMESTAMP,
  borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(100) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (library_id) REFERENCES library(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Insert a new user
INSERT INTO user (name, email, password, created_at, updated_at)
VALUES ('John Doe', 'john.doe@example.com', 'securepassword', NOW(), NOW());

-- Insert a new library
INSERT INTO library (name, user_id, created_at, updated_at)
VALUES ('Central Library', 1, NOW(), NOW());

-- Insert a new book
INSERT INTO book (title, author, library_id, owner_id, created_at, updated_at)
VALUES ('The Great Gatsby', 'F. Scott Fitzgerald', 1, 1, NOW(), NOW());