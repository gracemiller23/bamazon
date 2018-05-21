var mysql = require("mysql");
var inquirer = require("inquirer");

var connection = mysql.createConnection({
    host: "localhost",
    port:8889,
    user: "root",
    password: "root",
    database: "bamazon_db"
});


connection.connect(function(err){
    if (err) throw err;
    console.log("connected as id " + connection.threadId + "\n");
    console.log("\n Welcome to Bamazon, the one-stop shop for serious bakers. \n")
    //enter code to run with database here 
    displayInventory();
});

//allow users to view the items they can purchase
function displayInventory(){
    console.log("\n Here are the items available for purchase: \n");
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw err;
        console.log(res);
        console.log("\n ID  |   Product Name       | Price \n")
        for (var i = 0; i< res.length; i++){
            console.log(" " + res[i].item_Id + " | " + res[i].product_name + "   |   $" + res[i].price +"\n");
        }
        placeOrder();
 
    });
}

//allow users to order

function placeOrder(){
    inquirer.prompt(
        [
            {
                type: "input",
                name: "chosenid",
                message: "What is the ID of the item you want to buy?",
                validate: function(value) {
                    if (isNaN(value) === false) {
                      return true;
                    }
                    return false;
                  }
            },
            {
                type: "input",
                name: "numunits",
                message: "How many units would you like to purchase?",
                validate: function(value) {
                    if (isNaN(value) === false) {
                      return true;
                    }
                    return false;
                  }
            }
        ]
    ).then(function(user){
        var itemID = user.chosenid;
        var numUnits = user.numunits;

        checkStock(itemID, numUnits);

    });
}



//check stock of ordered item

function checkStock(itemID, numOfUnits){
    console.log(itemID)
    console.log("Checking our stock to be sure we can fulfill your order ...");
    connection.query(
        "SELECT * FROM products WHERE ? ", 
        {
        item_Id: itemID
        }, 
    function(err, res){
        var inventoryResult = res[0].stock_quantity;

        var requestedUnits = parseInt(numOfUnits);
      
        if( requestedUnits <= inventoryResult){
            var totalPrice = parseInt(res[0].price) * numOfUnits;
            //show the total cost of the purchase
            console.log("Your total comes to: $" + totalPrice);
            getCustomerInfo(res, itemID,numOfUnits, totalPrice, inventoryResult );
        }else{
            console.log("Insufficient quantity!");
        }
    });

}

// loads customer information into the orders table
function getCustomerInfo(res, itemID, numOfUnits, totalPrice, inventoryResult){
    console.log("\n We'll need a few more details to ship your order ...");
    inquirer.prompt([
        {
        name:"customername",
        type: "input",
        message:"What's your full name?"
        },{
        name:"customeraddress",
        type: "input",
        message:"What is the deliver address? (Street Address, City, State, Zip)"
        }
    ]).then(function(user){
        var customer = user.customername;
        var customerAddress = user.customeraddress;
        var itemPurchased = res[0].product_name;

        var query = connection.query(
            "INSERT INTO orders SET ?",
            {
                customer_name: customer,
                delivery_address: customerAddress,
                product_id: itemID,
                product_ordered: itemPurchased,
                quantity: numOfUnits,
                total: totalPrice
            },
            function(err, res){
                console.log(res.affectedRows + "\n Your order has been placed!");
                adjustInventory(res, numOfUnits, itemID, inventoryResult);
            }
        );

    })
}

//decrease inventory in products table to reflect the purchase
function adjustInventory(res, numOfUnits, itemID, inventoryResult){
    console.log("Updating our inventory ...");

    var newStockQuant = inventoryResult - numOfUnits;
    console.log(newStockQuant);

    var query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: newStockQuant
            },
            {
                item_Id: itemID
            }
        ],
        function(err, res){
            console.log(res.affectedRows + "product updated.")
            connection.end();
        }
    );
}

