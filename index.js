const express = require('express');
const db = require('./lib/database');

const app = express();

const list = new db.List({title: 'lol'});
list.save((err, list) => {
  console.log(err, list);
})
db.List.findOne({title: 'lol'})
  .then((res) => console.log("from db finding: ",res))
  .catch((err) => console.log(err));


app.get('/', function (req, res) {
  res.send('hello world')
});

require('./lib/routes/lists.js')(app);

app.listen(8080);