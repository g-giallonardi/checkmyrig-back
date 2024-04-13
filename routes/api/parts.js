const RigBrandModel = require("../../databases/models/rigBrand.model");
const PartModel = require("../../databases/models/part.model");
const {raw} = require("express");
const router = require("express").Router();

router.get("/", async (req, res) => {
  try {
    const parts = await PartModel.find().populate({ path: 'brand', model: RigBrandModel }).exec()
    res.json(parts);
  } catch (err) {
    console.log(err);
    res.status(400).json("Oopsy! Something wrong happened...");
  }
});

router.get("/:partId", async (req, res) => {
  const partId = req.params.partId
  try {
    const part = await PartModel.findById(partId).populate({ path: 'brand', model: RigBrandModel }).select('-__v').exec()
    res.json(part);
  } catch (err) {
    console.log(err);
    res.status(400).json("Oopsy! Something wrong happened...");
  }
});

router.post("/type/search", async (req, res) => {
  const filterObj = req.body;
  try {
    const result = await PartModel.distinct('type',filterObj).exec()
    const types = result.map(r=> {
        const rObj = {name:r, selected:false, _id: crypto.randomUUID()}
        return rObj
    } )
    res.json(types);
  } catch (err) {
    console.log(err);
    res.status(400).json("Oopsy! Something wrong happened...");
  }
});

router.post("/", async (req, res) => {
  const rawPart = req.body;
  const {brand} = rawPart
  try {
      let brandObj = null
      if(!brand._id) {
        const newBrandPromise = new RigBrandModel({name:brand.name})
        brandObj = await newBrandPromise.save()
      }
      else {
        brandObj = await RigBrandModel.findById(brand._id).exec()
      }

    const formattedPart = {
      ...rawPart,
      brand: brandObj
    }
    console.log(formattedPart)
    const newPart = new PartModel(formattedPart);

    const part = await newPart.save();
    res.json(part);

  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      res.status(400).json("Email or username already use");
    } else {
      res.status(400).json("Oopsy! Something wrong happened...");
    }

  }
});

router.put("/:partId", async (req, res) => {
    const partId = req.params.partId
    const rawPart = req.body;
    const {brand} = rawPart
    const {type} = rawPart

   try {
      let brandObj = null
      if(!brand._id) {
        const newBrandPromise = new RigBrandModel({name:brand.name})
        brandObj = await newBrandPromise.save()
      }
      else {
        brandObj = await RigBrandModel.findById(brand._id).exec()
      }
      const formattedPart = {
        ...rawPart,
        brand: brandObj,
          type:type.name
      }
      await PartModel.findOneAndUpdate({_id:partId},formattedPart)
      const newPart =  await PartModel.findById(partId).select('-__v -_id').exec()
      if(newPart) res.json(newPart);
      else res.status(400).json("Oopsy! Something wrong happened...");
  } catch (err) {
      console.log(err);
      res.status(400).json("Oopsy! Something wrong happened...");
  }
});

router.delete("/:partId", async (req, res) => {
  const partId = req.params.partId
  try {
    await PartModel.deleteOne({_id:partId}).exec()
    return res.status(200)
  } catch (err) {
    console.log(err);
    res.status(400).json("Oopsy! Something wrong happened...");
  }
});

module.exports = router;