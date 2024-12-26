const Book = require('../models/bookModel');
const User = require('../models/userModel');

exports.addBook = async (request, reply) => {
  try {
    const { title, author, owner, library_id=0, created_at, updated_at } = request.body;
    const book = await Book.findCreateFind({ title, author, library_id, owner, created_at, updated_at });
    console.log("Book Created:\n", book);
    reply.code(201).send(book);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.editBook = async (request, reply) => {
  try {
    const userId = request.user.id;
    const user = await User.findByPk(userId);
    if (!user) {
      return reply.code(404).send({ error: 'User not found for this book.' });
    }

    const {id, title, author, owner_id, library_id } = request.body;
    const previous_book_data = await Book.findByPk(id);
    
    if (!previous_book_data) {
      return reply.code(404).send({ error: 'This book does not exist.' });
    }
    
    // console.log("Book Created:\n", previous_book_data);
    const book = await Book.update({
      title: title, author: author, library_id: library_id, owner_id: owner_id },
      {where: { id: previous_book_data.id, owner_id: owner_id }
    });

    console.log("Book Edited:\n", book);
    reply.code(201).send(book);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.getBooks = async (request, reply) => {
  try {
    const book = await Book.findAll();
    reply.code(200).send(book);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.getUserBooks = async (request, reply) => {
  try {
    // Extracted from JWT
    const userId = request.user.id;
    
    // Find user by email
    const user = await User.findByPk(userId);
    
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    const books = await Book.findAll({where: {owner_id: user.id }});
    reply.code(201).send(books);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.getLibraryBooks = async (request, reply) => {
  try {
    // Extracted from JWT
    const userId = request.user.id;
    
    // Find user by email
    const user = await User.findByPk(userId);
    
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }
    
    const books = await Book.findAll({where: {owner:"John Doe"}});
    reply.code(201).send(books);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};
