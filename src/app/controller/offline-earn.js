const mongoose = require("mongoose");
const OfflineEarn = mongoose.model("OfflineEarn")
module.exports = {
    postOfflineEarn: async (req, res) => {
        try {
            const data = req.body
            data.user = req.user.id
            const newService = new OfflineEarn(data);
            const response = await newService.save();
            console.log('data saved');
            res.status(200).json(response);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getallnOfflineEarn: async (req, res) => {
        try {
            const data = await OfflineEarn.find().populate('user', '-password');
            console.log('data fetched');
            res.status(200).json(data);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getOfflineEarnByUser: async (req, res) => {
        try {
            const data = await OfflineEarn.findOne({ user: req.user.id });
            console.log('data fetched');
            res.status(200).json(data);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    updateOfflineEarn: async (req, res) => {
        try {
            const BasicdataId = req.params.id;
            const BasicdataData = req.body;
            const response = await OfflineEarn.findByIdAndUpdate(BasicdataId, BasicdataData, {
                new: true,//return the updateed document
                runValidators: true, //Run Mongoose validation
            });
            if (!response) {
                return res.status(404).json({ error: 'Service not found' });
            }
            console.log('data updated');
            res.status(200).json(response);

        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }

    },
    deleteOfflineEarn: async (req, res) => {
        try {
            const BasicdataId = req.params.id;
            const response = await OfflineEarn.findByIdAndRemove(BasicdataId);
            if (!response) {
                return res.status(404).json({ error: 'Person not found' });
            }
            console.log('data updated');
            res.status(200).json(response);

        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
}