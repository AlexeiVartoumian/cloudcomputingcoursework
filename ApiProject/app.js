const express = require('express');
const app = express()



const bodyParser = require('body-parser')
const authRoutes = require('./routes/auth');
const postRoute = require('./routes/posts')
const userRoute = require('./routes/users')

const { default: mongoose } = require('mongoose');

require('dotenv').config()



app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use("/posts" , postRoute)
app.use("/user" , userRoute)
app.use('/auth', authRoutes); 



app.get('/', (req, res) => {
    res.json({ 
        success: true, 
        message: "Mingle API is running",
        endpoints: {
            auth: "/auth",
            posts: "/posts",
            user: "/user"
        }
    });
});


const MONGODBURL = process.env.MONGO_URI+"/DBMingle"

mongoose.connect(MONGODBURL)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.log('Connection error:', err));



app.listen(3001)