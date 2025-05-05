const Item = require('../models/item');
const Offer = require('../models/offer');
const fs = require('fs');
const path = require('path');


exports.index = (req, res, next) => {
    let searchQuery = req.query.search || '';

    let searchCondition = {}; 

   //This method was inspired by the following stackoverflow post
   //https://stackoverflow.com/questions/39614608/search-query-in-mongodb-using-regular-expression
   //Users "John" and "chridam" 
   //No content was copied, but it helped me understand the structure!
    if (searchQuery) {
        searchCondition = {
            $or: [
                { title: { $regex: searchQuery, $options: 'i' } }, 
                { description: { $regex: searchQuery, $options: 'i' } }
            ]
        };
    }

    Item.find(searchCondition)
        .sort({ price: 1 })
        .then(items => {
            if (items.length > 0) {
                res.render('./browse', { items, searchQuery });
            } else {
                res.render('./browse', { items: [], searchQuery, message: 'No items found.' });
            }
        })
        .catch(err => next(err));
};

exports.new = (req, res) => {
    res.render('./item/new');
};

exports.create = (req, res, next) => {
  const item = new Item(req.body);
  item.seller = req.session.user._id;

  if (req.file) {
    const imagePath = path.join(__dirname, '..', 'public', 'images', req.file.filename);
    const imageData = fs.readFileSync(imagePath);
    const encodedImage = imageData.toString('base64');
    item.image = encodedImage;

    fs.unlinkSync(imagePath);
  }

  item.save()
    .then(() => {
      req.flash('success', 'Item created successfully.');
      res.redirect('/items');
    })
    .catch(err => {
      req.flash('error', err.message);
      res.redirect('back');
    });
};

exports.show = (req, res, next) => {
  const itemId = req.params.id;

  Item.findById(itemId)
      .populate('seller')
      .then(item => {
          if (!item) {
              return res.status(404).render('error', { message: 'Item not found' });
          }

          Offer.find({ item: itemId }).populate('buyer')
              .then(offers => {
                  res.render('item/item', { item, offers });
              })
              .catch(err => next(err));
      })
      .catch(err => {
          res.status(500).render('error', { message: 'Server error' });
      });
};





exports.edit = (req, res, next) => {
    Item.findById(req.params.id)
    .then(item => {
      if (item) {
        res.render('item/edit', { item });
      } else {
        res.status(404).render('error', { message: 'Item not found' });
      }
    })
    .catch(err => {
      res.status(500).render('error', { message: 'Server error' });
    });
};

exports.update = (req, res, next) => {
  const updateData = req.body;

  // Handle uploaded image if provided
  if (req.file) {
    const imagePath = path.join(__dirname, '..', 'public', 'images', req.file.filename);
    const imageData = fs.readFileSync(imagePath);
    const encodedImage = imageData.toString('base64');

    updateData.image = encodedImage;

    // Clean up the temp file
    fs.unlinkSync(imagePath);
  }

  Item.findByIdAndUpdate(req.params.id, updateData, { runValidators: true })
    .then(item => {
      if (item) {
        req.flash('success', 'Item updated successfully.');
        res.redirect('/items/' + req.params.id);
      } else {
        res.status(404).render('error', { message: 'Item not found.' });
      }
    })
    .catch(err => {
      req.flash('error', err.message);
      res.redirect('back');
    });

};

exports.delete = (req, res, next) => {
    Item.findByIdAndDelete(req.params.id)
    .then(() => {
      req.flash('success', 'Item deleted.');
      res.redirect('/items');
    })
    .catch(err => {
      req.flash('error', 'Could not delete item.');
      res.redirect('back');
    });
};
