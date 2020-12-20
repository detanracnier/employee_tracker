const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');

const connection = mysql.createConnection(
    {
        host: 'localhost',
        port: 3306,
        user: 'root',
        password: '!F4ll3n3lite',
        database: 'employeedb'
    }
);

menu();

async function menu() {
    const menu = await inquirer.prompt([
        {
            type: "list",
            message: "What would you like to do? ",
            name: "choice",
            choices: [
                'View all employees',
                'View all employees by department',
                'View all employees by manager',
                'Add employee',
                'Remove employee',
                'Update employee role',
                'Update employee manager'
            ]
        }
    ])
    switch (menu.choice) {
        case 'View all employees':
            viewAll();
            break;
        case 'View all employees by department':
            viewAllByDept();
            break;
        case 'View all employees by manager':
            viewAllByManager();
            break;
        case 'Add employee':
            addEmployee();
            break;
        case 'Remove employee':
            removeEmployee();
            break;
        case 'Update employee role':
            updateRole();
            break;
        case 'Update employee manager':
            updateManager();
            break;
        default:
            return;
    }
}

function viewAll(filter) {
    let query = "SELECT ";
    query += "employees.id, ";
    query += "employees.first_name, ";
    query += "employees.last_name, ";
    query += "roles.title, ";
    query += "departments.department_name, ";
    query += "roles.salary ";
    query += "FROM employees ";
    query += "INNER JOIN roles ";
    query += "ON employees.role_id=roles.id ";
    query += "INNER JOIN departments ";
    query += "ON roles.department_id=departments.id ";
    if (filter) {
        query += " WHERE " + filter[0] + "=\"" + filter[1] + "\"";
    }
    connection.query(query, (err, res) => {
        if (err) throw err;
        console.table(res);
        menu();
    });
}

function viewAllByDept() {
    let query = "SELECT *";
    query += "FROM departments ";
    connection.query(query, async (err, res) => {
        if (err) throw err;
        let list = [];
        res.forEach(dept => list.push(dept.department_name));
        let menu = await inquirer.prompt([
            {
                type: "list",
                message: "Select a department: ",
                name: "choice",
                choices: list
            }
        ]);
        let filter = ["departments.department_name", menu.choice];
        viewAll(filter);
    });
}

function viewAllByManager() {
    let query = "SELECT ";
    query += "employees.id, ";
    query += "employees.first_name, ";
    query += "employees.last_name, ";
    query += "employees.manager_id ";
    query += "FROM employees ";
    query += "INNER JOIN roles ";
    query += "ON employees.role_id=roles.id ";
    query += "WHERE employees.manager_id IS NULL";
    console.log(query);
    connection.query(query, async (err, res) => {
        if (err) throw err;
        let list = [];
        res.forEach(manager => list.push(manager.first_name + " " + manager.last_name));
        let menu = await inquirer.prompt([
            {
                type: "list",
                message: "Select a Manager: ",
                name: "choice",
                choices: list
            }
        ]);
        let id;
        res.forEach(manager => {
            if (manager.first_name + " " + manager.last_name === menu.choice) {

                id = manager.id;
            }
        })
        let filter = ["employees.manager_id", id];
        viewAll(filter)
    });
}

async function addEmployee() {
    let newEmployee;
    do {
        newEmployee = await inquirer.prompt([
            {
                type: "input",
                message: "What is the employees first name? ",
                name: "first_name"
            }
        ]);
        if (newEmployee.first_name === "") {
            console.log("Employee Name cannot be left blank...");
        }
    } while (newEmployee.first_name === "");

    do {
        newEmployee = await inquirer.prompt([
            {
                type: "input",
                message: "What is the employees last name? ",
                name: "last_name"
            }
        ]);
        if (newEmployee.last_name === "") {
            console.log("Employee Name cannot be left blank...");
        }

    } while (newEmployee.last_name === "");
    let query = "SELECT DISTINCT title, id FROM roles";
    connection.query(query, async (err, res) => {
        if (err) throw err;
        let choices = [];
        res.forEach(role => choices.push(role.title));
        newEmployee = await inquirer.prompt([
            {
                type: "list",
                message: "What is the employees role? ",
                name: "role",
                choices: choices
            }
        ]);
        res.forEach(role => {
            if (role.title === newEmployee.role) { newEmployee.role_id = role.id };
        });
        delete newEmployee.role;
        let query = "SELECT DISTINCT department_name, id FROM departments";
        connection.query(query, async (err, res) => {
            if (err) throw err;
            let choices = [];
            res.forEach(dept => choices.push(depy.department_name));
            newEmployee = await inquirer.prompt([
                {
                    type: "list",
                    message: "What is the employees department? ",
                    name: "department",
                    choices: choices
                }
            ]);
            res.forEach(dept => {
                if (dept.department_name === newEmployee.department) { newEmployee.department_id = dept.id };
            });
            delete newEmployee.department;
            connection.query("INSERT INTO employees SET ?", newEmployee, (err, res) => {
                if (err) throw err;
                menu();
            });
        });
    });

    console.log(newEmployee);
}