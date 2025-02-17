const { OAuth2Client } = require('google-auth-library');
const User = require('../models/userModel'); // Assuming a Sequelize model for users

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.googleLogin = async (req, reply) => {
  const { token } = req.body;

  try {
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub, email, name, picture } = payload;

    // Check if the user exists in the database
    let user = await User.findOne({ where: { googleId: sub } });

    if (!user) {
      // Create a new user if it doesn't exist
      user = await User.create({
        googleId: sub,
        email,
        name,
        picture,
      });
    }

    // Send response
    reply.code(200).send({
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.name,
        email: user.email,
        picture: user.picture,
        token: reply.jwtSign({ userId: user.id }, { expiresIn: '1h' }),
      },
    });
  } catch (error) {
    console.error('Error during Google login:', error);
    reply.code(500).send({ error: 'Internal Server Error' });
  }
};
