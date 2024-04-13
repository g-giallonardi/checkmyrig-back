const mongoose = require("mongoose");
const RigBrandModel = require("./rigBrand.model");

const partSchema = mongoose.Schema({
    brand:{type: mongoose.Types.ObjectId, ref: "RigBrandModel"},
    name: { type: String, unique: true },
    type: { type: String }
});

const PartModel = mongoose.model("parts", partSchema);

module.exports = PartModel;