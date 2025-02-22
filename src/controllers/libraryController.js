const Library = require('../models/libraryModel');
const User = require('../models/userModel');

exports.createLibrary = async (request, reply) => {
  try {
    // Extracted from JWT
    const { id, email} = request.user;
    // Find user by email
    const user = await User.findOne({ where: { id: id, email: email } });
    
    if (!user) {
      return reply.code(404).send({ error: 'User not found' });
    }

    // generate the library hash:





    
    const { name, description  } = request.body;
    const library = await Library.create({ name: name, description:description, user_id: id });
    reply.code(200).send({library: library});
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.getUserAccessLibraries = async (request, reply) => {
  // change this to be getting all libraries user is allowed to see.
  try {
    const libraries = await Library.findAll();
    reply.code(200).send(libraries);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.getUserLibrary = async (request, reply) => {
  try {
    // need to check if the params are there and if user is correct one 
    const { id } = request.params;
    const libraries = await Library.findOne({ where: { user_id: id } });
    reply.code(200).send(libraries);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.editLibrary = async (request, reply) => {
  try {
    const userId = request.user.id;
    const { id, name, description, user_id } = request.body;
    const user = await User.findByPk(userId);
    const body_defined_user = await User.findByPk(user_id);
    if (!(user && body_defined_user)) {
      return reply.code(404).send({ error: 'User not found for this library.' });
    }

    const previous_library_data = await Library.findByPk(id);
    
    if (!previous_library_data) {
      return reply.code(404).send({ error: 'This library does not exist.' });
    }
    
    await Library.update(
      {
        name: name, description: description, user_id: user_id
      },
      {
        where: { 
          id: previous_library_data.id, user_id: user_id
      }
    });

    reply.code(201).send(await Library.findByPk(id));
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.requestLibraryAccess = async (request, reply) => {
    try {
        // Extracted from JWT
      const { id, email} = request.user;
      // Find user by email
      const user = await User.findOne({ where: { id: id, email: email } });
      
      if (!user) {
        return reply.code(404).send({ error: 'User not found.' });
      }

      const { hash  } = request.body;
      const libraries = await Library.findOne({where: { hash: hash }});
      reply.code(200).send(libraries);
    } catch (error) {
      reply.code(500).send({ error: error.message });
    }
}
