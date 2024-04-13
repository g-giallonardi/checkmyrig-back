const mongoose = require("mongoose");
const RigModelModel = require("./rigModel.model");
const UserModel = require("./user.model")

const rigSchema = mongoose.Schema({
    name: { type: String },
    model:{type: mongoose.Types.ObjectId, ref: "RigModelModel"},
    owner:{type: mongoose.Types.ObjectId, ref: "UserModel"},
    image:{ type: String },
    like :{ type: Number},
    created_at : { type: Date, required: true}
});

const RigModel = mongoose.model("rigs", rigSchema);

module.exports = RigModel;