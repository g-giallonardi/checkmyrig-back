const mongoose = require("mongoose");

ATLAS_DB_USER=process.env.ATLAS_DB_USER
ATLAS_DB_PASSWORD = process.env.ATLAS_DB_PASSWORD
ATLAS_HOSTNAME=process.env.ATLAS_HOSTNAME
ATLAS_DB_NAME = process.env.ATLAS_DB_NAME
ATLAS_APP_NAME = process.env.ATLAS_APP_NAME

mongoose
  .connect(
    `mongodb+srv://${ATLAS_DB_USER}:${ATLAS_DB_PASSWORD}@${ATLAS_HOSTNAME}/${ATLAS_DB_NAME}
    ?retryWrites=true&w=majority&appName=${ATLAS_APP_NAME}
`
  )
  .then(() => {
    console.log("CONNEXION DB OK !");
  })
  .catch((e) => {
    console.log("CONNEXION KO !", e);
  });