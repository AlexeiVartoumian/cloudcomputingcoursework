const jwt = require('jsonwebtoken');
require('dotenv').config();

class AuthService {
    
    
    generateToken(user){

        try{
            const token = jwt.sign(
                    { 
                        id: user._id, 
                        email: user.email,
                        name: user.name
                    },
                    
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_EXPIRES_IN || '1h' })
                    return token  


            } catch (error){
                throw error;
            }
        
    }

    

}

module.exports = new AuthService()