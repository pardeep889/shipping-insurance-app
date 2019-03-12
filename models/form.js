const mongoose =require('mongoose');

const schema = mongoose.Schema;

const formSchema = new schema({
    orderId: {
        type:String
    },
    email:{
        type: String
    },
    name:{
        type:String
    },
    lname: {
        type:String
    },
    address: {
        type:String
    },
    city: {
        type:String
    },
    state: {
        type:String
    },
    country: {
        type:String
    },
    ZipCode: {
        type:String
    },
    claimType: {
        type:String
    },
    tracking: {
        type:String
    },
    imagePath: {
        type: String
    },
    policeNumber: {
        type: String
    }
});

module.exports = Form = mongoose.model('Form',formSchema);