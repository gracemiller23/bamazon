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
        connection.end();
    });
}

//allow users to order



//check stock of ordered item



//show the total cost of the purchase



//decrease inventory in database to reflect the purchase