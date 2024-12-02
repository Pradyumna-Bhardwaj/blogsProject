const {Schema, model} = require("mongoose");
const {createHmac, randomBytes} = require('crypto');
const { createTokenForUser } = require("../services/authentication");

const userSchema = new Schema({
    fullName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    salt: {
        type: String,
    },
    password: {
        type: String,
    },
    profileImageURL: {
        type: String,
        default: "/images/defaultUserAvatar.png",
    },
    role: {
        type: String,
        enum: ["USER", "ADMIN"],
        default: "USER",
    },
},
{timestamps: true}
);

//hashing password
userSchema.pre("save", function (next){
    const user = this;

    if(!user.isModified("password")) return next();

    // if (!user.password || typeof user.password !== "string") {
    //     return next(new Error("Password must be provided and should be a string"));
    // }

    const salt = randomBytes(16).toString();
    //console.log("salt - ", typeof(salt))
    const hashedPassword = createHmac("sha256", salt)
        .update(user.password)
        .digest("hex");

    this.salt = salt;
    this.password = hashedPassword;
    
    next();
});

userSchema.static(
    "matchPasswordAndGenerateToken",
    async function (email, password) {
      const user = await this.findOne({ email });
      if (!user) throw new Error("User not found!");
      
      const salt = user.salt;
      const hashedPassword = user.password;
  
      const userProvidedHash = createHmac("sha256", salt)
        .update(password)
        .digest("hex");
  
      if (hashedPassword !== userProvidedHash)
        throw new Error("Incorrect Password");
  
      const token = createTokenForUser(user);
      return token;
    }
  );  

const User = model('user', userSchema);

module.exports = User;