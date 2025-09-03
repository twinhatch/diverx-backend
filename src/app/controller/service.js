const mongoose = require("mongoose");
const Service = mongoose.model("Service")
const UserService = mongoose.model("UserService")
module.exports = {
    postservice: async (req, res) => {
        try {
            const data = req.body
            const newService = new Service(data);
            const response = await newService.save();
            console.log('data saved');
            res.status(200).json(response);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getallservice: async (req, res) => {
        try {
            let cond = {}
            if (req.query.type) {
                cond.type = req.query.type
            }

            const data = await Service.find(cond);
            console.log('data fetched');
            res.status(200).json(data);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },


    getservice: async (req, res) => {
        try {
            const serviceid = await Service.findById(
                req?.params?.id
            )
            console.log('data fetched');
            res.status(200).json(serviceid);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    updateservice: async (req, res) => {
        try {
            const BasicdataId = req.params.id;
            const BasicdataData = req.body;
            const response = await Service.findByIdAndUpdate(BasicdataId, BasicdataData, {
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
    deleteservice: async (req, res) => {
        try {
            const BasicdataId = req.params.id;
            const response = await Service.findByIdAndRemove(BasicdataId);
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

    postservicerequest: async (req, res) => {
        try {
            const data = req.body
            const newService = new UserService(data);
            const response = await newService.save();
            console.log('data saved');
            res.status(200).json(response);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getallserviceereuest: async (req, res) => {
        try {
            let cond = {}
            if (req.query.type) {
                cond.type = req.query.type
            }

            const data = await UserService.find(cond).populate('services', 'title').populate('user', '-password');
            console.log('data fetched');
            res.status(200).json(data);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },


    getservicerequet: async (req, res) => {
        try {
            const serviceid = await UserService.findById(
                req?.params?.id
            )
            console.log('data fetched');
            res.status(200).json(serviceid);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getservicerequetbyuser: async (req, res) => {
        try {
            const serviceid = await UserService.find(
                { user: req?.user?.id, active: req.body.active }
            ).populate('services', 'title')
            console.log('data fetched');
            res.status(200).json(serviceid);
        } catch (err) {
            console.log(err);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    updateservicerequest: async (req, res) => {
        try {
            const BasicdataId = req.params.id;
            const BasicdataData = req.body;
            const response = await UserService.findByIdAndUpdate(BasicdataId, BasicdataData, {
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
    deleteservicerequest: async (req, res) => {
        try {
            const BasicdataId = req.params.id;
            const response = await UserService.findByIdAndRemove(BasicdataId);
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