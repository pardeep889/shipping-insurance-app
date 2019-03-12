

$(document).ready(function() {  
  
    $('#shopify-section-cart-template > div > form > div > div > div > div:nth-child(1)').append('<br> <input type="checkbox" id= "checkIN" checked="checked" /> ' + "Add Shipping protection for"+'<span id = "shipprice"><span>' + '<br />'); 
    var data = { "getVariant": true};
    $.ajax({
    type: "GET",
    data:data,
    url: "/apps/store_cart",
    success: function(data){
        appLogic(data);
    }
   });

    function appLogic(variant_id){   
     jQuery.getJSON('/cart.js', function(cart) {    
       var price;
        var Subtotal = 0;
       var line_price;
       for(var j=0;j<cart.items.length; j++){           
         line_price= cart.items[j].line_price
         if(cart.items[j].id == variant_id){
          line_price = 0;
         }
          Subtotal = Subtotal + line_price;         
       }
       var total_price =(Subtotal)/100;
       if(total_price > 500){ 
         price = ( total_price - 100 ) * 1.5;
         price= (price - total_price);
  //        price = "" + price + ".00";
         console.log(` price: ${price}`);
       }
       else{
         price = 90.8;
       }
     
       var quantity  = 1;
       var found = 0;
       if(cart.items.length > 0) {
         for(var i = 0; i < cart.items.length; i++){    
              if(cart.items[i].id == variant_id){     
               found = 1;
               var data = { "total_amount": price, "product_id": cart.items[i].id};
               $.ajax({
               type: "GET",
               data:data,
               url: "/apps/store_cart",
               success: function(data){
               }
              });
                var price = cart.items[i].price/100;
                $('#shipprice').html(" Rs "+price+"");
                   break;
                }
            } 
             if(!found && document.URL.indexOf("#")==-1){
                    $.ajax({
                    type: 'POST', 
                    url: '/cart/add.js',
                    dataType: 'json', 
                    data: 'quantity=' + quantity + '&id=' + variant_id,
                    success: function(data){   
                      $('a[aria-label="Remove shipping insurance"]').attr('data', 'test()');                  
                      $('#shipprice').html(" Rs "+price+"");
                      location.reload();            
                   }
                  })
             }else{
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
 } // logic


    $('#checkIN').change(function(){
        if($(this).is(':checked')){
        window.location.href = "/cart";
    }
    else{
        var data = { "getVariant": true};
        $.ajax({
        type: "GET",
        data:data,
        url: "/apps/store_cart",
        success: function(data){
            removeOnUncheck(data);
        }
       });
        
    } 
    });

    function removeOnUncheck(variant_id){
              $.ajax({
                type: 'POST', 
                url: '/cart/update.js',
                dataType: 'json', 
                data: 'quantity=-1&id=' + variant_id,
                success: function(data){
                    var d = $('a[aria-label="Remove shipping insurance"]').attr('href');                    
                    $.ajax({
                      type: 'GET',
                      url: d,
                      complete: function(data){
                         if(document.URL.indexOf("#")==-1){ //Check if the current URL contains '#'
                            url = document.URL+"#"; // use "#". Add hash to URL
                            location = "#";
                            location.reload(true); //Reload the page
                           }
                      }
                    }) 
                }
           });
    }  
     if(document.URL.indexOf("#")!=-1){
       $('#checkIN').prop('checked', false);
     }
  });