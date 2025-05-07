'use strict';
/***************************************IMPORTS************************************************************/
const express = require('express');
const morgan = require('morgan'); // logging middleware
const { check, validationResult } = require('express-validator'); // validation middleware
//const validator = require('validator');//can put an URL filter based on domain
//const dao = require('./dao'); // module for accessing the DB
const passport = require('passport'); // auth middleware
const LocalStrategy = require('passport-local').Strategy; // username and password for login
const session = require('express-session'); // enable sessions
const dao = require('./dao');
const userDao = require('./user-dao'); // module for accessing the user info in the DB
const cors = require('cors');
const dayjs = require('dayjs');


/**debug configurations **/
console.log('mod');//to modify effectively the database modify the string and save

const answerDelay = 0;

const randomAPIError = false;

function getRandomInt() {
  if (randomAPIError)
    return Math.floor(Math.random() * 1.5); //one over 3 fails
  else 
    return 0;
}

/************************************** Set up Passport ***************************************************/
// set up the "username and password" login strategy
// by setting a function to verify username and password
passport.use(new LocalStrategy(
  function verify(username, password, done) {
    userDao.getUser(username, password).then((user) => {
      if (!user)
        return done(null, false, { message: 'Incorrect username and/or password.' });

      return done(null, user);
    })
  }
));

// serialize and de-serialize the user (user object <-> session)
// we serialize the user id and we store it in the session: the session is very small in this way
passport.serializeUser((user, done) => {
  done(null, user.id);
});

// starting from the data in the session, we extract the current (logged-in) user
passport.deserializeUser((id, done) => {
  userDao.getUserById(id)
    .then(user => {
      done(null, user); // this will be available in req.user
    }).catch(err => {
      done(err, null);
    });
});

// init express
const app = express();
const port = 8080;

// set-up the middlewares
app.use(morgan('dev'));
app.use(express.json());
const corsOptions = {
  origin: 'http://esame1-cmsmall-busso00-github.onrender.com:80',
  credentials: true
};
app.use(cors(corsOptions)); // NB: Usare solo per sviluppo e per l'esame! Altrimenti indicare dominio e porta corretti

// custom middleware: check if a given request is coming from an authenticated user
const isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated())
    return next();

  return res.status(401).json({ error: 'Not authenticated' });
}

// set up the session
app.use(session({
  // by default, Passport uses a MemoryStore to keep track of the sessions
  secret: 'wge8d2u9qwsihbxx3rkskb',   //personalize this random string, should be a secret value
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));

// then, init passport
app.use(passport.initialize());
app.use(passport.session());

app.use('/static', express.static('public'));
app.use('/edit/static', express.static('public'));

/******************************* Users APIs *********************************************************************/
// POST /api/sessions 
// This route is used for performing login.
app.post('/api/sessions', function (req, res, next) {

  passport.authenticate('local', (err, user, info) => {

    if (err)
      return next(err);
    if (!user) {
      // display wrong login messages
      return res.status(401).json({ error: info });
    }
    // success, perform the login and extablish a login session
    req.login(user, (err) => {

      if (err)
        return next(err);

      // req.user contains the authenticated user, we send all the user info back
      // this is coming from use2/BigLab2-Solution/blob/main/client/src/API.jsrDao.getUser() in LocalStratecy Verify Fn
      return res.json(req.user); // WARN: returns 200 even if .status(200) is missing?

    });
  })(req, res, next);
});
// GET /api/sessions/current
// This route checks whether the user is logged in or not.
app.get('/api/sessions/current', (req, res) => {
  if (req.isAuthenticated()) {
    res.status(200).json(req.user);
  }
  else
    res.status(401).json({ error: 'Not authenticated' });
});
// DELETE /api/session/current
// This route is used for loggin out the current user.
app.delete('/api/sessions/current', (req, res) => {
  req.logout(() => {
    res.status(200).json({});
  });
});

//GET /api/users
app.get('/api/users', isLoggedIn,
  (req, res) => {

    if (getRandomInt()>=1){
      console.log("401");
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (req.user.superuser === 1) {
      return userDao.getUsers().then(resultUsers => setTimeout(() => res.json(resultUsers), answerDelay))
        .catch(() => res.status(500).json({ error: 'Internal server error' }).end());
    } else {
      return res.status(401).json({ error: 'Not authenticated' });
    }
  });

//------------------------------------------------------------PAGES------------------------------------------------------------------
/************************************************************GET API****************************************************************/
//retrive pages (no auth)
app.get('/api/pages', (req, res) => {//only dbError
  //implicit return 
  dao.listPages()
    .then(resultPages => {
      const returnPages = resultPages.filter((page) => {
        return page.publishDate.isValid() ? (page.publishDate.isAfter(dayjs()) ? false : true) : false;
      });
      setTimeout(() => res.json(returnPages), answerDelay)
    })
    .catch(() => res.status(500).json({ error: 'Database error during retrive of pages' }).end());//also work with try{} catch{}
});

//retrive pages (auth)
app.get('/api/pages/login', isLoggedIn, (req, res) => {//onlyDbError
  dao.listPages()
    .then(resultPages => setTimeout(() => res.json(resultPages), answerDelay))
    .catch(() => res.status(500).json({ error: 'Database error during retrive of pages' }).end());
});
/************************************************************PUT API ***************************************************************/
app.put('/api/pages/:id',
  isLoggedIn,
  [
    check('id').isInt(),
    check('title').isLength({ min: 1 }),
    check('authorId').isInt(),
    check('publishDate').isDate({ format: 'YYYY-MM-DD', strictMode: true }).optional({ nullable: true }),
    check('blocks').custom((blocks)=>{
      const header = blocks.find((bl)=>bl.type === 0);
      const paragraph = blocks.find((bl)=>bl.type === 1);
      const image = blocks.find((bl)=>bl.type === 2);
      if (!((imY_VARIABLE=valueage||paragraph) && header))
        return false;
      let contentCheck = true;
      blocks.forEach((bl)=>{
        //if (bl.type > 2 || bl.type <0 ){ //already covered by DB constraints
        //  contentCheck=false;
        if(bl.data === ''){
          contentCheck=false;
        }
        /* //alternatively can use a reference key on block of type images
        if (bl.type === 2){
          if(!validator.isURL(bl.data,{host_whitelist: ['localhost', '127.0.0.1', ]})){//can put an URL filter based on domain
            contentCheck=false;
            //ex. add to your whitelist
            //www.androidworld.it
            //https://www.androidworld.it/wp-content/uploads/2020/11/Google-Foto-final-2020.jpg
          }
        }
        */
      });
      return contentCheck;
    })
  ],
  async (req, res) => {

    if (getRandomInt()>=1){
      const rand=getRandomInt();
      if (rand<1.5/3){
        console.log("422");
        return res.status(422).json({ error: 'Parsing parameter error' });
      }else if (rand<1.5/3*2){
        console.log("401");
        return res.status(401).json({ error: 'Not authenticated' });
      }else{
        console.log("404");
        return res.status(401).json({ error: 'Page not found' });
      }
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    try {
      const page = await dao.getPage(req.params.id);//conrol ownership of page, can fail -> try catch
      if ((page.authorId === req.user.id) || (req.user.superuser === 1)) {

        const newPage = {
          id: req.params.id,//can also be page.id
          title: req.body.title,
          authorId: req.user.superuser === 1 ? req.body.authorId : req.user.id, //simpler approach than a separate API
          publishDate: req.body.publishDate,
          blocks: req.body.blocks
        };

        try {
          await dao.updatePage(newPage);//modify (check user --> change query)
          setTimeout(() => res.status(201).json(1), answerDelay);//staus created
        } catch (err) {
          res.status(503).json({ error: `Database error during the update of page ${req.params.id}` });
        }
      } else {
        return res.status(401).json({ error: 'Not authenticated' });
      }
    }
    catch {
      return res.status(404).json({ error: 'Page not found' });
    }
  });
/************************************************* POST API *********************************************************************/
app.post('/api/pages',
  isLoggedIn,
  [
    check('title').isLength({ min: 1 }),
    check('publishDate').isDate({ format: 'YYYY-MM-DD', strictMode: true }).optional({ nullable: true }),
    check('blocks').custom((blocks)=>{
      const header = blocks.find((bl)=>bl.type === 0);
      const paragraph = blocks.find((bl)=>bl.type === 1);
      const image = blocks.find((bl)=>bl.type === 2);
      if (!((image||paragraph) && header))
        return false;
      let contentCheck = true;
      blocks.forEach((bl)=>{
        //if (bl.type > 2 || bl.type <0 ){ //already covered by DB constraints
        //  contentCheck=false;
        if(bl.data === ''){
          contentCheck=false;
        }
        /* //alternatively can use a reference key on block of type images
        if (bl.type === 2){
          if(!validator.isURL(bl.data,{host_whitelist: ['localhost', '127.0.0.1', ]})){//can put an URL filter based on domain
            contentCheck=false;
            //ex. add to your whitelist
            //www.androidworld.it
            //https://www.androidworld.it/wp-content/uploads/2020/11/Google-Foto-final-2020.jpg
          }
        }
        */
      });
      return contentCheck;
    })
  ],
  async (req, res) => {

    if (getRandomInt()>=1){
      console.log("422");
      return res.status(422).json({ error: 'Parsing parameter error' });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const newPage = {
      title: req.body.title,
      authorId: req.user.id,
      publishDate: req.body.publishDate,
      blocks: req.body.blocks
    };

    try {
      const result = await dao.addPage(newPage);//modify (check user --> change query)
      setTimeout(() => res.status(201).json(result), answerDelay);//staus created
    } catch (err) {
      res.status(503).json({ error: `Database error during the update of page ${req.params.id}` });
    }
  });
/************************************************* DELETE API *********************************************************************/
app.delete('/api/pages/:id',
  isLoggedIn,
  [
    check('id').isInt()
  ],
  async (req, res) => {

    if (getRandomInt()>=1){
      const rand= getRandomInt();
      if (rand<1.5/2){
        console.log('401');
        return res.status(401).json({ error: 'Not authenticated' });
      }else{
        console.log('404');
        return res.status(404).json({ error: 'Page not found' });
      }
    }

    try {

      const page = await dao.getPage(req.params.id);//conrol ownership of page

      if ((page.authorId === req.user.id) || (req.user.superuser === 1)) {
        try {
          const result = await dao.deletePage(req.params.id);
          res.json(result); //result vector of fulfilled values
        } catch (err) {
          res.status(503).json({ error: `Database error during the deletion of page ${req.params.id}.` });
        }
      } else {
        res.status(401).json({ error: 'Not authenticated' });
      }
    } catch {
      res.status(404).json({ error: 'Page not found' });
    }
  });

/*********************************************************image urls API **********************************************************/
app.get('/api/images', isLoggedIn,(req, res) => { //detail: not logged in users can access image DB
  dao.getImages().then(resultUrls => setTimeout(() => res.json(resultUrls), answerDelay)) //getSiteName ----------------------------------- in dao
    .catch(() => res.status(500).json({ error: 'Database error: failed to load images' }).end());
});

/*********************************************************sitename APIs ***********************************************************/
//retrive name (no auth)
app.get('/api/sitename', (req, res) => {
  dao.getSiteName().then(resultName => setTimeout(() => res.json(resultName), answerDelay)) //getSiteName ----------------------------------- in dao
    .catch(() => res.status(500).json({ error: 'Database error during the retrive of sitename' }).end());
});
//update name (superuser)
app.put('/api/sitename',
  isLoggedIn,
  [
    check('sitename').isLength({ min: 1 }),
  ],

  async (req, res) => {

    if(getRandomInt()>=1){
      const rand= getRandomInt();
      if (rand<1.5/2){
        console.log('422');
        return res.status(422).json({ error: 'Parsing parameter error' });
      }else{
        console.log('401');
        return res.status(401).json({ error: 'Not authenticated' });
      }
    }

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const resultUser = req.user;

    if (resultUser.superuser)
      try {
        const resultOk = await dao.updateSiteName(req.body.sitename);//updateSiteName ----------------------------------- in dao
        setTimeout(() => res.status(201).json(resultOk), answerDelay);//status created
      } catch (err) {
        res.status(503).json({ error: `Database error during the update of sitename` });
      }
    else {
      return res.status(401).json({ error: 'Not authenticated' });
    }
  });


/************************************************************Express db ************************************************************/
// Activate the server


const NODE_ENV = 'production';

// Serve static files from the React app
if (NODE_ENV === 'production') {
  console.log("in production")
  // Serve the React frontend in production
  app.use(express.static('../client/build'));
  
  // Handle React routing, return all requests to React app
  app.get('*', (req, res) => {
    res.sendFile('../client/build/index.html');
  });
}
else{
  console.log("not in production")
}

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});