


  


$(document).ready(function() {



$('#shopify-section-cart-template > div > form > div > div > div > div:nth-child(1)').append('<br> <input type="checkbox" id= "checkIN" checked="checked" /> ' + "Add Shipping protection for"+'<span id = "shipprice"><span>' + '<br />'); 
//     var variant_id = 1517216137315;


  //$('#shopify-section-cart-template > div > form > div > div > div > div:nth-child(1)').append('<br> <input type="checkbox" id= "checkIN" checked="checked" /> ' + "Add Shipping protection for" + '<br />');
 jQuery.getJSON('/cart.js', function(cart) {    
   var price;
   console.log(cart);
   var total_price =(cart.total_price)/100;
   console.log(total_price);
   if(total_price > 500){
      price = ( total_price - 100 ) * 1.5;
      price= (price - total_price);
      price = "" + price + ".00";
      console.log(` price: ${price}`);
   }
   else{
     price = 90.8;
   }
   var variant_id = 13038143701091;
   var quantity  = 1;
   var found = 0;

   
   if(cart.items.length > 0) {
  
//        console.log(cart.items[i]);
     for(var i = 0; i < cart.items.length; i++){    
          if(cart.items[i].id == variant_id){    
           found = 1;
            
         
           var data = { "total_amount": price, "product_id": cart.items[i].id};
           $.ajax({
           type: "GET",
           data:data,
           url: "/apps/store_cart",
           success: function(data){
            console.log(data);
           }
          });
            console.log(cart.items[i].product_id);
            var price = cart.items[i].price/100;
            $('#shipprice').html(" Rs "+price+"");
               break;
            }
        } 
         if(!found && document.URL.indexOf("#")==-1){
           console.log("test varient id"+variant_id);
           console.log(variant_id);
           console.log(quantity);
                $.ajax({
                type: 'POST', 
                url: '/cart/add.js',
                dataType: 'json', 
                data: 'quantity=' + quantity + '&id=' + variant_id,
                success: function(data){
                  console.log('added');
                   $('#shipprice').html(" Rs "+price+"");
//                     location.reload();            
                }
              })
         }else{
             console.log(variant_id);
            $.ajax({
            type: 'POST', 
            url: '/cart/update.js',
            dataType: 'json', 
            data: 'quantity=0&id=' + variant_id,
            success: function(data){
              console.log('remove');
               $('#shipprice').html(" Rs "+price+"");
        }
                });

         }
     }else{
         console.log(variant_id);
        console.log('i am else');
     }
     
  
//      $.when(req1).done(function(){
//     	console.log("all done")
// 	});
  
  
});

  $('#checkIN').change(function(){
       if($(this).is(':checked')){
      console.log("CCCCheckeddddddd");
      window.location.href = "/cart";
  }
  else
  {
      console.log("UNCheckeddddddd");
            var variant_id = 13038143701091;
          $.ajax({
            type: 'POST', 
            url: '/cart/update.js',
            dataType: 'json', 
            data: 'quantity=-1&id=' + variant_id,
            success: function(data){
              console.log('remove');
             
                  
                var d = $('a[aria-label="Remove shipping insurance"]').attr('href');
                
                $.ajax({
                  type: 'GET',
                  url: d,
                  complete: function(data){
                    console.log(data);
                     if(document.URL.indexOf("#")==-1){ //Check if the current URL contains '#'
                        url = document.URL+"#"; // use "#". Add hash to URL
                        location = "#";
                        location.reload(true); //Reload the page
                       }
                     jQuery.getJSON('/cart.js', function(cart) {
                       console.log(cart);
                       
                       });
                  }
                })
                
                
                  
             
        }
       });

        
  } 
})

 if(document.URL.indexOf("#")!=-1){
   $('#checkIN').prop('checked', false);
 }

 
//   jQuery.post('/cart/change.js', { quantity: 1, line: 1 });


 
//   var total_price = $(".cart__subtotal").html();
//   var data = { "total_price": total_price };
//   console.log(data);
//   $.ajax({
//     type: "GET",
//     url: "https://shipping-insurance-test.myshopify.com/apps/store_cart",
//     data: data,
//     success: function(data){
//     	console.log(data);
//     }
//   })

//   $( document ).ready(function() {
//   var total_price = $(".cart__subtotal").html();
//   var data = total_price.liqued_variable;
//   console.log(data);
//   $.ajax({
//     type: "GET",
//     url: "https://shipping-insurance-test.myshopify.com/apps/store_cart",
//     data: data,
//     success: function(data){
//     	console.log(data);
//     }
//   })
// });



});










app.get('/store_cart',async (req,res) => {
    console.log(req.query);
    // const total = (req.query.total_amount)/100;
    var insurance_price = req.query.total_amount;
    // console.log(`total ${total}`);
    // if(total > 500){
    //   insurance_price = ( total - 100 ) * 1.5;
    //   insurance_price = insurance_price - total;
    // }else{
    //   insurance_price = 0.98;
    // }      
    let data = {      
                "price": `${insurance_price}`               
    };
    const shopify = new Shopify({
      shopName: req.query.shop,
      accessToken: 'e389011f9b4f1172311ce159bd933a3b'
    });
    shopify.productVariant.update(req.query.product_id,data).then(data=> {
      console.log(data);
    // shopify.product.update(req.query.product_id,data).then(data=> {
    //   console.log(data.variants);
      
      // res.sendStatus(200).send(data.options[0].product_id);
      res.json(data.variants[0].id);
    }).catch(err => console.log(err));
    // let urlShopify = "https://"+req.query.shop+"/admin/products/1517036175459.json";; // create customer
    // let optionsShopify = {
    // method: 'PUT',
    // form: data,
    // uri: urlShopify,
    // headers: {
    // 'X-Shopify-Access-Token': "0f6992f0de9f6ad518b5da3ada8f6145",
    // 'Host':req.query.shop,
    // 'Content-type': 'application/json'
    // }
    // };
    // request(optionsShopify)
    // .then(function (parsedBody) {
    // console.log(parsedBody)
    // }).catch(err => {
    // console.log(err);
    // })
    // res.send(insurance_price); 
    
}); 