const RigBrandModel = require("../../databases/models/rigBrand.model");
const RigModelModel = require("../../databases/models/rigModel.model");
const RigModel = require("../../databases/models/rig.model");
const multer = require("multer");
const router = require("express").Router();

const storage = multer.diskStorage(
    {
        destination: './images/rigs/',
        filename: function ( req, file, cb ) {
            cb( null, file.originalname);
        }
    }
);
const upload = multer( { storage: storage } );

function formatFilter(filterObj){
    const filterArr = Array.isArray(filterObj) ? filterObj : [filterObj]
    const filter = filterArr.map(
        f => {
            const keys = Object.keys(f)
            const fl = {}
            keys.forEach(key => {
                if (key !== 'filter'){
                    if(typeof f[key] === 'string'){
                        fl[key] = {$regex: f[key]}
                        fl[key] = {...fl[key], $options: 'i'}
                    }
                }
            })
            return fl
        }
    )

    return filter
}

async function createBrand(values){
    try {
        const newBrandPromise = new RigBrandModel(values)
        return await newBrandPromise.save()
    } catch (err) {
        console.log(err);
        return false
    }
}

async function createModel(values){
    try {
        const newModelPromise = new RigModelModel(values)
        return await newModelPromise.save()
    } catch (err) {
        console.log(err);
        return false
    }
}

router.get("/flush", async (req, res) => {
  try {
    const rigModels = await RigModel.deleteMany({ "image": { "$regex": "race-", "$options": "i" } },).exec();
    res.json(rigModels);
  } catch (err) {
    console.log(err);
    res.status(400).json("Oopsy! Something wrong happened...");
  }
});

router.get("/models/:rigId", async (req, res) => {
  const rigId = req.params.rigId
    console.log('rigID',rigId)
  try {
    const rigModels = await RigModelModel.findById(rigId).populate({ path: 'brand', model: RigBrandModel }).select('-__v').exec()
    res.json(rigModels);
  } catch (err) {
    console.log(err);
    res.status(400).json("Oopsy! Something wrong happened...");
  }
});

router.post("/models", async (req, res) => {
  const rawModel = req.body;
  const {brand} = rawModel
  try {
      let brandObj = null
      if(!brand._id) {
        const newBrandPromise = new RigBrandModel({name:brand.name})
        brandObj = await newBrandPromise.save()
      }
      else {
        brandObj = await RigBrandModel.findById(brand._id).exec()
      }

    const formattedModel = {
      ...rawModel,
      brand: brandObj
    }
    const newModel = new RigModelModel(formattedModel);

    const models = await newModel.save();
    res.json(models);

  } catch (err) {
    console.log(err);
    if (err.code === 11000) {
      res.status(400).json("Email or username already use");
    } else {
      res.status(400).json("Oopsy! Something wrong happened...");
    }

  }
});

router.post("/models/search", async (req, res) => {
  const filterObj = req.body;
  const filter = formatFilter(filterObj)
  try {
    const result = await RigModelModel.find({name : filterObj.name}).populate({ path: 'brand', model: RigBrandModel }).then((models) => {

        const filter = typeof filterObj['filter']['$regex'] === 'string' ? filterObj['filter']['$regex'] : null

        if( filter) {
            models = models.filter(function (m) {
                return m.brand.name === filter
            })
        }
        return models
    })
  const formattedResult = result.map(
            (m) => {
                m.name = m.brand.name+' - '+m.name
                return m
            }
  )
    res.json(formattedResult);
  } catch (err) {
    console.log(err);
    res.status(400).json("Oopsy! Something wrong happened...");
  }
});

router.put("/models/:rigId", async (req, res) => {
  const rigId = req.params.rigId
  const rawModel = req.body;
  const {brand} = rawModel

   try {
      let brandObj = null
      if(!brand._id) {
        const newBrandPromise = new RigBrandModel({name:brand.name})
        brandObj = await newBrandPromise.save()
      }
      else {
        brandObj = await RigBrandModel.findById(brand._id).exec()
      }
      const formattedModel = {
        ...rawModel,
        brand: brandObj
      }
      await RigModelModel.findOneAndUpdate({_id:rigId},formattedModel)
      const newModel =  await RigModelModel.findById(rigId).select('-__v -_id').exec()
      if(newModel) res.json(newModel);
      else res.status(400).json("Oopsy! Something wrong happened...");
  } catch (err) {
      console.log(err);
      res.status(400).json("Oopsy! Something wrong happened...");
  }
});

router.delete("/models/:modelId", async (req, res) => {
  const modelId = req.params.modelId
  try {
    await RigModelModel.deleteOne({_id:modelId}).exec()
    return res.status(200)
  } catch (err) {
    console.log(err);
    res.status(400).json("Oopsy! Something wrong happened...");
  }
});

//TODO: work on indentation

router.get("/", async (req, res) => {
    let sortFields= {}
    let limit = ''
    const populate = {
            path: 'model',
            model: RigModelModel,
            populate : {
                path : 'brand',
                model: RigBrandModel
            }
        }

    if(req.query.sort){
        req.query.sort[0] === '-' ? sortFields[req.query.sort.slice(1)] = -1 : sortFields[req.query.sort.slice(1)] = 1
    }
    if(req.query.limit){
        req.query.limit ? limit = req.query.limit : limit = ''
    }
  try {
    const rigs = await RigModel
        .find()
        .sort(sortFields)
        .limit(limit)
        .populate(populate).exec()
    res.json(rigs);
  } catch (err) {
    console.log(err);
    res.status(400).json("Oopsy! Something wrong happened...");
  }
});

router.get("/:rigId", async (req, res) => {
  const rigId = req.params.rigId
  try {
    const rig = await RigModel.findById(rigId).populate({
            path: 'model',
            model: RigModelModel,
            populate : {
                path : 'brand',
                model: RigBrandModel
            }
        }).select('-__v').exec()
    res.json(rig);
  } catch (err) {
    console.log(err);
    res.status(400).json("Oopsy! Something wrong happened...");
  }
});

router.post("/", async (req, res) => {
    const rig = req.body
    console.log('RIG',rig)
    let brandObj = null
    let modelObj = null

    // creation of brand if not exists
    if(!rig.brand._id) {
        brandObj = await createBrand(rig.brand)
    }
    else {
        brandObj = await RigBrandModel.findById(rig.brand._id).exec()
    }

    // creation of model if not exists on an existing brand (new or get by model)
    if(!rig.model._id || !rig.brand._id ) {
        modelObj = await createModel({
            name:rig.model.name,
            brand:brandObj
        })
    }
    else {
        modelObj = await RigModelModel.findById(rig.model._id).exec()
    }
    //now create the rig
    try {
        const newRigPromise = new RigModel({
            ...rig,
            model:modelObj,
            like:Math.floor(Math.random() * 1000), //TODO:just for testing
            created_at: new Date(),
            image: modelObj.type ? `${modelObj.type}-0${Math.floor(Math.random() * 4)+1}.png` : null
        })

        const newRig = await newRigPromise.save()

        res.json(newRig);

    } catch (err) {
    console.log(err);
      res.status(400).json("Error while creating new rig");
}
});

router.put("/:rigId", async (req, res) => {
    const rigId = req.params.rigId
    const rig = req.body;
    console.log('UPD',rig)
    const {brand} = rig
    let brandObj = null
    let modelObj = null

    // creation of brand if not exists
    if(!rig.brand._id) {
        brandObj = await createBrand(rig.brand)
    }
    else {
        brandObj = await RigBrandModel.findById(rig.brand._id).exec()
    }

    // creation of model if not exists on an existing brand (new or get by model)
    if(!rig.model._id || !rig.brand._id ) {
        modelObj = await createModel({
            name:rig.model.name,
            brand:brandObj
        })
    }
    else {
        modelObj = await RigModelModel.findById(rig.model._id).exec()
    }

   try {
      const formattedRig = {
        ...rig,
        model: modelObj
      }
      await RigModel.findOneAndUpdate({_id:rigId},formattedRig)
      const newRig =  await RigModel.findById(rigId).select('-__v -_id').exec()
      if(newRig) res.json(newRig);
      else res.status(400).json("Oopsy! Something wrong happened...");
  } catch (err) {
      console.log(err);
      res.status(400).json("Oopsy! Something wrong happened...");
  }
});

router.delete("/:rigId", async (req, res) => {
  const rigId = req.params.rigId
  try {
    await RigModel.deleteOne({_id:rigId}).exec()
    return res.status(200)
  } catch (err) {
    console.log(err);
    res.status(400).json("Oopsy! Something wrong happened...");
  }
});



router.post("/image", upload.array("file"), uploadFiles);

function uploadFiles(req, res) {
    console.log('FILE',req.files);
    res.json({ message: "Successfully uploaded files" });
}

module.exports = router;