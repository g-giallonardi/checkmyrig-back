const RigBrandModel = require("../../databases/models/rigBrand.model");
const router = require("express").Router();

function formatFilter(filterObj){
    const filterArr = Array.isArray(filterObj) ? filterObj : [filterObj]
    console.log(Object.keys(filterObj))
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

    return filter[0]
}

router.get("/", async (req, res) => {

  try {
    const brands =  await RigBrandModel.find().exec()
    res.json(brands);
  } catch (err) {
      res.status(400).json("Oopsy! Something wrong happened...");
  }
});

router.get("/:brandId", async (req, res) => {
  const brandId = req.params.brandId
  try {
    const brand =  await RigBrandModel.findById(brandId).exec()
    res.json(brand);
  } catch (err) {
      res.status(400).json("Oopsy! Something wrong happened...");
  }
});

router.post("/", async (req, res) => {
  const { name } = req.body;
  const newBrand = new RigBrandModel({
    name
  });

  try {
    const brand = await newBrand.save();
    res.json(brand);
  } catch (err) {
    console.log(err);
    res.status(400).json("Oopsy! Something wrong happened...");
  }
});

router.post("/search", async (req, res) => {
  const findFilter = formatFilter(req.body)
  try {
    const result = await RigBrandModel.find(findFilter).exec()
    console.log(result)
    res.json(result);
  } catch (err) {
    console.log(err);
    res.status(400).json("Oopsy! Something wrong happened...");
  }
});

router.put("/:brandId", async (req, res) => {
  const brandId = req.params.brandId
  const updatedBrand = req.body;
  try {
    await RigBrandModel.findOneAndUpdate({_id:brandId},updatedBrand)
    const newBrand =  await RigBrandModel.findById(brandId).select('-__v -_id').exec()
    if(newBrand) res.json(newBrand);
    else res.status(400).json("Oopsy! Something wrong happened...");
  } catch (err) {
    console.log(err);
    res.status(400).json("Oopsy! Something wrong happened...");
  }
});

router.delete("/:brandId", async (req, res) => {
  const brandId = req.params.brandId
  try {
    await RigBrandModel.deleteOne({_id:brandId}).exec()
    return res.status(200)
  } catch (err) {
    console.log(err);
    res.status(400).json("Oopsy! Something wrong happened...");
  }
});

module.exports = router;