const dotenv = require('dotenv').config();
const express = require('express');
const app = express();

const crypto = require('crypto');
const nonce = require('nonce')();
const querystring = require('querystring');
const request = require('request-promise');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const getRawBody = require('raw-body');
var nodemailer = require('nodemailer');

const apiKey = process.env.SHOPIFY_API_KEY;
const apiSecret = process.env.SHOPIFY_API_SECRET;
const scopes = 'read_products,read_customers,write_themes,write_products,write_inventory,read_orders,read_themes,read_draft_orders,read_fulfillments,write_customers';
const forwardingAddress = "https://1b481740.ngrok.io"; // Replace this with your HTTPS Forwarding address

const Shop = require('./models/shop');
const Form = require('./models/form');
const Variant = require('./models/variant');

const Shopify = require('shopify-api-node');

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));

var fs = require('fs');
var readline = require('readline');
var stream = require('stream');

const multer = require('multer');
// var upload = multer({dest: './uploads/reports'});
const multerConf ={
   storage: multer.diskStorage({
    destination: function(req,file,next){
      next(null,'./uploads/reports');
    },
    filename: function (req, file, next) {
      const ext = file.mimetype.split('/')[1];
      next(null,file.fieldname+'-'+Date.now()+'.'+ext);
    }
  }),
  fileFilter: function(req,file,next){
    if(!file){
      next();
    }
    const image = file.mimetype.startsWith('image/');
    if(image){
      next(null,true);
    }else{
      next({message: 'File type not supported'}, false);
    }
  }
}

//connection to MongoDB mongodb://pardeepprotolabz:Protolabz123@ds161335.mlab.com:61335/insurance
mongoose.connect("mongodb://localhost/insurance",{useNewUrlParser: true})
.then(()=>{
  console.log("Mongo DB is Connected"); 
})
.catch(err => console.log(err));

app.get('/', (req, res) => {
  res.writeHead(200,{'content-type':'image/png'});
  fs.createReadStream('./public/images/logo_image.png').pipe(res);
});

app.get('/shopify', (req, res) => {
    const shop = req.query.shop;
    if (shop) {
      const state = nonce();
      const redirectUri = forwardingAddress + '/shopify/callback';
      const installUrl = 'https://' + shop +
        '/admin/oauth/authorize?client_id=' + apiKey +
        '&scope=' + scopes +
        '&state=' + state +
        '&redirect_uri=' + redirectUri;

      res.cookie('state', state);
      res.redirect(installUrl);
    } else {
      return res.status(400).send('Missing shop parameter. Please add ?shop=your-development-shop.myshopify.com to your request');
    }
});

app.get('/shopify/callback', (req, res) => {
    const { shop, hmac, code, state } = req.query;
    console.log(hmac);
    const map = Object.assign({}, req.query);
    delete map['signature'];
    delete map['hmac'];
    const message = querystring.stringify(map);
    const providedHmac = Buffer.from(hmac, 'utf-8');
    var accessToken;
    const generatedHash = Buffer.from(
        crypto
        .createHmac('sha256', apiSecret)
        .update(message)
        .digest('hex'),
        'utf-8'
        );
    let hashEquals = false;
    try {
        hashEquals = crypto.timingSafeEqual(generatedHash, providedHmac)
    } catch (e) {
        hashEquals = false;
    };
    if (!hashEquals) {
        return res.status(400).send('HMAC validation failed');
    }
        const accessTokenRequestUrl = 'https://' + shop + '/admin/oauth/access_token';
        const accessTokenPayload = {
            client_id: apiKey,
            client_secret: apiSecret,
            code,
        };
        request.post(accessTokenRequestUrl, { json: accessTokenPayload })
        .then((accessTokenResponse) => {
        accessToken = accessTokenResponse.access_token;
        console.log("Got an access token, let's do something with it pardeep: "+accessToken);
        let url = "https://"+shop+'/admin/webhooks.json';       
        let options = {
            method: 'POST',
            uri: url,
            headers: {
              'X-Shopify-Access-Token': accessToken,
              'Host':shop,
              'Content-type': 'application/json'
            },
            form: {
              "webhook":{
                "topic": "orders\/paid",
                "address":"https:\/\/1b481740.ngrok.io/payment",
                "format":"json"                 
            },
            data: {
              
            }
            }
        };
        request(options)
        .then(function (parsedBody) {
          var data = JSON.parse(parsedBody);
          console.log(data);        
          console.log('created');      
            let urlShopify = `https://${shop}/admin/products.json`; // create customer
            let optionsShopify = {
            method: 'POST',
            uri: urlShopify,
            headers: {
                'X-Shopify-Access-Token': accessToken,
                'Host':shop,
                'Content-type': 'application/json'
              },
            form: {             
                    "product": {
                        "title": "shipping insurance",
                        "body_html": "<strong>Good snowboard!</strong>",
                        "vendor": "Burton",
                        "product_type": "Snowboard",
                        "tags": "Barnes & Noble, John's Fav, \"Big Air\"",
                        "variants": [
                          {
                            "price": "0.98",
                            "position": "1",
                            "inventory_management": null,
                            "grams": 0,
                            "taxable": false,
                            "weight": 0,
                            "weight_unit": "kg",
                            "inventory_quantity": 0,
                            "old_inventory_quantity": 0,
                            "requires_shipping": false,
                            "metafields": [
                              {
                                "key": "new",
                                "value": "newvalue",
                                "value_type": "string",
                                "namespace": "global"
                              }
                            ]
                          }                          
                        ]                	
                     
                    }               
                }
            };
            request(optionsShopify)
            .then(function (parsedBody) {
            var parseBody = JSON.parse(parsedBody);            
            console.log(parsedBody)
            Shop.findOneAndUpdate({'shopDomain': shop}, {'shopToken': accessToken ,'productVariant': parseBody.product.variants[0].id, 'product_id': parseBody.product.id}, {upsert: true})
            .then((doc) => {
              console.log('Shop Data is Updated',doc);
            })
            .catch((err)=> {
              console.log(err);
            });

            }).catch(err => {
                console.log(err);
            });
        })
        .catch(function (err) {
          console.log('webhook error');
          console.log(err);
        });
        })
        .catch((error) => {
        console.log(error);
        });
        let  sendData = {
          shop: shop
        };
        res.render(__dirname+'/views/installed', {sendData});
});

app.post('/payment', async (req,res)=>{
  const body = await getRawBody(req);
  const payment = JSON.parse(body.toString());
  var email  = payment.customer.email
  var itemsdump= payment.line_items;
  for(var i = 0; i < itemsdump.length; i++){
    console.log(itemsdump[i].product_id);
    if(itemsdump[i].title == 'shipping insurance'){
      Shop.findOne({"product_id": itemsdump[i].product_id}).then(shop => {
        const shopify = new Shopify({
          shopName: shop.shopDomain,
          accessToken: shop.shopToken
        });
        Variant.findOne({"userIdentity": itemsdump[i].title}).then(product => {
          if(product){
            // console.log(product.variantID);
            shopify.productVariant.delete(itemsdump[i].product_id, product.variantID);
            Variant.findOneAndDelete({"userIdentity": '103.41.27.137'}).then(product => {
                  console.log(product);
            }).catch(err => console.log(err));
          }else{
            console.log('product not found');
          }
        }).catch(err => console.log(err));
      }).catch(err => {console.log(err)}); 
      // var transporter = nodemailer.createTransport({
      //   service: 'gmail',
      //   auth: {
      //     user: 'pardeepprotolabz@gmail.com',
      //     pass: 'Protolabz#123'
      //   }
      // });      
      // var mailOptions = {
      //   from: 'pardeepprotolabz@gmail.com',
      //   to: 'pardeep889@hotmail.com',
      //   subject: `${itemsdump[i].title}`,
      //   text: `For all other questions regarding your order please contact at 
      //           Here is claim form link: https://1b481740.ngrok.io/form
      //           Thank you,	
      //           The Fortify Team`
      // };      
      // transporter.sendMail(mailOptions, function(error, info){
      //   if (error) {
      //     console.log(error);
      //   } else {
      //     console.log('Email sent: ' + info.response);
      //   }
      // });
      break;
    }
  }
    res.status(200).send('ok');
});

app.get('/store_cart',async (req,res) => {
  var shopToken;
     if(req.query.type == 'getVariant'){
        console.log('getting the Variant ID');
        Shop.findOne({'shopDomain':  req.query.shop}).then((doc) => {   
          if(doc){
            Variant.findOne({'userIdentity':  req.query.ip}).then((variant) => {
              if(variant){             
                res.json(variant.variantID);
              }
            }).catch(err => console.log(err));
          }        
        });
     }
     else if(req.query.type == 'installed'){   
      Shop.findOne({'shopDomain':  req.query.shop}).then((doc) => {
        const shopify = new Shopify({
         shopName: req.query.shop,
         accessToken: doc.shopToken
       });
          shopify.theme.list().then(data => {
          var id;
          for(var i=0;i < data.length; i++){
            if(data[i].role == 'main'){
              id = data[i].id;
            }
          } 
          var instream = fs.createReadStream('./inject.txt');
          var outstream = new stream;
          var rl = readline.createInterface(instream, outstream);    
          var textData='';
          rl.on('line', function(line) {            
            textData+= line;
          });
          rl.on('close', function() {
            const query = {
              key: 'sections/qualtry.liquid',
              value: textData
            };
            shopify.asset.update(id, query).then(data => {
              console.log(data);
              res.send('Everything is Ready !')
            }).catch(err => {
              console.log(err);
              res.send('Somthing Went Wrong Please Re-installed the App with proper instruction');
            });
          });
        }).catch(err => console.log(err));
     }).catch(err => console.log(err));             
    }else if(req.query.type == 'create_variant'){
      console.log(req.body)
      Shop.findOne({'shopDomain':  req.query.shop}).then((doc) => {      
        if(doc){
          console.log(doc);
          const shopify = new Shopify({
            shopName: doc.shopDomain,
            accessToken: doc.shopToken
          });
          var new_variant_data = {
                  "option1": `${req.query.ip}`,
                  "price": "2.00",
                  "position": "1",
                  "inventory_management": null,
                  "grams": 0,
                  "taxable": false,
                  "weight": 0,
                  "weight_unit": "kg",
                  "inventory_quantity": 0,
                  "old_inventory_quantity": 0,
                  "requires_shipping": false
          }
          Variant.findOne({"userIdentity": req.query.ip}).then(v => {
            if(v){
              console.log('variant found');
            }else{
              console.log('variant not found');
              shopify.productVariant.create(doc.product_id, new_variant_data).then(data => {
                Variant.findOneAndUpdate({'userIdentity': req.query.ip},{'variantID': data.id}, {upsert: true}).then(variant => {
                  if(variant){
                    console.log(variant);
                  }else{
                    console.log('alreay variant is present');
                    res.send('alreay variant is present');
                  }
                }).catch(err => console.log(err));
              }).catch(err => console.log(err));
            }
          }).catch(err => console.log(err));
        }
      }).catch(err => console.log(err));
      res.json({message: 'ok'});
    }
     else if(req.query.type == 'update_price'){
      Variant.findOne({'userIdentity':  req.query.ip}).then((variant) => {
        Shop.findOne({'shopDomain':  req.query.shop}).then((doc) => {
          const shopify = new Shopify({
            shopName: req.query.shop,
            accessToken: doc.shopToken
          });
          let data = {      
            "price": `${req.query.total_amount}`               
          };  
          console.log(req.query.total_amount/10);
          shopify.productVariant.update(variant.variantID,data).then(data=> {
            res.json(data.variants[0].id);
          }).catch(err => console.log(err));   
          // shopify.theme.get('33531134051').then(doc => console.log(doc)).catch(err => console.log(err))
         }).catch(err => console.log(err));   
        })
     } else{
       res.send('meet me at 367');
     }
}); 

app.get('/form', (req,res) => {
  res.render(__dirname+'/views/');
});
// app.get('/test', (req,res) => {
//   res.send('Testing');
// });
app.post('/form', multer(multerConf).single('upload'), (req,res) => {
  var path; 
  if(req.hasOwnProperty('file')){
    path = req.file.path;
    console.log(req.file);
  }
  else{ 
    path = '';     
  }
  Form.create({ 
      orderId: req.body.orderId,
      email: req.body.email,
      name: req.body.name,     
      lname:req.body.lname,
      address:req.body.address,
      city:req.body.city,
      state:req.body.state,
      country:req.body.country,
      Zipcode:req.body.Zipcode,
      calimType:req.body.claimType,
      tracking:req.body.tracking,
      imagePath:path,
      policeNumber: req.body.police
    }, function (err, small) {
      if (err) return handleError(err);
    });
  res.send('ok')
});
app.listen( process.env.PORT || 3000, () => {
  var now = new Date();
  console.log('[ Example app listening on port 3000! ] '+ now);
});
