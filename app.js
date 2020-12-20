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
                'Add department',
                'Add role',
                'Remove employee',
                'Update employee role',
                'Update employee manager',
                'Exit'
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
        case 'Add department':
            addDepartment();
            break;
        case 'Add role':
            addRole();
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
        case 'Exit':
            console.log("--Closing application--");
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
    query += "roles.salary, ";
    query += "CONCAT(managers.first_name,\" \",managers.last_name) AS manager ";
    query += "FROM employees ";
    query += "INNER JOIN roles ";
    query += "ON employees.role_id=roles.id ";
    query += "INNER JOIN departments ";
    query += "ON roles.department_id=departments.id ";
    query += "INNER JOIN employees AS managers ";
    query += "ON employees.manager_id = managers.id "
    if (filter) {
        query += " WHERE " + filter[0] + "=" + filter[1];
    }
    query += " ORDER BY department_name ";
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

        let filter = ["departments.department_name", "\"" + menu.choice + "\""];
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
    let newEmployee = {};
    let answer;
    do {
        answer = await inquirer.prompt([
            {
                type: "input",
                message: "What is the employees first name? ",
                name: "first_name"
            }
        ]);
        if (answer.first_name === "") {
            console.log("Employee Name cannot be left blank...");
        }
    } while (answer.first_name === "");
    newEmployee.first_name = answer.first_name;
    do {
        answer = await inquirer.prompt([
            {
                type: "input",
                message: "What is the employees last name? ",
                name: "last_name"
            }
        ]);
        if (answer.last_name === "") {
            console.log("Employee Name cannot be left blank...");
        }

    } while (answer.last_name === "");
    newEmployee.last_name = answer.last_name;
    let query = "SELECT DISTINCT title, id FROM roles";
    connection.query(query, async (err, res) => {
        if (err) throw err;
        let choices = [];
        res.forEach(role => choices.push(role.title));
        answer = await inquirer.prompt([
            {
                type: "list",
                message: "What is the employees role? ",
                name: "role",
                choices: choices
            }
        ]);
        res.forEach(role => {
            if (role.title === answer.role) { newEmployee.role_id = role.id };
        });
        let query = "SELECT * FROM employees WHERE manager_id IS NULL";
        connection.query(query, async (err, res) => {
            if (err) throw err;
            let choices = ["ADD AS MANAGER"];
            res.forEach(manager => choices.push(manager.first_name + " " + manager.last_name));
            answer = await inquirer.prompt([
                {
                    type: "list",
                    message: "Who is the employees manager? ",
                    name: "manager",
                    choices: choices
                }
            ]);
            res.forEach(manager => {
                if (manager.first_name + " " + manager.last_name === answer.manager) { newEmployee.manager_id = manager.id };
            });
            //if(answer.manager==="ADD AS MANAGER"){ newEmployee.manager_id = "NULL"};
            connection.query("INSERT INTO employees SET ?", newEmployee, (err, res) => {
                if (err) throw err;
                menu();
            });
        });
    });
}

async function addDepartment() {
    let newDepartment = {};
    let answer;
    do {
        answer = await inquirer.prompt([
            {
                type: "input",
                message: "What is the new department? ",
                name: "department"
            }
        ]);
        if (answer.department === "") {
            console.log("Department Name cannot be left blank...");
        }
    } while (answer.department === "");
    newDepartment.department_name = answer.department;
    connection.query("INSERT INTO departments SET ?", newDepartment, (err, res) => {
        if (err) throw err;
        menu();
    });
}

function removeEmployee() {
    let query = "SELECT first_name, last_name, id FROM employees";
    connection.query(query, async (err, res) => {
        if (err) throw err;
        let choices = [];
        res.forEach(person => { choices.push(person.first_name + " " + person.last_name) });
        let answer = await inquirer.prompt([
            {
                type: "list",
                message: "Which employee would you like to destroy? ",
                name: "name",
                choices: choices
            }
        ]);
        let remove_id;
        res.forEach(person => {
            if (person.first_name + " " + person.last_name === answer.name) {
                remove_id = person.id;
            }
        });
        connection.query("DELETE FROM employees WHERE id = ?", remove_id, (err, res) => {
            if (err) throw err;
            menu();
        });
    })
}

function updateRole() {
    let query = "SELECT first_name, last_name, id FROM employees";
    connection.query(query, async (err, res) => {
        if (err) throw err;
        let choices = [];
        res.forEach(person => { choices.push(person.first_name + " " + person.last_name) });
        let answer = await inquirer.prompt([
            {
                type: "list",
                message: "Whose role would you like to change? ",
                name: "name",
                choices: choices
            }
        ]);
        let employee_id;
        res.forEach(person => {
            if (person.first_name + " " + person.last_name === answer.name) {
                employee_id = person.id;
            }
        });
        query = "SELECT * FROM roles";
        connection.query(query, async (err, res) => {
            if (err) throw err;
            let choices = [];
            res.forEach(role => { choices.push(role.title) });
            let answer = await inquirer.prompt([
                {
                    type: "list",
                    message: "What role should they have? ",
                    name: "title",
                    choices: choices
                }
            ]);
            let role_id;
            res.forEach(role => {
                if (role.title === answer.title) {
                    role_id = role.id;
                }
            });
            let queryParams = [role_id, employee_id];
            connection.query("UPDATE employees SET role_id = ? WHERE id = ?", queryParams, (err, res) => {
                if (err) throw err;
                menu();
            })
        });
    })
}

function updateManager() {
    let query = "SELECT * FROM employees WHERE manager_id IS NOT NULL";
    connection.query(query, async (err, res) => {
        if (err) throw err;
        let choices = [];
        res.forEach(person => { choices.push(person.first_name + " " + person.last_name) });
        let answer = await inquirer.prompt([
            {
                type: "list",
                message: "Whose manager would you like to change? ",
                name: "name",
                choices: choices
            }
        ]);
        let employee_id;
        res.forEach(person => {
            if (person.first_name + " " + person.last_name === answer.name) {
                employee_id = person.id;
            }
        });
        query = "SELECT * FROM employees WHERE manager_id IS NULL";
        connection.query(query, async (err, res) => {
            if (err) throw err;
            let choices = [];
            res.forEach(manager => { choices.push(manager.first_name + " " + manager.last_name) });
            let answer = await inquirer.prompt([
                {
                    type: "list",
                    message: "Who should their manager be? ",
                    name: "manager",
                    choices: choices
                }
            ]);
            let manager_id;
            res.forEach(manager => {
                if (manager.first_name + " " + manager.last_name === answer.manager) {
                    manager_id = manager.id;
                }
            });
            let queryParams = [manager_id, employee_id];
            connection.query("UPDATE employees SET manager_id = ? WHERE id = ?", queryParams, (err, res) => {
                if (err) throw err;
                menu();
            })
        });
    })
}