const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isGuest, isLoggedIn } = require('../middlewares/auth');
const { validateUser, checkValidationErrors } = require('../middlewares/validator');

// Show registration form
router.get('/new', isGuest, userController.new);

// Handle user registration
router.post('/', isGuest, validateUser, checkValidationErrors, userController.create);

// Show login form
router.get('/login', isGuest, userController.getUserLogin);

// Handle login
router.post('/login', isGuest, userController.login);

// Show profile
router.get('/profile', isLoggedIn, userController.profile);

// Handle logout
router.get('/logout', isLoggedIn, userController.logout);

module.exports = router;
