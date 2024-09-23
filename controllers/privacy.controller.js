const privacyPolicyModel = require('../models/privacy.model');

const add_privacy_policy = async function (req, res) {
  try {
   
    let privacyPolicy = await privacyPolicyModel.find({});
   if(privacyPolicy.length != 0){
    return res.status(400).send({
      error_code : 400,
        message : 'privacy policy are already exist..!'
    })
   }
    await privacyPolicyModel.create(req.body);
    return res.status(201).send({
      error_code : 200,
      message: "privacy and policy added successfully..!",
    });
  } catch (error) {
    console.log(error)
    return res.status(500).send({
      error_code : 500,
      message: error,
    });
  }
};

const update_privacy_policy = async function (req, res) {
  try {
    let id = req.params.id;

    let obj  = {
        privacyPolicy : req.body.privacyPolicy ? req.body.privacyPolicy : undefined
    }
    await privacyPolicyModel.findByIdAndUpdate(
      { _id: id },
      { $set: obj },
      { new: true }
    );
    return res.status(201).send({
      error_code : 200,
      message: "privacy and policy update successfully..!",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      error_code : 500,
      message: error,
    });
  }
};

module.exports = {
  add_privacy_policy,
  update_privacy_policy,
};

