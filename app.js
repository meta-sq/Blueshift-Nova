
const express = require('express');
const path = require('path');
const itemRoutes = require('./routes/itemRoutes');
const userRoutes = require('./routes/userRoutes');

const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const methodOverride = require('method-override');

const app = express();

// Connect to MongoDB Atlas
mongoose.connect('mongodb+srv://imeta:admin123@cluster0.v15uo.mongodb.net/project5?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log('Connected to project5 database'))
.catch(err => console.error(err));

// View engine
app.set('view engine', 'ejs');

// Middleware
app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session setup
app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: 'mongodb+srv://imeta:admin123@cluster0.v15uo.mongodb.net/project5?retryWrites=true&w=majority&appName=Cluster0'
 })
}));

// Flash messages
app.use(flash());
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  res.locals.currentUser = req.session.user || null;
  next();
});

// Routes
app.use('/items', itemRoutes);
app.use('/users', userRoutes);

app.get('/', (req, res) => {
  res.render('index');
});


// 404 handler
app.use((req, res) => {
  res.status(404).render('error', { message: 'Page not found' });
});

// Server
const port = 3000;
const host = 'localhost';
app.listen(port, host, () => {
  console.log('Server is running on port', port);
});
