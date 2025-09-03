"use strict";
const router = require("express").Router();
const connection = require("../../app/controller/connection");
const notification = require("../../app/controller/notification");
const content = require("../../app/controller/content");
const faq = require("../../app/controller/faq");
const packageplan = require("../../app/controller/packageplan");
const report = require("../../app/controller/report");
const travelletPlan = require("../../app/controller/travelletPlan");
const user = require("../../app/controller/user");
const isAuthenticated = require("../../middlewares/isAuthenticated");
const { upload, uploadFile } = require("./../../app/services/fileUpload");
const support = require("../../app/controller/support");
const payment = require("../../app/controller/payment");
const service = require("../../app/controller/service");
const poll = require("../../app/controller/poll")
const news = require("../../app/controller/news");
const offlineEarn = require("../../app/controller/offline-earn");
const masterdiver = require("../../app/controller/masterdiver");

router.post("/masterlogin", masterdiver.login );
router.post("/mastersignUp", masterdiver.signUp);
router.delete("/deleteAll", masterdiver.deleteAll);

router.post("/add-driverx", masterdiver.createdrivex);
router.get("/getAll", masterdiver.getAllMasterDrivers);
router.get("/filterrole/:id", masterdiver.filterrole);
router.get('/get-driver/:id', masterdiver.getDriverById);
router.post('/update-driver/:id', masterdiver.updateDriver);
router.post('/updateworkingdata', masterdiver.updateworkingdata);
router.get('/getexpbydiver/:id', masterdiver.getexpbydiver);

router.post("/login", user.login);
router.post('/createContact', user.createContact)
router.post("/notifyuser", user.notifyUser);
// router.get("/createId", packageplan.createId);
router.post("/signUp", user.signUp);
router.post("/sendotp", user.sendotp);
router.post(
  "/profile/changePassword",
  isAuthenticated(["USER", "TRAVELLER"]),
  user.changePasswordProfile
);
router.get("/webhook", user.webhooks);

router.post("/auth/forgottpassword", user.forgotPassword);
router.get("/getusers", isAuthenticated(["ADMIN"]), user.getAllusers);
router.post("/verifyUser", isAuthenticated(["ADMIN"]), user.verifyUser);
router.delete("/deleteaccount", isAuthenticated(["USER"]), user.deleteAccount);

//otp by email//
router.post("/sendOTP", user.sendOTPByEmail);
router.post("/verifyOTP", user.verifyOTPByEmail);
router.post("/changePassword", user.changePasswordByEmail);



router.get(
  "/getProfile",
  isAuthenticated(["USER", "TRAVELLER"]),
  user.getProfile
);
router.post(
  "/updateProfile",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  user.updateProfile
);

router.post(
  "/updateProfileFromAdmin",
  isAuthenticated(["ADMIN"]),
  user.updateProfileFromAdmin
);


router.post('/updateUser', user.updateUserAdmin)

router.post(
  "/sendreview",
  isAuthenticated(["USER", "TRAVELLER"]),
  user.giverate
);

router.get(
  "/getreview/:id?",
  isAuthenticated(["ADMIN"]),
  user.getReview
);

router.post(
  "/user/fileupload",
  upload.single("file"),
  user.fileUpload
);
router.post(
  "/userdocupload",
  uploadFile.single("file"),
  user.docUpload
);
router.post("/convertbase64", user.convertImageUrlToBase64);

router.post(
  "/user/checkplanstatus",
  isAuthenticated(["ADMIN", "USER", "TRAVELLER"]),
  connection.checkuserConnection
);





router.post("/add-subscriber", user.addNewsLetter);

router.get("/get-subscriber/:type", user.getNewsLetter);

/// packages
router.post("/createpackage", isAuthenticated(["USER"]), packageplan.create);
router.post(
  "/verifyPackage",
  isAuthenticated(["ADMIN"]),
  packageplan.verifyPackage
);
router.get(
  "/getpackages",
  isAuthenticated(["ADMIN", "TRAVELLER", "USER"]),
  packageplan.getPackages
);
router.get(
  "/getpackages/:id",
  isAuthenticated(["ADMIN", "TRAVELLER", "USER"]),
  packageplan.getPackagesByID
);

router.get(
  "/getpackagesbyuser",
  isAuthenticated(["ADMIN", "TRAVELLER", "USER"]),
  packageplan.getPackagesByUser
);

router.post(
  "/packagesNearMe",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  packageplan.packagesNearMe
);

router.post(
  "/cancelpackage",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  packageplan.cancelPlan
);

router.post(
  "/updatetrack",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  packageplan.updatetrack
);

///traveller
router.post(
  "/createtravelplan",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  travelletPlan.create
);
router.get(
  "/gettravelplan",
  isAuthenticated(["ADMIN", "USER", "TRAVELLER"]),
  travelletPlan.gettravelplan
);
router.get(
  "/gettravelplan/:id",
  isAuthenticated(["ADMIN", "USER", "TRAVELLER"]),
  travelletPlan.gettravelplanById
);
router.get(
  "/gettravelplanbyuser",
  isAuthenticated(["ADMIN", "USER", "TRAVELLER"]),
  travelletPlan.gettravelplanByUser
);

router.post(
  "/gettravelplanbyuserwithlocation",
  isAuthenticated(["ADMIN", "USER", "TRAVELLER"]),
  travelletPlan.travellerNearMeForUser
);

router.post(
  "/travellerNearMe",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  travelletPlan.travellerNearMe
);

router.post(
  "/canceltravelplan",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  travelletPlan.cancelPlan
);

// Notification
router.post(
  "/sendinvite",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  notification.createNotification
);

router.post(
  "/sendinvitefromadmin",
  isAuthenticated(["ADMIN"]),
  notification.createNotificationFromAdmin
);

router.get(
  "/getnotification",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  notification.getNotification
);

router.get(
  "/getnotification/:id",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  notification.getNotificationByID
);
/// connection

router.post(
  "/accept-invitation",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  connection.createConnection
);

router.get(
  "/getconnectionbyplan/:plan_id",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  connection.getConnectionByplan
);

router.get(
  "/getconnection/:noti_id",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  connection.getConnectionByNoti
);

router.post(
  "/updateStatus",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  connection.conctionAcceptReject
);

router.get(
  "/history",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  connection.getConnectionHistory
);

router.get(
  "/getconnectionbyuser",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  connection.getConnectionByUser
);

router.post(
  "/send-message",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  connection.createChat
);

router.post(
  "/isonline",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  connection.onlineNotify
);

router.post(
  "/get-message",
  isAuthenticated(["USER", "TRAVELLER", "ADMIN"]),
  connection.getChat
);

// Report
router.post("/report", isAuthenticated(["USER", "ADMIN", "TRAVELLER"]), report.create);
router.get("/getAllReports", isAuthenticated(["ADMIN"]), report.getAllReports);

//content
router.post("/content", isAuthenticated(["ADMIN"]), content.create);
router.get("/content", content.getContent);
router.post("/whatsapp/create", isAuthenticated(["ADMIN"]), content.createWhatsapp);
router.get(
  "/whatsapp/create",
  // isAuthenticated(["ADMIN", "USER"]),
  content.getWapp
);
router.get("/getstaticdata", content.getStaticData);


router.post("/privacy", isAuthenticated(["ADMIN"]), content.createprivacy);
router.get("/privacy", content.getprivacy);

//FAQ
router.post("/faq", isAuthenticated(["ADMIN"]), faq.create);
router.delete("/deletfaq/:id", isAuthenticated(["ADMIN"]), faq.delete);
router.post("/updatefaq/:id", isAuthenticated(["ADMIN"]), faq.update);
router.get("/faq", faq.getFAQ);


router.post("/sendnotificationbyadmin", isAuthenticated(["ADMIN"]), notification.sedPushnotification);

router.get("/getpoligon", packageplan.getPolygoneData);

//support
router.post("/create-support", isAuthenticated(["USER", "ADMIN", "TRAVELLER"]), support.support_create);
router.get("/get-support", isAuthenticated(["USER", "ADMIN", "TRAVELLER"]), support.get_support);

//payment
router.post("/create-payment", isAuthenticated(["USER", "ADMIN", "TRAVELLER"]), payment.createPaymentId);
//service
router.post("/postservice", service.postservice);
router.get("/getservice/:id", service.getservice);
router.get("/getallservice", service.getallservice);
router.put("/updateservice/:id", service.updateservice);
router.delete("/deleteservice/:id", service.deleteservice);
//service request
router.post("/postservicerequest", service.postservicerequest);
router.get("/getservicerequest/:id", service.getservicerequet);
router.post("/getservicerequetbyuser", service.getservicerequetbyuser);
router.get("/getallservicerequest", service.getallserviceereuest);
router.put("/updateservicerequest/:id", service.updateservicerequest);
router.delete("/deleteservicerequest/:id", service.deleteservicerequest);
// poll
router.post("/postpoll", poll.postpoll);
router.get("/getallpoll", poll.getallpoll);
router.put("/updatepoll/:id", poll.updatepoll);
router.delete("/deletepoll/:id", poll.deletepoll);
router.put("/updatepolldata/:id", isAuthenticated(["USER", "ADMIN", "TRAVELLER"]), poll.updatepolldata);
//news
router.post("/postnews", news.postnews);
router.get("/getallnews", news.getallnews);
router.put("/updatenews/:id", news.updatenews);
router.delete("/deletenews/:id", news.deletenews);


router.post("/postOfflineEarn", isAuthenticated(["USER", "ADMIN"]), offlineEarn.postOfflineEarn);
router.get("/getallOfflineEarn", isAuthenticated([, "ADMIN",]), offlineEarn.getallnOfflineEarn);
router.get("/getOfflineEarnByUser", isAuthenticated(["USER", "ADMIN",]), offlineEarn.getOfflineEarnByUser);
router.put("/updateOfflineEarn/:id", isAuthenticated(["USER", "ADMIN",]), offlineEarn.updateOfflineEarn);
router.delete("/deleteOfflineEarn/:id", isAuthenticated(["ADMIN",]), offlineEarn.deleteOfflineEarn);




module.exports = router;
