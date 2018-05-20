DROP DATABASE IF EXISTS bamazon_db;

CREATE DATABASE bamazon_db;

USE bamazon_db;

CREATE TABLE products(
    item_Id INTEGER(11) AUTO_INCREMENT NOT NULL,
    product_name VARCHAR(120) NOT NULL,
    department_name VARCHAR(120) DEFAULT 'Uncategorized',
    price INTEGER(11) NOT NULL,
    stock_quantity INTEGER(11) NOT NULL,
    PRIMARY KEY (item_Id)
);

INSERT INTO products (product_name, department_name, price, stock_quantity)
VALUES ("Chocolate Chip Cookie", "food", 2, 100),
("Snickerdoodle", "food", 2, 100),
("Cupcake", "food", 2, 100),
("Cookie Sheet", "supplies", 15, 80),
("Whisk", "supplies", 8, 80),
("Spatula", "supplies", 5, 80),
("Cupcake Liners", "supplies", 5, 80),
("Convection Oven", "appliances", 3000, 50),
("Stand Mixer", "appliances", 300, 50),
("Food Processor", "appliances", 200, 50),
("Hot Plate", "appliances", 100, 50);