const Book = require('../models/bookModel');

exports.addBook = async (request, reply) => {
  try {
    const { title, author, libraryId } = request.body;
    const book = await Book.create({ title, author, libraryId });
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
