const express = require('express');
const app = express()



const bodyParser = require('body-parser')
const postRoute = require('./routes/posts')
const userRoute = require('./routes/users')

const { default: mongoose } = require('mongoose');

require('dotenv').config()



app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use("/posts" , postRoute)
app.use("/user" , userRoute)


app.get('/', (req,res) => {
    res.send("hello world");
});



const MONGODBURL = process.env.MONGO_URI+'/DBFilms'

mongoose.connect(MONGODBURL)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.log('Connection error:', err));



app.listen(3001)