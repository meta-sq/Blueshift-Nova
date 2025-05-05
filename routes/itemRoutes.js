const express = require('express');
const controller = require('../controllers/itemController');
const multer = require('multer');
const path = require('path');
const { isLoggedIn, isOwner } = require('../middlewares/auth');
const { validateItem, checkValidationErrors } = require('../middlewares/validator');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images');
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
      cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    const mimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (mimeTypes.includes(file.mimetype)) {
        return cb(null, true);
    } else {
        return cb(new Error('Invalid file type. Use only jpg, jpeg, png, or gif'), false);
    }
};

const upload = multer({ storage, fileFilter }).single('image');

const router = express.Router();
const offerRoutes = require('./offerRoutes');

router.get('/', controller.index);

router.get('/new', isLoggedIn, controller.new);

router.post('/', isLoggedIn, upload, validateItem, checkValidationErrors, controller.create);

router.get('/:id', controller.show);

router.get('/:id/edit', isLoggedIn, isOwner, controller.edit);

router.put('/:id', upload, isLoggedIn, isOwner, validateItem, checkValidationErrors, controller.update);

router.delete('/:id', isLoggedIn, isOwner, controller.delete);

router.use('/:id/offers', offerRoutes);

module.exports = router;
