const express = require('express');
const app = express()


const { default: mongoose } = require('mongoose');

require('dotenv').config()



app.get('/', (req,res) => {
    res.send("hello world");
});





mongoose.connect(MONGODBURL)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.log('Connection error:', err));



app.listen(3001)