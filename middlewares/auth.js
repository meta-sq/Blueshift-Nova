exports.isGuest = (req, res, next) => {
    if (!req.session.user) {
      return next();
    }
    req.flash('error', 'You are already logged in.');
    res.redirect('/users/profile');
  };
  
  exports.isLoggedIn = (req, res, next) => {
    if (req.session.user) {
      return next();
    }
    req.flash('error', 'You must be logged in to view this page.');
    res.redirect('/users/login');
  };
  
  exports.isOwner = async (req, res, next) => {
    const Item = require('../models/item');
    const item = await Item.findById(req.params.id);
  
    if (!item) {
      req.flash('error', 'Item not found.');
      return res.redirect('/items');
    }
  
    if (item.seller && item.seller.equals(req.session.user._id)) {
      return next();
    }
  
    res.status(401).render('error', {
      error: { status: 401, message: 'Unauthorized: You do not have permission to modify this item.' }
    });
  };
  