const response = require("./../responses");
const mongoose = require("mongoose");
const Content = mongoose.model("Content");
const Privacy = mongoose.model("Privacy");
const Wapp = mongoose.model("Wapp");
const fs = require("fs");


module.exports = {
  getStaticData: async (req, res) => {
    try {
      let services = {
        profession: [],
        skills: []
      }
      fs.readFile(
        __dirname + `/data/profession.json`,
        "utf-8",
        (err, data) => {
          services.profession = JSON.parse(data).profession
          fs.readFile(
            __dirname + `/data/skills.json`,
            "utf-8",
            (err, data) => {
              services.skills = JSON.parse(data).skills
              return response.ok(res, services);
            }
          );
        }
      );
    } catch (error) {
      return response.error(res, error);
    }
  },
  create: async (req, res) => {
    try {
      const payload = {
        ...req.body,
      };
      if (payload.id) {
        let updatedData = await Content.findByIdAndUpdate(payload.id, payload, {
          new: true,
          upsert: true,
        });
        return response.ok(res, {
          message: "Content Updated",
          content: updatedData,
        });
      } else {
        //console.log(payload);
        let content = new Content(payload);
        await content.save();
        return response.ok(res, { message: "Content Created", content });
      }
    } catch (error) {
      console.log(error);
      return response.error(res, error);
    }
  },
  getContent: async (req, res) => {
    try {
      const data = await Content.find();
      return response.ok(res, data);
    } catch (error) {
      return response.error(res, error);
    }
  },

  createprivacy: async (req, res) => {
    try {
      const payload = {
        ...req.body,
      };
      if (payload.id) {
        let updatedData = await Privacy.findByIdAndUpdate(payload.id, payload, {
          new: true,
          upsert: true,
        });
        return response.ok(res, {
          message: "Content Updated",
          content: updatedData,
        });
      } else {
        //console.log(payload);
        let content = new Privacy(payload);
        await content.save();
        return response.ok(res, { message: "Content Created", content });
      }
    } catch (error) {
      console.log(error);
      return response.error(res, error);
    }
  },
  getprivacy: async (req, res) => {
    try {
      const data = await Privacy.find();
      return response.ok(res, data);
    } catch (error) {
      return response.error(res, error);
    }
  },

  createWhatsapp: async (req, res) => {
    try {
      let payload = req.body;
      payload.user = req.user._id;

      //   console.log(payload);
      if (payload.id) {
        const updatedData = await Wapp.findByIdAndUpdate(payload.id, payload, {
          new: true,
          upsert: true,
        });
        return res.status(200).json({
          success: true,
          data: updatedData,
          message: "Whatsapp number updated",
        });
      } else {
        let tic = new Wapp(payload);
        let t = await tic.save();
        res
          .status(200)
          .json({ success: true, data: t, message: "Whatsapp number added" });
      }
    } catch (err) {
      console.log(err);
      res.status(400).json({ success: false, duplicate: false });
    }
  },
  getWapp: async (req, res) => {
    try {
      let tic = await Wapp.find();
      res.status(200).json({ success: true, data: tic });
    } catch (err) {
      console.log(err);
      res.status(400).json({ success: false, duplicate: false });
    }
  },
};
