const userHelper = require("./../helper/user");
const response = require("./../responses");
const passport = require("passport");
const jwtService = require("./../services/jwtService");
const mailNotification = require("./../services/mailNotification");
const mongoose = require("mongoose");

const MasterDiver = mongoose.model("MasterDiver");
const Idcount = mongoose.model("IdcountSchema");
const Experince = mongoose.model("Experince");


module.exports = {
  signUp: async (req, res) => {
    try {
      const payload = req.body;
      // let user = await MasterDiver.find({
      //   phone: payload.phone,
      // });

      let users = await MasterDiver.findOne({
        email: payload.email.toLowerCase(),
      });

      if (users) {
        return res.status(404).json({
          success: false,
          message: "Email ID already exists.",
        });
      }

      // if (!user.length) {
      let id = await Idcount.find()
      payload.userID = id[0].userID
      let user = new MasterDiver({
        name: payload.fullName,
        email: payload.email.toLowerCase(),
        password: payload.password,
        type: payload.type,
        badgeNo: payload.badgeNo
        // phone: payload.phone,
        // idproof: payload.idproof,
        // profile: payload.profile,
        // code: payload.code,
      });
      user.password = user.encryptPassword(payload.password);
      user.userID = id[0]?.diverID || 1
      await user.save();
      // if(id[0]?.diverID ){
      //   user.userID = id[0]?.diverID || 1;
      // }else{
      // user.userID = 1
      // }

      // await user.save();
      const userID = Number(id[0].diverID) + 1
      await Idcount.updateMany({}, { diverID: userID })
      res.status(200).json({ success: true, phone: user.phone });
      // } else {
      //   res.status(404).json({
      //     success: false,
      //     message: "Phone number already exists.",
      //   });
      // }


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
  login: (req, res) => {
    console.log(req.body);
    req.body.email = req.body.email + '/MASTER'
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
      // await Device.updateOne(
      //   { device_token: req.body.device_token },
      //   { $set: { player_id: req.body.player_id, user: user._id } },
      //   { upsert: true }
      // );
      const data = {
        token,
        ...user._doc,
      };
      delete data.password;
      return response.ok(res, data);
    })(req, res);
  },
  deleteAll: async (req, res) => {
    try {
      await MasterDiver.deleteMany({});
      res.status(200).json({ success: true, message: 'Deleted Succssessfully' });
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

  createdrivex: async (req, res) => {
    try {
      const idCount = await Idcount.find({});

      if (idCount.length === 0) {
        return res.status(400).json({ message: "No ID count found." });
      }

      const payload = req.body;
      let id = await Idcount.find();

      // Set masterdriverID from Idcount document
      payload.masterdriverID = id[0]?.diverID || 1;
      // Create new Master Diver
      let newMasterDiver = new MasterDiver(payload);
      // Encrypt the password before saving
      newMasterDiver.password = newMasterDiver.encryptPassword(payload.badgeNo);
      // Save newMasterDiver

      ///mail shoot
      // mailNotification.newAccountNotification({ email: payload.email,username:payload.email,tempPassword:payload.badgeNo,name:payload.name });

      await newMasterDiver.save();

      // Increment masterdriverID and update Idcount
      const newMasterdriverID = Number(id[0]?.diverID || 1) + 1;
      await Idcount.updateMany({}, { diverID: newMasterdriverID });

      // Send response with the created Master Diver
      return res.status(201).json({
        message: "Master Diver created successfully",
        data: newMasterDiver
      });

    } catch (error) {
      console.error("Error creating Master Diver:", error);

      // Specific error handling based on error type
      if (error.name === 'ValidationError') {
        return res.status(400).json({
          message: "Validation error",
          error: error.message
        });
      }

      if (error.code === 11000) {
        return res.status(400).json({
          message: "Duplicate entry found",
          error: "A record with these details already exists"
        });
      }

      return res.status(500).json({
        message: "Error creating user",
        error: error.message
      });
    }
  },

  filterrole: async (req, res) => {
    try {
      let notifications = await MasterDiver.find({ role: req.params.id })
      return response.ok(res, notifications);
    } catch (error) {
      return response.error(res, error);
    }
  },

  getAllMasterDrivers: async (req, res) => {
    try {

      const drivers = await MasterDiver.find()

      return res.status(200).json({
        success: true,
        data: drivers,
      });
    } catch (error) {
      console.error("Error fetching master drivers:", error);
      return res.status(500).json({
        success: false,
        message: "Error fetching master drivers",
        error: error.message
      });
    }
  },

  getDriverById: async (req, res) => {
    try {
      const { id } = req.params;

      if (!id) {
        return res.status(400).json({
          status: false,
          message: "Driver ID is required"
        });
      }

      const driver = await MasterDiver.findById(id);

      if (!driver) {
        return res.status(404).json({
          status: false,
          message: "Driver not found"
        });
      }


      // const responseData = {
      //   name: driver.name || '',
      //   role: driver.role || '',
      //   badgeNo: driver.badgeNo || '',
      //   email: driver.email || '',
      //   contact: driver.contact || '',
      //   location: driver.location || '',
      //   vactionDays: driver.vactionDays || '',
      //   emiratesIdExpiry: driver.emiratesIdExpiry || '',
      //   passportExpiry: driver.passportExpiry || '',
      //   VacationStartDate: driver.VacationStartDate || '',
      //   ReturnDate: driver.ReturnDate || '',
      //   profilePhoto: driver.profilePhoto || '',
      //   Visa: driver.Visa || '',
      //   CV: driver.CV || '',
      //   DOB: driver.DOB,
      //   Age:driver.Age,
      //   Nationality:driver.Nationality,
      //   PassportNo:driver.PassportNo,
      //   OPTIMAPassExpiry:driver.OPTIMAPassExpiry,
      //   DivingTicket: driver.DivingTicket || '',
      //   Passport: driver.Passport || '',
      //   BOSIET: driver.BOSIET || '',
      //   DivingCertificate: driver.DivingCertificate || '',
      //   DIVEMEDICAL: driver.DIVEMEDICAL || '',
      //   BOATOPERATOR: driver.BOATOPERATOR || '',
      //   H2S: driver.H2S || '',
      //   OPTIMAPASS: driver.OPTIMAPASS || '',

      //   // Additional documents
      //   Alldocuments: driver.Alldocuments || [], 
      //   DivingQualification:driver.DivingQualification || [],
      //   BositDetails:driver.BositDetails,
      //   H2SDetails:driver.H2SDetails,
      //   DivingMedical:driver.DivingMedical,

      // };

      return res.status(200).json({
        status: true,
        data: driver,
        message: "Driver details retrieved successfully"
      });

    } catch (error) {
      console.error("Error in getDriverById:", error);
      return res.status(500).json({
        status: false,
        message: error.message || "Error fetching driver details"
      });
    }
  },

  updateDriver: async (req, res) => {
    try {
      const id = req.params.id;
      const updateData = req.body;

      const existingDriver = await MasterDiver.findById(id);
      if (!existingDriver) {
        return res.status(404).json({
          status: false,
          message: 'Driver not found'
        });
      }


      const updatedDriver = await MasterDiver.findByIdAndUpdate(
        id, updateData, {
        new: true,
        upsert: true,
      }
        // {
        //     name: updateData.name,
        //     role: updateData.role,
        //     badgeNo: updateData.badgeNo,
        //     email: updateData.email,
        //     WorkSitecontact: updateData.WorkSitecontact,
        //     Homecontact:updateData.Homecontact,
        //     location: updateData.location,
        //     vactionDays: updateData.vactionDays,
        //     emiratesIdExpiry: updateData.emiratesIdExpiry,
        //     passportExpiry: updateData.passportExpiry,
        //     VacationStartDate: updateData.VacationStartDate,
        //     ReturnDate: updateData.ReturnDate,
        //     DOB: updateData.DOB,
        //     Age:updateData.Age,
        //     Nationality:updateData.Nationality,
        //     PassportNo:updateData.PassportNo,
        //     VantageNo:updateData.VantageNo,
        //     OPTIMAPassExpiry:updateData.OPTIMAPassExpiry,
        //     profilePhoto: updateData.profilePhoto,
        //     SeamansBook:updateData.SeamansBook,
        //     SeamansbookexpiryDate:updateData.SeamansbookexpiryDate,
        //     SupervisorTicket: updateData.SupervisorTicket, 
        //     SupervisorTicketexpiryDate: updateData.SupervisorTicketexpiryDate,
        //     DivingTicketexpirydate:updateData.DivingTicketexpirydate,
        //     Cicpapassexpirydate: updateData.Cicpapassexpirydate,
        //     Offshoremedicalexpirydate: updateData.Offshoremedicalexpirydate,
        //     BoatoperatorCertexpiry:updateData.BoatoperatorCertexpiry,
        //     FRCexpirydate:updateData.FRCexpirydate,
        //     RiggingAndSlingingExpiryDate:updateData.RiggingAndSlingingExpiryDate,
        //     DMTcertificateExpiryDate:updateData.DMTcertificateExpiryDate,
        //     // Document fields
        //     Visa: updateData.Visa,
        //     CV: updateData.CV,
        //     DivingTicket: updateData.DivingTicket,
        //     Passport: updateData.Passport,
        //     BOSIET: updateData.BOSIET,
        //     DivingCertificate: updateData.DivingCertificate,
        //     DIVEMEDICAL: updateData.DIVEMEDICAL,
        //     BOATOPERATOR: updateData.BOATOPERATOR,
        //     H2S: updateData.H2S,
        //     OPTIMAPASS: updateData.OPTIMAPASS,
        //     EmiratesId:updateData.EmiratesId,
        //     FRC:updateData.FRC,
        //     RiggingAndSlinging:updateData.RiggingAndSlinging,
        //     SupervisorTicketupload:updateData.SupervisorTicketupload,
        //     DMTcertificate:updateData.DMTcertificate,
        //     Seamansbookupload:updateData.Seamansbookupload,
        //     // Additional documents
        //     Alldocuments: updateData.Alldocuments ,
        //     AllExperience:updateData.AllExperience,
        //     DivingQualification:updateData.DivingQualification,
        //     BositDetails:updateData.BositDetails,
        //     H2SDetails:updateData.H2SDetails,
        //     DivingMedical:updateData.DivingMedical,
        // },

      );

      return res.status(200).json({
        status: true,
        message: 'Driver updated successfully',
        data: updatedDriver
      });

    } catch (error) {
      console.error('Error in updateDriver:', error);
      return res.status(500).json({
        status: false,
        message: error.message || 'Error updating driver'
      });
    }
  },
  updateworkingdata: async (req, res) => {
    try {
        const diverdata = await MasterDiver.findById(req.body.id);
        let vacationdate = new Date(req.body.vacationdate);

        if (req.body.workingtype === 'working') {
            // When starting work, create a new working slot
            diverdata.iscurrentlyworking = true;
            diverdata.workigdate = req.body.workigdate; 
            diverdata.startJobSupportingDoc = req.body.startJobSupportingDoc;

            diverdata.workingdays.push({
                startworkingdate: new Date(diverdata.workigdate),
                endworkingdate: null,
            });
        }

        if (req.body.workingtype === 'vacation') {
            diverdata.iscurrentlyworking = false;
            const endWorkingDate = new Date(vacationdate);
            endWorkingDate.setDate(endWorkingDate.getDate() - 1);

            // const workingdays = diverdata.workingdays;
            // const lastWorkingSlot = [...workingdays].reverse().find(slot => slot.endworkingdate === null);
            
            // if (lastWorkingSlot) {
            //     lastWorkingSlot.startworkingdate=diverdata.workigdate,
            //     lastWorkingSlot.endworkingdate = endWorkingDate;
            // } else {
            //     console.log("No existing working slot found to update for vacation.");
            // }
            diverdata.workingdays[diverdata.workingdays.length - 1].endworkingdate = endWorkingDate

            diverdata.vacationdate = vacationdate;

            let exp = new Experince({
                contractor: req.body.contractor,
                client: req.body.client,
                position: req.body.position,
                barge: req.body.barge,
                task: req.body.task,
                startJobSupportingDoc: diverdata.startJobSupportingDoc,
                endJobSupportingDoc: req.body.endJobSupportingDoc,
                workigstartdate: diverdata.workigdate,
                workigenddate: endWorkingDate,
                diver: req.body.id
            });
            await exp.save();
        }

        await diverdata.save();
        console.log("=>", diverdata);
        return response.ok(res, { message: 'Status updated' });
    } catch (error) {
        console.error('Error in updateworkingdata:', error);
        return response.error(res, error);
    }
},
  getexpbydiver: async (req, res) => {
    try {
      console.log("Request received for diver ID:", req.params.id);
      const data = await Experince.find({ diver: req.params.id }).sort({ createdAt: -1 });
      if (!data || data.length === 0) {
        return response.error(res, { message: "No experience found for this diver." });
      }
      return response.ok(res, data);
    } catch (error) {
      return response.error(res, error);
    }
  }
}
