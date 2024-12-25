const Library = require('../models/libraryModel');

exports.createLibrary = async (request, reply) => {
  try {
    const { name, userId } = request.body;
    const library = await Library.create({ name, userId });
    reply.code(201).send(library);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.getLibraries = async (request, reply) => {
  try {
    const libraries = await Library.findAll();
    console.log(libraries.every(libraries => libraries instanceof Library))
    reply.code(200).send(libraries);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};