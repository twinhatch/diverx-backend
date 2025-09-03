"use strict";
const userHelper = require("./../helper/user");
const response = require("./../responses");
const passport = require("passport");
const jwtService = require("./../services/jwtService");
const mailNotification = require("./../services/mailNotification");
const mongoose = require("mongoose");
const Device = mongoose.model("Device");
const User = mongoose.model("User");
const Review = mongoose.model("Review");
const Verification = mongoose.model("Verification");
const Notification = mongoose.model("Notification");
const Idcount = mongoose.model("IdcountSchema");
const Newsletter = mongoose.model("Newsletter");
// const Identity = mongoose.model("Identity");
// const Client = mongoose.model("Client");
const bcrypt = require("bcryptjs");
const { notify } = require("../services/notification");
const sendOtp = require("../services/sendOtp");
var cron = require('node-cron');
const moment = require('moment');
const { default: axios } = require("axios");
const { tranferToAccount, addAccount } = require("../services/payout");
const { getBase64Image } = require("../services/getBase64");

module.exports = {
  // login controller
  login: (req, res) => {
    console.log(req.body);
    req.body.from = 'Normal'
    req.body.email = req.body.email+'/NORMAL'
    passport.authenticate("local", async (err, user, info) => {
      if (err) {
        return response.error(res, err);
      }
      if (!user) {
        return response.unAuthorize(res, info);
      }
      //console.log('user=======>>',user);
      let token = await new jwtService().createJwtToken({
        id: user._id,
        type: user.type,
      });
      await Device.updateOne(
        { device_token: req.body.device_token },
        { $set: { player_id: req.body.player_id, user: user._id } },
        { upsert: true }
      );
      const data = {
        token,
        ...user._doc,
      };
      delete data.password;
      return response.ok(res, data);
    })(req, res);
  },
  createContact: async (req, res) => {
    try {

      const data = await tranferToAccount('fa_NlPKlUUWZifmC3', 100, 'travelplan', '54944494')
      res.status(200).send({ data: data });
      // const payload = req.body
      // let reqData = {
      //   name: payload.fullName,
      //   email: payload.email.toLowerCase(),
      //   contact: payload.phone,
      //   type: 'customer',
      // }
      // const authHeader = {
      //   auth: {
      //     username: process.env.RAZORPAY_KEY,
      //     password: process.env.RAZORPAY_SECRET
      //   }
      // };
      // axios.post('https://api.razorpay.com/v1/contacts', reqData, authHeader)
      //   .then(response => {
      //     console.log('Response:', response.data);
      //     res.status(200).send({ data: response.data });
      //   })
      //   .catch(error => {
      //     console.error('Error:', error.message);
      //   });
    } catch (err) {
      console.log(err);
      response.error(res, err)
    }

  },
  signUp: async (req, res) => {
    try {
      const payload = req.body;
      console.log(payload);
      let ver = await Verification.findOne({ phone: payload.phone });
      console.log(ver)
      if (Number(payload.otp) === ver.otp &&
        !ver.verified &&
        new Date().getTime() < new Date(ver.expiration_at).getTime()) {
        let user = await User.find({
          phone: payload.phone,
        });

        let users = await User.findOne({
          email: payload.email.toLowerCase(),
        });

        if (users) {
          return res.status(404).json({
            success: false,
            message: "Email ID already exists.",
          });
        }

        if (!user.length) {
          let id = await Idcount.find()
          payload.userID = id[0].userID
          let user = new User({
            fullName: payload.fullName,
            email: payload.email.toLowerCase(),
            password: payload.password,
            type: payload.type,
            phone: payload.phone,
            idproof: payload.idproof,
            profile: payload.profile,
            code: payload.code,
          });
          user.password = user.encryptPassword(payload.password);
          await user.save();
          user.userID = id[0].userID;
          await user.save();
          const userID = id[0].userID + 1
          await Idcount.updateMany({}, { userID })
          await Verification.findOneAndDelete({ phone: payload.phone });
          // let reqData = {
          //   name: payload.fullName,
          //   email: payload.email.toLowerCase(),
          //   contact: payload.phone,
          //   type: 'customer',
          // }
          // const authHeader = {
          //   auth: {
          //     username: process.env.RAZORPAY_KEY,
          //     password: process.env.RAZORPAY_SECRET
          //   }
          // };
          // axios.post('https://api.razorpay.com/v1/contacts', reqData, authHeader)
          //   .then(response => {
          //     console.log('Response:', response.data);
          //     user.razorpay_contact_id = response.data.id
          //   })
          //   .catch(error => {
          //     console.error('Error:', error.message);
          //   });
          // await user.save();
          res.status(200).json({ success: true, phone: user.phone });
        } else {
          res.status(404).json({
            success: false,
            message: "Phone number already exists.",
          });
        }
      } else {
        res.status(404).json({ success: false, message: "Invalid OTP" });
      }
    } catch (err) {
      console.log(err);
      if (err && err.code == 11000) {
        console.log(err);
        res.status(200).json({ success: false, duplicate: true });
      } else {
        console.log(err);
        res.status(400).json({ success: false, duplicate: false });
      }
    }
  },
  changePasswordProfile: async (req, res) => {
    try {
      let user = await User.findById(req.user.id);
      if (!user) {
        return response.notFound(res, { message: "User doesn't exists." });
      }
      user.password = user.encryptPassword(req.body.password);
      await user.save();
      mailNotification.passwordChange({ email: user.email });
      return response.ok(res, { message: "Password changed." });
    } catch (error) {
      return response.error(res, error);
    }
  },

  updateUser: async (req, res) => {
    delete req.body.password;
    try {
      let userDetail = await User.findById(req.user.id);
      // console, log(userDetail.phone, req.body.phone)
      if (userDetail.phone !== req.body.phone && !req.body.otp) {
        console.log(req.body.phone)
        await sendOtp.sendOtp(req.body.phone);
        // let ran_otp = Math.floor(1000 + Math.random() * 9000);
        return response.ok(res, { otp: true, message: "OTP sent to your phone number" });
      } else {
        let ver = await Verification.findOne({ phone: req.body.phone });
        if (req.body.otp && Number(req.body.otp) === ver.otp &&
          !ver.verified &&
          new Date().getTime() < new Date(ver.expiration_at).getTime()) {
          const user = await User.updateOne(
            { _id: req.user.id },
            { $set: req.body },
            { upsert: true, new: true }
          );
          ver.verified = true;
          await Verification.findOneAndDelete({ phone: req.body.phone });
          let token = await new jwtService().createJwtToken({
            id: user._id,
            type: user.type,
          });
          console.log(user);
          const data = {
            token,
            ...user._doc,

          };
          return response.ok(res, { data, otp: false, message: "Profile Updated." });
        } else {
          return res.status(404).json({ success: false, message: "Invalid OTP" });
        }

      }
    } catch (error) {
      return response.error(res, error);
    }
  },
  sendotp: async (req, res) => {
    try {
      const payload = req.body;
      console.log(payload);
      let user = await User.findOne({
        phone: payload.phone,
      });

      console.log(user);
      //for signup
      if (payload.type === "signup") {
        let user2 = await User.findOne({
          email: payload.email.toLowerCase(),
        });
        if (user) {
          return res.status(404).json({
            success: false,
            message: "Phone number already exists.",
          });
        } if (user2) {
          return res.status(404).json({
            success: false,
            message: "Email Id already exists.",
          });
        } else {
          await sendOtp.sendOtp(payload.phone)
          return res.status(200).json({
            success: true,
            message: "OTP sent to your phone number",
          });
        }
      } else if (payload.type === "signin") {
        ///for login
        if (user) {
          console.log(user, payload.password, user?.password);
          const validPassword = await bcrypt.compareSync(
            payload.password,
            user.password
          );
          if (validPassword) {
            let ran_otp = Math.floor(1000 + Math.random() * 9000);
            return res.status(200).json({
              success: true,
              message: "OTP sent to your phone number",
            });
          } else {
            res
              .status(404)
              .json({ success: false, message: "Invalid password" });
          }
        } else {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }
      } else {
        // forgot password
        if (user) {
          await sendOtp.sendOtp(payload.phone)
          // let ran_otp = Math.floor(1000 + Math.random() * 9000);
          return res.status(200).json({
            success: true,
            message: "OTP sent to your phone number",
          });
        } else {
          return res.status(404).json({
            success: false,
            message: "User not found",
          });
        }
      }
    } catch (err) {
      console.log(err);
      if (err && err.code == 11000) {
        console.log(err);
        return res.status(200).json({ success: false, duplicate: true });
      } else {
        console.log(err);
        return res.status(400).json({ success: false, duplicate: false });
      }
    }
  },
  verifyOTP: async (req, res) => {
    try {
      const otp = req.body.otp;
      const token = req.body.token;
      if (!(otp && token)) {
        return response.badReq(res, { message: "otp and token required." });
      }
      let verId = await userHelper.decode(token);
      let ver = await Verification.findById(verId);
      if (
        otp == ver.otp &&
        !ver.verified &&
        new Date().getTime() < new Date(ver.expiration_at).getTime()
      ) {
        let token = await userHelper.encode(
          ver._id + ":" + userHelper.getDatewithAddedMinutes(5).getTime()
        );
        ver.verified = true;
        await ver.save();
        return response.ok(res, { message: "OTP verified", token });
      } else {
        return response.notFound(res, { message: "Invalid OTP" });
      }
    } catch (error) {
      return response.error(res, error);
    }
  },
  changePassword: async (req, res) => {
    try {
      const token = req.body.token;
      const password = req.body.password;
      const data = await userHelper.decode(token);
      const [verID, date] = data.split(":");
      if (new Date().getTime() > new Date(date).getTime()) {
        return response.forbidden(res, { message: "Session expired." });
      }
      let otp = await Verification.findById(verID);
      if (!otp.verified) {
        return response.forbidden(res, { message: "unAuthorize" });
      }
      let user = await User.findById(otp.user);
      if (!user) {
        return response.forbidden(res, { message: "unAuthorize" });
      }
      await otp.remove();
      user.password = user.encryptPassword(password);
      await user.save();
      mailNotification.passwordChange({ email: user.email });
      return response.ok(res, { message: "Password changed! Login now." });
    } catch (error) {
      return response.error(res, error);
    }
  },

  forgotPassword: async (req, res) => {
    try {
      const payload = req?.body;
      console.log(payload);

      let user = await User.findOne({ phone: payload.phone });


      if (user) {
        let ver = await Verification.findOne({ phone: payload.phone });
        console.log(ver)
        if (Number(payload.otp) === ver.otp &&
          !ver.verified &&
          new Date().getTime() < new Date(ver.expiration_at).getTime()) {
          user.password = bcrypt.hashSync(
            payload.password,
            bcrypt.genSaltSync(10)
          );
          // ver.verified = true;
          // await ver.save();
          await user.save();
          await Verification.findOneAndDelete({ phone: payload.phone });
          res.status(200).json({ success: true, message: "Password changed successfully" });
          // } else {
          //   res.status(404).json({ success: false, message: "Invalid OTP" });
          // }
        } else {
          res.status(404).json({ success: false, message: "Invalid OTP" });
        }
      } else {
        res.status(404).json({ success: false, message: "User not found" });
      }
    } catch (err) {
      console.log(err);
      if (err && err.code == 11000) {
        console.log(err);
        res.status(200).json({ success: false, duplicate: true });
      } else {
        console.log(err);
        res.status(400).json({ success: false, duplicate: false });
      }
    }
  },

  notification: async (req, res) => {
    try {
      let notifications = await Notification.find({ for: req.user.id })
        .populate({
          path: "invited_for",
          populate: { path: "job" },
        })
        .lean();
      return response.ok(res, { notifications });
    } catch (error) {
      return response.error(res, error);
    }
  },
  updateSettings: async (req, res) => {
    try {
      await User.findByIdAndUpdate(req.user.id, { $set: req.body });
      return response.ok(res, { message: "Settings updated." });
    } catch (error) {
      return response.error(res, error);
    }
  },
  getSettings: async (req, res) => {
    try {
      const settings = await User.findById(req.user.id, {
        notification: 1,
        distance: 1,
      });
      return response.ok(res, { settings });
    } catch (error) {
      return response.error(res, error);
    }
  },
  fileUpload: async (req, res) => {
    try {
      let key = req.file && req.file.key;
      return response.ok(res, {
        message: "File uploaded.",
        file: `${process.env.ASSET_ROOT}/${key}`,
      });
    } catch (error) {
      return response.error(res, error);
    }
  },

  docUpload: async (req, res) => {
    try {
      let key = req.file && req.file.key;
      return response.ok(res, {
        message: "File uploaded.",
        file: `${process.env.ASSET_ROOT}/${key}`,
      });
    } catch (error) {
      return response.error(res, error);
    }
  },
  // fileUpload: async (req, res) => {
  //   try {
  //     let key = req.file && req.file.key,
  //       type = req.body.type;
  //     let ident = await Identity.findOne({ type, user: req.user.id });

  //     if (key) {
  //       ident.key = key; //update file location
  //     }
  //     if (req.body.expire && type == "SI_BATCH") {
  //       ident.expire = req.body.expire;
  //     }
  //     await ident.save();
  //     return response.ok(res, {
  //       message: "File uploaded.",
  //       file: `${process.env.ASSET_ROOT}/${key}`,
  //     });
  //   } catch (error) {
  //     return response.error(res, error);
  //   }
  // },
  updateProfileFromAdmin: async (req, res) => {
    try {
      const users = await User.findByIdAndUpdate(req.body.user, req.body)
      return response.ok(res, users);
    } catch (error) {
      return response.error(res, error);
    }
  },

  allOrganization: async (req, res) => {
    try {
      const users = await userHelper.findAll({ isOrganization: true }).lean();
      return response.ok(res, { users });
    } catch (error) {
      return response.error(res, error);
    }
  },

  guardListSearch: async (req, res) => {
    try {
      const cond = {
        type: "PROVIDER",
        $or: [
          { username: { $regex: req.body.search } },
          { email: { $regex: req.body.search } },
        ],
      };
      let guards = await User.find(cond).lean();
      return response.ok(res, { guards });
    } catch (error) {
      return response.error(res, error);
    }
  },
  //////////Inten Surya's code ---!!!caution!!!/////

  //GuardList

  getProfile: async (req, res) => {
    console.log(req.body);
    try {
      const u = await User.findById(req.user.id);

      const data = {
        ...u._doc,
        rating: await userHelper.getReview(req.user.id),
      };
      delete data.password;
      return response.ok(res, data);
    } catch (error) {
      return response.error(res, error);
    }
  },
  updateProfile: async (req, res) => {
    const payload = req.body;
    delete req.body.password;
    const userId = req?.body?.userId || req.user.id
    try {
      let userDetail = await User.findById(userId);
      console.log(userDetail.phone, req.body.phone)
      if (req.body.phone && userDetail.phone !== req.body.phone && !req.body.otp) {
        let u = await User.findOne({ phone: req.body.phone });
        if (u) {
          return response.conflict(res, { message: "Phone Number already exist." });
        }
        await sendOtp.sendOtp(req.body.phone)
        // let ran_otp = Math.floor(1000 + Math.random() * 9000);
        return response.ok(res, { otp: true, message: "OTP sent to your phone number" });
      } else {
        if (payload.otp) {
          let ver = await Verification.findOne({ phone: payload.phone });
          console.log(ver)
          if (Number(payload.otp) === ver.otp &&
            !ver.verified &&
            new Date().getTime() < new Date(ver.expiration_at).getTime()) {
            const u = await User.findByIdAndUpdate(
              userId,
              { $set: payload },
              {
                new: true,
                upsert: true,
              }
            );
            let token = await new jwtService().createJwtToken({
              id: u._id,
              type: u.type,
            });
            const data = {
              token,
              ...u._doc,
            };
            delete data.password;
            await Verification.findOneAndDelete({ phone: payload.phone });
            return response.ok(res, data);

          } else {
            return res.status(404).json({ success: false, message: "Invalid OTP" });
          }
        } else {

          if (req.query.for === 'bankdetail') {
            let user = await User.findById(userId)
            const accountdata = await addAccount(user, payload)
            if (accountdata.status) {
              user.razorpay_bankaccount_id = accountdata.data.id
              if (accountdata.storeContactid) {
                user.razorpay_contact_id = accountdata.data.contact_id
              }
              await user.save();
            }
          }
          const u = await User.findByIdAndUpdate(
            userId,
            { $set: payload },
            {
              new: true,
              upsert: true,
            }
          );
          let token = await new jwtService().createJwtToken({
            id: u._id,
            type: u.type,
          });
          const data = {
            token,
            ...u._doc,
          };
          delete data.password;
          await Verification.findOneAndDelete({ phone: payload.phone });
          return response.ok(res, data);
        }


      }
    } catch (error) {
      return response.error(res, error);
    }
  },

  updateUserAdmin: async (req, res) => {
    try {
      if (req.query.id) {
        await User.findByIdAndUpdate(req.query.id, req.body);
      } else {
        await User.findByIdAndUpdate(req.user.id, { $set: req.body });
      }
      return response.ok(res, { message: "Profile Updated." });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getAllusers: async (req, res) => {
    console.log(req.body);
    try {
      let u;
      if (req.query.from === 'payment') {
        u = await User.find().sort({ wallet: -1, refund: -1 });
      } else {
        u = await User.find();
      }

      const data = [];
      await Promise.all(
        u.map(async (item) => {
          delete item._doc.password;
          const rate = await userHelper.getReview(item._id)
          data.push({ ...item._doc, rate });
        })
      )
      return response.ok(res, data);
    } catch (error) {
      return response.error(res, error);
    }
  },

  verifyUser: async (req, res) => {
    console.log(req.body);
    try {
      const u = await User.findByIdAndUpdate(
        req.body.user_id,
        {
          verified: true,
          status: req.body.status,
        },
        { new: true, upsert: true }
      );
      return response.ok(res, u);
    } catch (error) {
      return response.error(res, error);
    }
  },

  giverate: async (req, res) => {
    console.log(req.body);
    try {
      let payload = req.body;
      const re = await Review.findOne({
        user: payload.user,
        posted_by: req.user.id,
      });
      if (re) {
        re.description = payload.description;
        re.rating = payload.rating;
        await re.save();
      } else {
        payload.posted_by = req.user.id;
        const u = new Review(payload);
        await u.save();
      }

      return response.ok(res, { message: "successfully" });
    } catch (error) {
      return response.error(res, error);
    }
  },

  getReview: async (req, res) => {
    try {
      const cond = {}
      if (req.params.id) {
        cond.user = req.params.id
      }
      const allreview = await Review.find(cond)
        .populate("posted_by user", "-password")
      res.status(200).json({
        success: true,
        data: allreview,
      });
      // });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },



  addNewsLetter: async (req, res) => {
    try {
      const payload = req?.body || {};
      const u = await Newsletter.find(payload);
      if (u.length > 0) {
        return response.conflict(res, {
          message: "Email already exists.",
        });
      } else {
        let news = new Newsletter(payload);
        const newsl = await news.save();
        return response.ok(res, newsl);
      }
    } catch (error) {
      return response.error(res, error);
    }
  },

  getNewsLetter: async (req, res) => {
    try {
      let news = await Newsletter.find({ type: req.params.type });
      return response.ok(res, news);
    } catch (error) {
      return response.error(res, error);
    }
  },


  // forgot password by email
  sendOTPByEmail: async (req, res) => {
    try {
      const email = req.body.email;
      if (!email) {
        return response.badReq(res, { message: "Email required." });
      }
      const user = await User.findOne({ email });
      if (user) {
        let ver = await Verification.findOne({ user: user._id });
        // OTP is fixed for Now: 0000
        let ran_otp = Math.floor(1000 + Math.random() * 9000);
        await mailNotification.sendOTPmail({
          code: ran_otp,
          email: user.email,
        });
        // let ran_otp = '0000';
        if (
          !ver ||
          new Date().getTime() > new Date(ver.expiration_at).getTime()
        ) {
          ver = new Verification({
            user: user._id,
            otp: ran_otp,
            expiration_at: userHelper.getDatewithAddedMinutes(5),
          });
          await ver.save();
        }
        let token = await userHelper.encode(ver._id);

        return response.ok(res, { message: "OTP sent.", token });
      } else {
        return response.notFound(res, { message: "User does not exists." });
      }
    } catch (error) {
      return response.error(res, error);
    }
  },
  verifyOTPByEmail: async (req, res) => {
    try {
      const otp = req.body.otp;
      const token = req.body.token;
      if (!(otp && token)) {
        return response.badReq(res, { message: "otp and token required." });
      }
      let verId = await userHelper.decode(token);
      let ver = await Verification.findById(verId);
      if (
        otp == ver.otp &&
        !ver.verified &&
        new Date().getTime() < new Date(ver.expiration_at).getTime()
      ) {
        let token = await userHelper.encode(
          ver._id + ":" + userHelper.getDatewithAddedMinutes(5).getTime()
        );
        ver.verified = true;
        await ver.save();
        return response.ok(res, { message: "OTP verified", token });
      } else {
        return response.notFound(res, { message: "Invalid OTP" });
      }
    } catch (error) {
      return response.error(res, error);
    }
  },
  changePasswordByEmail: async (req, res) => {
    try {
      const token = req.body.token;
      const password = req.body.password;
      const data = await userHelper.decode(token);
      const [verID, date] = data.split(":");
      if (new Date().getTime() > new Date(date).getTime()) {
        return response.forbidden(res, { message: "Session expired." });
      }
      let otp = await Verification.findById(verID);
      if (!otp.verified) {
        return response.forbidden(res, { message: "unAuthorize" });
      }
      let user = await User.findById(otp.user);
      if (!user) {
        return response.forbidden(res, { message: "unAuthorize" });
      }
      await Verification.findByIdAndDelete(verID);
      user.password = user.encryptPassword(password);
      await user.save();
      mailNotification.passwordChange({ email: user.email });
      return response.ok(res, { message: "Password changed! Login now." });
    } catch (error) {
      return response.error(res, error);
    }
  },

  notifyUser: async (req, res) => {
    try {
      const payload = req.body
      const cond = {
        // to: '652d0fe977122e4e4acb0af4',
        // to: '6524ea77e224eec130846382',
        to: payload.to,
        content: "Welcome to SA APP"
      }
      await notify(cond)

      const newDate = new Date().setSeconds(new Date().getSeconds() + 5);
      const format = moment(newDate).format('ss mm HH DD MMM dddd')
      console.log(format.replace(0, ''))
      cron.schedule(format.replace(0, '').toString(), async () => {
        await notify(cond)
      });
      res.status(200).json({
        success: true,

      });

      // });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message: e.message,
      });
    }
  },

  deleteAccount: async (req, res) => {
    try {
      await User.findByIdAndDelete(req.user.id).lean();
      return response.ok(res, { message: 'your account deleted successfully' });
    } catch (error) {
      return response.error(res, error);
    }
  },

  webhooks: async (req, res) => {
    try {
      console.log(req.query)
      let mode = req.query["hub.mode"]
      let challenge = req.query["hub.challenge"]
      let token = req.query["hub.verify_token"]
      let mytoken = "myDiverXApp"
      if (mode && token) {
        if (mode === 'subscribe' && token === mytoken) {
          return response.ok(res, challenge);
        } else {
          return response.forbidden(res);
        }
      }
    } catch (error) {
      return response.error(res, error);
    }
  },
  convertImageUrlToBase64 :async(req,res)=> {
    try {
        const url2 = new URL(req.body.keys);
          const objectKey = url2.pathname.substring(1);
          console.log('======>',objectKey)
     const url = await getBase64Image(objectKey);
     return response.ok(res, url);
    } catch (error) {
     res.status(500).send(error);
        console.error("Error converting image URL to Base64:", error);
        throw error;
    }
  }
};
