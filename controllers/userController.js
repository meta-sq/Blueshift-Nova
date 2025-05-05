const model = require('../models/user');
const Item = require('../models/item');
const bcrypt = require('bcryptjs');
const Offer = require('../models/offer');


exports.new = (req, res) => {
    return res.render('./user/new');
};

exports.create = (req, res, next) => {
    const { firstName, lastName, email, password } = req.body;

    bcrypt.hash(password, 10)
    .then(hash => {
        let user = new model({ firstName, lastName, email, password: hash });
        return user.save();
    })
    .then(user => {
        req.flash('success', 'Registration successful. Please log in.');
        res.redirect('/users/login');
    })
    .catch(err => {
        if (err.name === 'ValidationError') {
            req.flash('error', err.message);
            return res.redirect('/users/new');
        }

        if (err.code === 11000) {
            req.flash('error', 'Email has been used');
            return res.redirect('/users/new');
        }

        next(err);
    });
};

exports.getUserLogin = (req, res, next) => {
    return res.render('./user/login');
};


exports.login = (req, res, next) => {
    const { email, password } = req.body;

    model.findOne({ email: email })
    .then(user => {
        if (!user) {
            req.flash('error', 'Wrong email address');
            return res.redirect('/users/login');
        }

        bcrypt.compare(password, user.password)
        .then(result => {
            if (result) {
                req.session.user = {
                    _id: user._id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email
                };
                req.flash('success', 'You have successfully logged in');
                res.redirect('/users/profile');
            } else {
                req.flash('error', 'Wrong password');
                res.redirect('/users/login');
            }
        });
    })
    .catch(err => next(err));
};


exports.profile = (req, res, next) => {
    const id = req.session.user._id;

    model.findById(id)
    .then(user => {
        if (!user) {
            const err = new Error('User not found');
            err.status = 404;
            return next(err);
        }

        Item.find({ seller: id })
        .then(items => {
            Offer.find({ buyer: id }).populate('item')
            .then(offers => {
                res.render('./user/profile', { user, items, offers });
            })
            .catch(err => next(err));
        })
        .catch(err => next(err));
    })
    .catch(err => next(err));
};



exports.logout = (req, res, next) => {
    req.flash('success', 'Logged out successfully.');
    req.session.destroy(err => {
        if (err) return next(err);
        res.clearCookie('connect.sid');
        res.redirect('/');
});

};
