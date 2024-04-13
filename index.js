require('dotenv').config();
const express = require("express");
const cookie = require("cookie-parser");

const app = express();
const routes = require("./routes");

app.use(cookie());
app.use(express.json());

require("./databases");

app.use(routes);
app.use('/images', express.static(__dirname + '/images'));
app.use("*", (req, res) => {
  res.status(404).json("mauvaise routes");
});

app.listen(3001);