-- Create the database
CREATE DATABASE IF NOT EXISTS library_db;

-- Use the database
USE library_db;

-- Create the `user` table
CREATE TABLE IF NOT EXISTS user (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  thumbnail TEXT,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create the `library` table
CREATE TABLE IF NOT EXISTS library (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Create the `book` table
CREATE TABLE IF NOT EXISTS book (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail TEXT,
  library_id INT NOT NULL,
  owner_id INT NOT NULL,
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