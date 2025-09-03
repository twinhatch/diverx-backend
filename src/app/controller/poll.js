const mongoose = require("mongoose");
const Poll = mongoose.model("Poll");
module.exports = {
  postpoll: async (req, res) => {
    try {
      const data = req.body;
      const newPoll = new Poll(data);
      const response = await newPoll.save();
      console.log("data saved");
      res.status(200).json(response);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  getallpoll: async (req, res) => {
    try {
      const data = await Poll.aggregate([
        {
          $project: {
            question: 1,
            description: 1,
            img: 1,
            options: 1,
            numberOfans: { $size: "$answered" },
            answered: 1

            // alloptions: {
            // $addFields: {
            //   "tempsF": {
            // $map: {
            //   input: "$options",
            //   as: "item",
            //   in: {
            //     "$$item.title": {
            //     $filter: {
            //       input: "$answered",
            //       as: "items",
            //       cond: { $eq: ["$$items.ans", "Yes"] }
            //     }
            //     // },
            //   }
            // }
            //   }
            // }

            // $filter: {
            //   input: "$options",
            //   as: "item",
            //   cond: { $eq: ["$$item.title", "Yes"] }
            //   // cond: {
            //   //   "$$item.title": {
            //   //     $filter: {
            //   //       input: "$answered",
            //   //       as: "ans",
            //   //       cond: { $eq: ["$$item.ans", "$$item.title"] }
            //   //     }
            //   //   },
            //   // }
            // }

            // },

          },
        },

      ]);
      console.log("data fetched");
      res.status(200).json(data);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  // getallpoll:async(req,res)=>{
  //     try {
  //         const data=await Poll.find();
  //         console.log('data fetched');
  //         res.status(200).json(data);
  //     } catch (err) {
  //         console.log(err);
  //         res.status(500).json({error:'Internal Server Error'});
  //     }
  // },
  // getpoll:async(req,res)=>{
  //     try {
  //         const serviceid = await Poll.findById(
  //             req?.params?.id
  //           )
  //         console.log('data fetched');
  //         res.status(200).json(serviceid);
  //     } catch (err) {
  //         console.log(err);
  //         res.status(500).json({error:'Internal Server Error'});
  //     }
  // },
  updatepoll: async (req, res) => {
    try {
      const BasicdataId = req.params.id;
      const BasicdataData = req.body;
      const response = await Poll.findByIdAndUpdate(
        BasicdataId,
        BasicdataData,
        {
          new: true, //return the updateed document
          runValidators: true, //Run Mongoose validation
        }
      );
      if (!response) {
        return res.status(404).json({ error: "Service not found" });
      }
      console.log("data updated");
      res.status(200).json(response);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  deletepoll: async (req, res) => {
    try {
      const BasicdataId = req.params.id;
      const response = await Poll.findByIdAndRemove(BasicdataId);
      if (!response) {
        return res.status(404).json({ error: "Person not found" });
      }
      console.log("data updated");
      res.status(200).json(response);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
  updatepolldata: async (req, res) => {
    try {
      const BasicdataId = req.params.id;
      const response = await Poll.findByIdAndUpdate(BasicdataId, {
        $push: { answered: { user: req.user.id, ans: req.body.ans } }
      }, { new: true, upsert: true });
      if (!response) {
        return res.status(404).json({ error: "Service not found" });
      } else {
        const newData = response.options.find(f => f.title === req.body.ans);
        newData.pr = newData.pr + 1
        await response.save()
      }
      console.log("data updated");
      res.status(200).json(response);
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  },
};
