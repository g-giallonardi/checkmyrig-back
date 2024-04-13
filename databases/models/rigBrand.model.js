const mongoose = require("mongoose");

const rigBrandSchema = mongoose.Schema({
    name: { type: String, unique: true }
});

const RigBrandModel = mongoose.model("rigBrand", rigBrandSchema);

module.exports = RigBrandModel;