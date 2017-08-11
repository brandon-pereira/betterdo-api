require('dotenv').config();

const app = require('./lib/app');

app.get('/', (req, res) => {
  if(req.user) {
    res.send("Hello "  + req.user.firstName);
  } else {
   res.send("<a href='/auth/google'>Login</a>");
  }
});

// require('./lib/routes/lists.js')(app);
