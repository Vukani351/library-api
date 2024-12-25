const User = require('../models/userModel');

exports.createUser = async (request, reply) => {
  try {
    const { name, email, password } = request.body;
    const user = await User.create({ name, email, password });
    reply.code(201).send(user);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};

exports.getUsers = async (request, reply) => {
  try {
    // const { name, email, password } = request.body;
    const users = await User.findAll();
    reply.code(201).send(users);
  } catch (error) {
    reply.code(500).send({ error: error.message });
  }
};
