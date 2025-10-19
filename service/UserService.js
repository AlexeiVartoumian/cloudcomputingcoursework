const User = require("../models/User")
const bcrypt = require('brcyptjs')

//https://www.reddit.com/r/rails/comments/itivdn/where_did_concept_of_service_object_come_from/

//https://stackoverflow.com/questions/63218568/what-should-be-structure-of-service-layer-in-node-js


class UserService {

    

    async createUser({ name, email, password  }) {

        

        const hashedPassword = await bcrypt.hash(password , 10 );

        const user = new User({
            name,
            email,
            password: hashedPassword,
            date: Date.now()          
        });
        
        await user.save();
        return user; 
     } 

    async loginUser({ email, password }) {
        
        const user = await User.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        
        
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }
        
        return user 
        }
    
    async getUserById(userId) {
        const user = await User.findById(userId);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    }
    }


module.exports = new UserService()


