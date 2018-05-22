var mysql = require("mysql");
var inquirer = require("inquirer");
const Table = require('cli-table');

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
    //enter code to run with database here 
    managerStart();
});

function managerStart(){
    inquirer.prompt(
        [
            {
                type: "rawlist",
                name:"managerTaskChoices",
                message:"What operation do you want to perform?",
                choices: ["View Items for Sale", "View Low Inventory Items", "Add Inventory", "Add a New Product", "View Pending Customer Orders", "Mark Order Complete", "Quit"]
            }
        ]

    ).then(function(answer){
        if (answer.managerTaskChoices.toUpperCase() === "VIEW ITEMS FOR SALE"){
            console.log("Okay! Let's view items for sale.");
            viewForSale();
        }else if(answer.managerTaskChoices.toUpperCase() === "VIEW LOW INVENTORY ITEMS"){
            console.log("Okay! Let's view low inventory items.");
            viewLowInventory();
        }else if(answer.managerTaskChoices.toUpperCase() === "ADD INVENTORY"){
            console.log("Okay! Let's add inventory.");
            addInventory();
        }else if(answer.managerTaskChoices.toUpperCase() === "ADD A NEW PRODUCT"){
            console.log("Okay! Let's add a new product.");
            addNewProduct();
        }else if(answer.managerTaskChoices.toUpperCase() === "VIEW PENDING CUSTOMER ORDERS"){
            console.log("Okay! Let's view customer orders.");
            menuViewOrders(managerStart);
        }else if(answer.managerTaskChoices.toUpperCase() === "MARK ORDER COMPLETE"){
            console.log("Okay! Let's update customer orders.");
            updateOrders();
        }else if(answer.managerTaskChoices.toUpperCase() === "QUIT"){
            connection.end();
        }
    });
}

function viewForSale(){
    console.log("\n Here are the items available for purchase: \n");
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw err;
        const table1 = new Table({
            head: ["ID", "Product Name", "Price", "Department", "Stock"]
          , colWidths: [5, 30, 8, 10, 8]
        });
 
        for (var i = 0; i< res.length; i++){
            
            table1.push(
                [res[i].item_Id, res[i].product_name, res[i].price, res[i].department_name, res[i].stock_quantity ]
            );
        }

        console.log(table1.toString());
        managerStart();
    });
   
}

function viewInventory(){

    console.log("\n Here are the items available for purchase: \n");
    connection.query("SELECT * FROM products", function(err, res){
        if (err) throw err;
        const table1 = new Table({
            head: ["ID", "Product Name", "Price", "Department", "Stock"]
          , colWidths: [5, 30, 8, 10, 8]
        });
 
        for (var i = 0; i< res.length; i++){
            
            table1.push(
                [res[i].item_Id, res[i].product_name, res[i].price, res[i].department_name, res[i].stock_quantity ]
            );
        }
        console.log("\n");
        console.log(table1.toString());
        console.log("\n");
    });
}

function viewLowInventory(){
    connection.query("SELECT * FROM products", function(err, res){
        console.log("\n It's time to re-order: \n")

        const table2 = new Table({
            head: ["ID", "Product Name", "Price", "Department", "Stock"]
          , colWidths: [5, 30, 8, 10, 8]
        });
        for (var j = 0; j < res.length; j++){
            if (res[j].stock_quantity < 10){
                table2.push(
                    [res[j].item_Id, res[j].product_name, res[j].price, res[j].department_name, res[j].stock_quantity ]
                );            
            }
        }
        console.log("\n");
        console.log(table2.toString());
        console.log("\n");
        managerStart();
    });

}

function addInventory(){
    viewInventory();
    setTimeout(function(){
    inquirer.prompt(
        [
            {
                type:"input",
                name:"updateItemID",
                message:"Enter the item ID for the product you want to add inventory to.",
                validate: function(value) {
                    if (isNaN(value) === false) {
                      return true;
                    }
                    return false;
                  }
                
            },
            {
                type:"input",
                name:"increaseStock",
                message:"How much stock do you want to add?",
                validate: function(value) {
                    if (isNaN(value) === false) {
                      return true;
                    }
                    return false;
                  }
            }
        ]
    ).then(function(user){
        var itemIDtoUpdate = user.updateItemID;
        var increaseBy = user.increaseStock;
        var initialValue=0;

        var query = connection.query(
            "SELECT stock_quantity FROM products WHERE ?",
            {
                item_Id: itemIDtoUpdate
            },
            function(err,res){
                initialValue = res[0].stock_quantity;
                var newStockValue = parseInt(initialValue) + parseInt(increaseBy);
                updateProduct(itemIDtoUpdate, newStockValue);
                
            }
        )

        
    });
}, 500);

}

function updateProduct(id, variable){
    var query = connection.query(
        "UPDATE products SET ? WHERE ?",
        [
            {
                stock_quantity: variable
            },
            {
                item_Id: id
            }
        ],
        function(err, res){
            console.log("You've updated product " + id + "by adding inventory.")
            managerStart();
        }
    );
  

}

function addNewProduct(){
    inquirer.prompt([
        {
            type:"input",
            name: "productName",
            message: "What product do you want to add?"
    
        },
        {
            type:"input",
            name: "departmentName",
            message: "What department should this product be in?"
        },
        {
            type:"input",
            name: "price",
            message: "How much will this product cost?"
        },
        {
            type:"input",
            name: "stock",
            message: "How many units of this product will be in stock?"
        }
    ]).then(function(user){
        var name = user.productName;
    var department = user.departmentName;
    var price = user.price;
    var quantity = user.stock;

    newProduct(name, department, price, quantity);
  
    });
    
}

function newProduct(var1, var2, var3, var4){
    console.log("\nAdding product ...")
    var query = connection.query(
        "INSERT INTO products SET ?",
        {
            product_name: var1, 
            department_name: var2, 
            price: var3, 
            stock_quantity: var4
        },
        function(err, res){
            console.log("\nProduct added!\n")
            managerStart();
        }
    )
    
}

function viewOrders(){
    console.log("\nHere are all pending orders: \n")
    connection.query("SELECT * FROM orders", function(err, res){

        const table3 = new Table({
            head: ["ID", "CUSTOMER NAME",
            "DELIVERY ADDRESS",
            "PRODUCT ID",
            "PRODUCT",
            "QUANTITY",
            "TOTAL"]
          , colWidths: [5, 20, 30, 8, 5, 8,8]
        });
        for (var j = 0; j < res.length; j++){
            if (res[j].order_filled === 0){
                table3.push(
                    [res[j].order_Id, res[j].customer_name, res[j].delivery_address, res[j].product_id, res[j].product_ordered, res[j].quantity, res[j].total ]
                );            
            }
        }
        console.log("\n");
        console.log(table3.toString());
        console.log("\n");
    });

}

function menuViewOrders(callback){
    viewOrders();
    setTimeout(function(){callback()}, 1000);
}

function updateOrders(){
    viewOrders();
inquirer.prompt(
    [
        {
            type: "input",
            name: "orderID",
            message: "Which order do you want to mark complete?"
        }
    ]
).then(function(user){
    var complete = 1;
    var orderID = user.orderID;

    orderChange(complete, orderID);

});
}

function orderChange(variable, id){
    var query = connection.query(
        "UPDATE orders SET ? WHERE ?",
        [
            {
                order_filled: variable
            },
            {
                order_Id: id
            }
        ],
        function(err, res){
            console.log("You've updated order " + id + "to complete.")
            managerStart();
        }
    );
   
}