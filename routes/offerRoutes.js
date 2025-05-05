const express = require('express');
const router = express.Router({ mergeParams: true });
const offerController = require('../controllers/offerController');
const { isLoggedIn } = require('../middlewares/auth');
const { validateOffer, checkValidationErrors } = require('../middlewares/validator');

// Make an offer
router.post('/', isLoggedIn, validateOffer, checkValidationErrors, offerController.makeOffer);

// View all offers
router.get('/', isLoggedIn, offerController.viewOffers);

// Accept an offer
router.put('/:offerId', isLoggedIn, offerController.acceptOffer);

module.exports = router;
