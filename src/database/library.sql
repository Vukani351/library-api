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
  status VARCHAR(100) NOT NULL
);

-- Create the `library` table
CREATE TABLE IF NOT EXISTS library (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  is_private INT DEFAULT 0,
  user_id INT NOT NULL,
  status VARCHAR(100) NOT NULL,
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
  borrower_id INT,
  library_id INT,
  is_private INT DEFAULT 0,
  borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  return_by_date TIMESTAMP,
  status VARCHAR(100) NOT NULL,
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
  FOREIGN KEY (library_id) REFERENCES library(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS book_request (
  id INT AUTO_INCREMENT PRIMARY KEY,
  book_id INT NOT NULL,
  borrower_id INT NOT NULL,
  owner_id INT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
  requested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  approved_at TIMESTAMP,
  return_by_date TIMESTAMP,
  FOREIGN KEY (book_id) REFERENCES book(id) ON DELETE CASCADE,
  FOREIGN KEY (borrower_id) REFERENCES user(id) ON DELETE CASCADE,
  FOREIGN KEY (owner_id) REFERENCES user(id) ON DELETE CASCADE
);

-- Insert a new user
INSERT INTO user (name, email, password, status)
VALUES ('Nash Bell', 'nash4253@gmail.com', 'password123', "active");

-- Insert a new library
INSERT INTO library (name, description, status, user_id, is_private)
VALUES ('Central Library', "This is the main library", "inactive", 1, 0);

-- Insert a new book
INSERT INTO book (title, author, description, library_id, owner_id)
VALUES ('The Great Gatsby', 'F. Scott Fitzgerald', "This is the first book", 1, 1);