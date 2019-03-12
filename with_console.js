
    


$(document).ready(function() {

  
  
    $('#shopify-section-cart-template > div > form > div > div > div > div:nth-child(1)').append('<br> <input type="checkbox" id= "checkIN" checked="checked" /> ' + "Add Shipping protection for"+'<span id = "shipprice"><span>' + '<br />'); 
  //     var variant_id = 1517216137315;
    
      $('tbody').attr('id', 'IamTable')
      //$('#shopify-section-cart-template > div > form > div > div > div > div:nth-child(1)').append('<br> <input type="checkbox" id= "checkIN" checked="checked" /> ' + "Add Shipping protection for" + '<br />');
     jQuery.getJSON('/cart.js', function(cart) {    
       var price;
       console.log(cart);
       
       console.log(total_price);
        var Subtotal = 0;
       console.log(cart);
       var line_price;
       for(var j=0;j<cart.items.length; j++){           
         line_price= cart.items[j].line_price
         if(cart.items[j].id == 13038280048739){
             //skip
          line_price = 0;
         }
          Subtotal = Subtotal + line_price;
         console.log(`line price: ${line_price}`);
       }
     
       console.log(`Subtotal is: ${Subtotal} `);
       var total_price =(Subtotal)/100;
       if(total_price > 500){
        
        
         console.log(price);
  //        var x=cart.total_price;
  //         price = ( x/1000).toFixed(2);
  //        console.log(price);
         price = ( total_price - 100 ) * 1.5;
         price= (price - total_price);
  //        price = "" + price + ".00";
         console.log(` price: ${price}`);
       }
       else{
         price = 90.8;
       }
       var variant_id = 13038280048739;
       var quantity  = 1;
       var found = 0;
  
       
       if(cart.items.length > 0) {
      
  //        console.log(cart.items[i]);1
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
                      console.log('added 1');
  //                    $('#IamTable').load(document.URL+'#IamTable');
  //                     $('a[aria-label="Remove shipping insurance"]').click(false);
  //                    $('a[aria-label="Remove shipping insurance"]').click(function(){return false;});
  //                 $('a[aria-label="Remove shipping insurance"]').click(function(event) {
  //                     event.preventDefault();
  //                     alert('stop');
  //                 });
                      $('a[aria-label="Remove shipping insurance"]').attr('data', 'test()');                  
                      $('#shipprice').html(" Rs "+price+"");
                      location.reload();            
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
                  $('a[aria-label="Remove shipping insurance"]').attr('onclick', 'return yesIamFunction();');
                  yesIamFunction = function(event) {
                      removeOnUncheck();
                      return false;
                  } 
                  $('#shipprice').html(" Rs "+price+"");
                    }
             });
  
             }
         }else{           
            console.log('No items in the cart');
         }
   });
    
      $('#checkIN').change(function(){
           if($(this).is(':checked')){
          console.log("CCCCheckeddddddd");
          window.location.href = "/cart";
      }
      else
      {
          console.log("UNCheckeddddddd");
        removeOnUncheck();
  
            
      } 
    })
      
      function removeOnUncheck(){
            var variant_id = 13038280048739;
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




  else if(req.query.installed == 'true'){
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
 }