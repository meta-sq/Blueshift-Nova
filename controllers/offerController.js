const Offer = require('../models/offer');
const Item = require('../models/item');

// Make an offer
exports.makeOffer = (req, res, next) => {
    const itemId = req.params.id;

    Item.findById(itemId).populate('seller').then(item => {
        if (!item) {
            const err = new Error('Cannot find item with the given id');
            err.status = 404;
            return next(err);
        }

        if (!req.session.user) return res.redirect('/users/login');

        if (item.seller.equals(req.session.user._id)) {
            const err = new Error('Unauthorized: Sellers cannot make offers on their own items');
            err.status = 401;
            return next(err);
        }

        const offer = new Offer({
            amount: req.body.amount,
            buyer: req.session.user._id,
            item: itemId
        });

        offer.save().then(savedOffer => {
            return Item.findByIdAndUpdate(itemId, {
                $inc: { totalOffers: 1 },
                $max: { highestOffer: savedOffer.amount }
            });
        }).then(() => {
            res.redirect('/items/' + itemId);
        }).catch(err => next(err));
    }).catch(err => next(err));
};

exports.viewOffers = (req, res, next) => {
    const itemId = req.params.id;

    Item.findById(itemId).populate('seller').then(item => {
        if (!item) {
            const err = new Error('Item not found');
            err.status = 404;
            return next(err);
        }

        if (!req.session.user) return res.redirect('/users/login');

        if (!item.seller.equals(req.session.user._id)) {
            const err = new Error('Unauthorized');
            err.status = 401;
            return next(err);
        }

        Offer.find({ item: itemId }).populate('buyer').then(offers => {
            res.render('offer/offers', { item, offers });
        }).catch(err => next(err));
    }).catch(err => next(err));
};

// Accept an offer
exports.acceptOffer = (req, res, next) => {
    const itemId = req.params.id;
    const offerId = req.params.offerId;

    Item.findById(itemId).populate('seller').then(item => {
        if (!item) {
            const err = new Error('Item not found');
            err.status = 404;
            return next(err);
        }

        if (!req.session.user) return res.redirect('/users/login');

        if (!item.seller.equals(req.session.user._id)) {
            const err = new Error('Unauthorized');
            err.status = 401;
            return next(err);
        }

        item.active = false;
        item.save().then(() => {
            return Offer.findByIdAndUpdate(offerId, { status: 'accepted' });
        }).then(() => {
            return Offer.updateMany(
                { item: itemId, _id: { $ne: offerId }, status: 'pending' },
                { status: 'rejected' }
            );
        }).then(() => {
            res.redirect(`/items/${itemId}/offers`);
        }).catch(err => {
            console.error('Error updating offers:', err);
            next(err);
        });
    }).catch(err => next(err));
};
