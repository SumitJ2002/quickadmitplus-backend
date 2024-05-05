const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const adminSchema = new mongoose.Schema({
    name:{
        type: String,
        required:true
    },
    email:{
        type: String,
        required:true
    },
    password: {
        type: String,
        required:true
    },
    tokens : [
        {
            token : {
                type: String,
                required:true
            }
        }
    ]
})
adminSchema.methods.generateAuthToken = async function() {
    try {
        let token = jwt.sign({_id:this._id},process.env.SECRET_KEY);
        this.tokens = this.tokens.concat({token:token});
        await this.save();
        return token;
    }
    catch(err) {
        console.log(err);
    }
}
const User = mongoose.model('ADMIN', adminSchema);
module.exports = User