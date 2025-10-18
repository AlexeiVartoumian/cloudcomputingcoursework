const User = require("../models/User")


//https://www.reddit.com/r/rails/comments/itivdn/where_did_concept_of_service_object_come_from/

//https://stackoverflow.com/questions/63218568/what-should-be-structure-of-service-layer-in-node-js


class UserService {

    

    async createUser({ name, email, password  }) {
        const user = new User({
            name,
            email,
            password,
            date: Date.now()          
        });
        
        await user.save();
        return user; 
     } 

}


module.exports = new UserService()


