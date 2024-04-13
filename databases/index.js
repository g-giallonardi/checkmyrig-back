const mongoose = require("mongoose");
console.log(process.env.ATLAS_MONGO_CONNECTION_STRING)
mongoose
  .connect(
    `mongodb+srv://${process.env.ATLAS_MONGO_CONNECTION_STRING}`
  )
  .then(() => {
    console.log("CONNEXION DB OK !");
  })
  .catch((e) => {
    console.log("CONNEXION KO !", e);
  });