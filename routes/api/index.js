const router = require("express").Router();
const apiUsers = require("./users");
const apiRigs = require("./rigs");
const apiBrands = require("./brands");
const apiParts = require("./parts");

router.use("/users", apiUsers);
router.use("/rigs", apiRigs);
router.use("/parts", apiParts);
router.use("/brands", apiBrands);

module.exports = router;