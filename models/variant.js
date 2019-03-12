const mongoose =require('mongoose');

const schema = mongoose.Schema;

const variantSchema = new schema({
    userIdentity:{
        type:String
    },
    variantID:{
        type: String
    }
});

module.exports = Variant = mongoose.model('Variant',variantSchema);