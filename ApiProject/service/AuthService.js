const jwt = require('jsonwebtoken');
require('dotenv').config();

class AuthService {
    

    async generateToken(user){

        try{
            jwt.sign(
                    { 
                        id: user._id, 
                        email: user.email,
                        name: user.name
                    },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES_IN || '1' })

            } catch (error){
                throw error;
            }
        return token  
    }

    

}

module.exports = new AuthService()