const Book = require('../models/bookModel');

exports.addBook = async (request, reply) => {
  try {
    const { title, email, author, owner, library_id=0, created_at, updated_at } = request.body;
    const book = await Book.create({ title, author, library_id, email, owner, created_at, updated_at });
    console.log("Book Created:\n", book);
    reply.code(201).send(book);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.getBooks = async (request, reply) => {
  try {
    const book = await Book.findAll();
    console.log(book.every(book => book instanceof Book))
    reply.code(200).send(book);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};
