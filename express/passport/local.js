const localStratagy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const User = mongoose.model("User");
const MasterDiver = mongoose.model("MasterDiver");
module.exports = new localStratagy(
  {
    usernameField: "email",
    passwordField: "password",
  },
  async (username, password, callback) => {
    try {
      console.log(username, password)
      let usernamee = username.split('/')[0]
      let types = username.split('/')[1]
      console.log(usernamee, password)
      let user={}
      if(types === 'MASTER'){
         user = await MasterDiver.findOne({
          $or: [
            { username: usernamee.toLowerCase() },
            { email: usernamee.toLowerCase() },
          ],
        });
      }else{
         user = await User.findOne({
          $or: [
            { username: usernamee.toLowerCase() },
            { email: usernamee.toLowerCase() },
          ],
        });
      }
    
      if (user) {
        if (!user.isValidPassword(password)) {
          return callback(null, false, { message: "Password is Incorrect." });
        }
      } else {
        return callback(null, false, { message: "User does not exist." });
      }
      return callback(null, user, { message: "Successfully LoggedIn." });
    } catch (error) {
      return callback(error, false, { message: "Something Went Wrong." });
    }
  }
);
