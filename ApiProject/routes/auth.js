const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const UserService = require('../service/UserService');
require('dotenv').config();


const generateToken = (user) => {
    return jwt.sign(
        { 
            id: user._id, 
            email: user.email,
            name: user.name
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
};


router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        
        if (!name || !email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Name, email, and password are required' 
            });
        }
        
        if (password.length < 8) {
            return res.status(400).json({ 
                success: false, 
                error: 'Password must be at least 8 characters' 
            });
        }
        
      
        const user = await UserService.createUser({ name, email, password });
        
        
        const token = generateToken(user);
        
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        res.status(400).json({ 
            success: false, 
            error: error.message 
        });
    }
});


router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
       
        if (!email || !password) {
            return res.status(400).json({ 
                success: false, 
                error: 'Email and password are required' 
            });
        }
        
        
        const user = await UserService.loginUser({ email, password });
        
       
        const token = generateToken(user);
        
        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
        
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            error: error.message 
        });
    }
});

module.exports = router;