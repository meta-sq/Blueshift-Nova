const { body, validationResult } = require('express-validator');

const validateOffer = [
    body('amount')
        .notEmpty().withMessage('Offer amount cannot be empty.')
        .isCurrency({ allow_negatives: false, allow_zero: false }).withMessage('Offer must be greater than a penny.')
        .trim()
        .escape()
];

const validateUser = [
    body('firstName')
        .notEmpty().withMessage('First name is required.')
        .trim()
        .escape(),

    body('lastName')
        .notEmpty().withMessage('Last name is required.')
        .trim()
        .escape(),

    body('email')
        .isEmail().withMessage('Invalid email address.')
        .normalizeEmail(),

    body('password')
        .isLength({ min: 8, max: 64 }).withMessage('Password must be between 8 and 64 characters.')
];

const validateItem = [
    body('title')
        .notEmpty().withMessage('Title is required.')
        .trim()
        .escape(),

    body('description')
        .optional()
        .trim()
        .escape(),

    body('condition')
        .isIn(['new', 'like new', 'used', 'heavily used'])
        .withMessage('Invalid condition value.'),

    body('price')
        .notEmpty().withMessage('Price is required.')
        .isCurrency({ allow_negatives: false, allow_zero: false })
        .withMessage('Price must be a valid amount greater than zero.')
];

const checkValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = {
    validateOffer,
    validateUser,
    validateItem,
    checkValidationErrors
};
