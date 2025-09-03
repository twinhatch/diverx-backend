const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const masterdriverSchema = new mongoose.Schema(
  {
    masterdriverID: {
      type: String,
    },
    profilePhoto: {
      type: String,
    },
    name: {
      type: String,
    },
    role: {
      type: String,
    },
    type: {
      type: String,
      enum: ["ADMIN", "HR", "DIVER"],
      default: "DIVER",
    },
    DOB: {
      type: Date,
    },
    Nationality: {
      type: String,
    },
    badgeNo: {
      type: Number,
      required: true,
      unique: true,
    },
    location: {
      type: String,
    },

    password: {
      type: String,
    },
    emiratesIdExpiry: {
      type: Date,
    },
    passportExpiry: {
      type: Date,
    },
    PassportNo: {
      type: String,
    },
    VacationStartDate: {
      type: Date,
    },
    ReturnDate: {
      type: Date,
    },
    email: {
      type: String,
      // trim: true,
      // unique: true, // Uncomment if needed
    },
    Homecontact: {
      type: String,
      // trim: true,
      // unique: true, // Uncomment if needed
    },
    WorkSitecontact: {
      type: String,
      // trim: true,
      // unique: true, // Uncomment if needed
    },

    Visa: {
      type: String,
    },
    CV: {
      type: String,
    },
    DivingTicket: {
      type: String,
    },
    Passport: {
      type: String,
    },
    BOSIET: {
      type: Object,
    },
    DivingCertificate: {
      type: String,
    },
    DIVEMEDICAL: {
      type: String,
    },
    BOATOPERATOR: {
      type: String,
    },
    H2S: {
      type: Object,
    },

    OPTIMAPassExpiry: {
      type: Date,
    },
    Alldocuments: {
      type: Object,
    },
    AllExperience: {
      type: Object,
    },
    DivingQualification: {
      type: Object,
    },
    DivingMedical: {
      type: Object,
    },
    H2SDetails: {
      type: Object,
    },
    BositDetails: {
      type: Object,
    },
    SeamansBook: {
      type: String,
    },
    SeamansbookexpiryDate: {
      type: Date,
    },
    SupervisorTicketNo: {
      type: String,
    },
    DiverTicketNo: {
      type: String
    },
    DMTTicketNo: {
      type: String
    },
    SupervisorTicketexpiryDate: {
      type: Date,
    },
    DivingTicketexpirydate: {
      type: Date,
    },
    Cicpapassexpirydate: {
      type: Date,
    },
    Offshoremedicalexpirydate: {
      type: Date,
    },
    EmiratesID: {
      type: String
    },
    FRC: {
      type: String
    },
    RiggingAndSlinging: {
      type: String
    },
    RiggingAndSlingingExpiryDate: {
      type: Date
    },
    FRCexpirydate: {
      type: Date
    },
    BoatoperatorCertexpiry: {
      type: Date
    },
    VantageNo: {
      type: String
    },
    SupervisorTicketupload: {
      type: String
    },
    DMTcertificate: {
      type: String
    },
    DMTcertificateExpiryDate: {
      type: String
    },
    Seamansbookupload: {
      type: String
    },
    startJobSupportingDoc: {
      type: String,
    },
    workingdays: [
      {
        startworkingdate: {
          type: Date
        },
        endworkingdate: {
          type: Date
        }
      }
    ],
    workigdate: {
      type: Date
    },
    vacationdate: {
      type: Date
    },
    iscurrentlyworking: {
      type: Boolean,
      default: false
    }, 
    isScannedandVerified: {
      type: String,
      enum: ["Yes", "No"],
      default: "Yes",
    },
    DivingQualificationType:{
      type:String,
    },
    DivingQualificationCardNo:{
      type:String,
    },
    DivingQualificationIssueDate:{
      type:Date,
    }
  },
  {
    timestamps: true,
  }
);

masterdriverSchema.set("toJSON", {
  getters: true,
  virtuals: false,
  transform: (doc, ret, options) => {
    delete ret.__v;
    return ret;
  },
});

// masterdriverSchema.methods.encryptPassword = function() {
//   this.password = bcrypt.hashSync(this.badgeNo.toString(), bcrypt.genSaltSync(10));
// };

masterdriverSchema.methods.encryptPassword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

masterdriverSchema.methods.isValidPassword = function isValidPassword(
  password
) {
  return bcrypt.compareSync(password, this.password);
};

const MasterDiver = mongoose.model("MasterDiver", masterdriverSchema);

module.exports = {
  MasterDiver,
};
