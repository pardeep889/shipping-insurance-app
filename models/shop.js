const mongoose =require('mongoose');

const schema = mongoose.Schema;

const shopSchema = new schema({
    shopDomain:{
        type:String,
        unique:true,
        index:true,
        require:true
    },
    shopToken:{
        type:String,
        unique:true,
        index:true,
        require:true
    },
    productVariant: {
        type: String
    },
    product_id: {
        type: String,        
        unique: true,
        index: true,
        require: true
    }
});

module.exports = Shop = mongoose.model('Shop',shopSchema);