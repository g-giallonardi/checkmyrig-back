const mongoose = require("mongoose");
const RigBrandModel = require("./rigBrand.model");

const rigModelSchema = mongoose.Schema({
    brand:{type: mongoose.Types.ObjectId, ref: "RigBrandModel"},
    name: { type: String, unique: true },
    scale:String,
    type:String,
    energy:String
});

const RigModelModel = mongoose.model("rigModels", rigModelSchema);

module.exports = RigModelModel;