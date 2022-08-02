//Acquire all modules
const util = require("util");
const mysql = require("mysql2");
const cTable = require("console.table");
const inquirer = require("inquirer");
//Create connection
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "732602",
  database: "company_db"
});
connection.connect(function (err){
    if (err){
        console.error("error connecting:" + err.stack);
        return;
    }
});
//Implementing adding, viewing, updating or deleting roles
getJob();
function getJob() {
    inquirer.prompt({
            name: 'job',
            type: 'list',
            message:'What would you like to do?',
            choices: ['add', 'view', 'update', 'delete', 'exit'],
        }
    ).then(function({job}){
        switch (job){
            case 'add':
                add();
                break;
            case 'view':
                viewList();
                break;
            case 'update':
                update();
                break;
            case 'delete':
                deleteList();
                break;
            case 'exit':
                connection.end()
                return;
        }
    })
}
//Implementing departments, roles and employee
function add() {
    inquirer.prompt({
            name: "db",
            type: 'list',
            message:'What would you like to add?',
            choices: ['department', 'role', 'employee'],
        }
    ).then(function({db}){
        switch (db){
            case "department":
                add_department()
                break;
            case "role":
                add_role()
                break;
            case 'employee':
                add_employee();
                break;               
        }
    })
}
// adding department.... prompts user
function add_department() {
    inquirer
        .prompt(
            {
                name: 'name',
                message: "Please name this department.",
                type: 'input'
            }
        ).then(function ({ name }) {
            connection.query(`INSERT INTO department (name) VALUES ('${name}')`, function (err, data) {
                if (err) throw err;
                console.log(`Added`)
                getJob();
            })
        })
}
//Implementing a role, salary, and department id
function add_role() {
    let departments = []
    connection.query(`SELECT * FROM department`, function (err, data) {
        if (err) throw err;
        for (let i = 0; i < data.length; i++) {
            departments.push(data[i].name)
        }
        inquirer
            .prompt([
                {
                    name: 'title',
                    message: "Please enter a name for this role.",
                    type: 'input'
                },
                {
                    name: 'salary',
                    message: 'Please enter the salary for this role.',
                    type: 'input'
                },
                {
                    name: 'department_id',
                    message: 'What department do they belong in?',
                    type: 'list',
                    choices: departments
                }
            ]).then(function ({ title, salary, department_id }) {
                let index = departments.indexOf(department_id)
                connection.query(`INSERT INTO role (title, salary, department_id) VALUES ('${title}', '${salary}', ${index})`, function (err, data) {
                    if (err) throw err;
                    console.log(`Added`)
                    getJob();
                })
            })
    })
}
//Implementing new employee data (ID and Manager)
function add_employee() {
    let employees = [];
    let roles = [];
    connection.query(`SELECT * FROM role`, function (err, data) {
        if (err) throw err;
        for (let i = 0; i < data.length; i++) {
            roles.push(data[i].title);
        }
        connection.query(`SELECT * FROM employee`, function (err, data) {
            if (err) throw err;
            for (let i = 0; i < data.length; i++) {
                employees.push(data[i].first_name);
            }
            inquirer
                .prompt([
                    {
                        name: 'first_name',
                        message: "What is the employee's first name?",
                        type: 'input'
                    },
                    {
                        name: 'last_name',
                        message: 'What is their last name?',
                        type: 'input',
                    },
                    {
                        name: 'role_id',
                        message: 'What is their role?',
                        type: 'list',
                        choices: roles,
                    },
                    {
                        name: 'manager_id',
                        message: "Who is their manager?",
                        type: 'list',
                        choices: ['none'].concat(employees)
                    }
                ]).then(function ({ first_name, last_name, role_id, manager_id }) {
                    let queryText = `INSERT INTO employee (first_name, last_name, role_id`;
                    if (manager_id != 'none') {
                        queryText += `, manager_id) VALUES ('${first_name}', '${last_name}', ${roles.indexOf(role_id)}, ${employees.indexOf(manager_id) + 1})`
                    } else {
                        queryText += `) VALUES ('${first_name}', '${last_name}', ${roles.indexOf(role_id) + 1})`
                    }
                    console.log(queryText)
                    connection.query(queryText, function (err, data) {
                        if (err) throw err;

                        getJob();
                    })
                })
        })
    })
}
//View department and manager lists
    function viewList() {
        inquirer.prompt( {
            name: 'view',
            message: 'What would you like to view?',
            type: 'list',
            choices: ['employees by department', 'employees by manager']
        }).then(function ({view}) {
            switch (view) {
                case 'employees by department':
                    view_by_department();
                    break;
                    case 'employees by manager':
                        view_by_manager();
                        break;
            }
        })
    }
    //Split IDs for employees to be viewed by department
    function view_by_department() {
        connection.query(`SELECT e1.id, e1.first_name, e1.last_name, role.title, department.name AS department, role.salary, CONCAT(e2.first_name, ' ', e2.last_name) AS manager FROM employee as e1
      LEFT JOIN role on e1.role_id = role.id
      LEFT JOIN department on role.department_id = department.id
      LEFT JOIN employee as e2 on e2.id = e1.manager_id
      ORDER BY department ASC`, function (err, data) {
            if (err) throw err;
            console.table(data)
                    getJob();
                });
             };

         //Split IDs for employees to be viewed by the manager
             function view_by_manager() {
                connection.query(`SELECT CONCAT(e2.first_name, ' ', e2.last_name) AS manager, e1.id, e1.first_name, e1.last_name, role.title, department.name AS department, role.salary FROM employee as e1
              LEFT JOIN role on e1.role_id = role.id
              LEFT JOIN department on role.department_id = department.id
              INNER JOIN employee as e2 on e2.id = e1.manager_id
              ORDER BY manager ASC`, function (err, data) {
                    if (err) throw err;
                    console.table(data)
                            getJob();
                        });
                     };
//Update lists, roles, and manager
    function update() {
        inquirer.prompt({
            name:'update',
            message:'What needs to be updated?',
            type:'list',
            choices: ['role', 'manager']
        }) .then(function ({update}) {
            switch (update) {
                case 'role':
                    update_role();
                    break;
                    case 'manager':
                        update_manager();
                        break;
            }
        })
    }
    //Update and add a new role
    function update_role() {
        connection.query(`SELECT * FROM employee`), function (err,data) {
            if (err) throw err;

            let employee = [];
            let roles = [];

            for (let i=0; i < data.length; i++) {
                employees.push(data[i].first_name)
            }
            connection.query(`SELECT * FROM role`, function (err, data) {
                if (err) throw err;
                for (let i=0; i < data.length; i++) {
                    roles.push(data[i].title)
                }
                inquirer.prompt([
                    {
                        name:'employee_id',
                        message: "what role needs to be updated?",
                        type: 'list',
                        choices: employees
                    },       
                    {
                        name:'role_id',
                        message: "What is the new role to add?",
                        type:'list',
                        choices: roles
                    }
                ]).then(function({ employee_id, role_id}) {
                    connection.query(`UPDATE employee SET role_id = ${roles.indexOf(role_id) + 1} WHERE id = ${employees.indexOf(employee_id) + 1}`, function (err, data) {
                        if (err) throw err;

                        getJob();
                    })
                })
        })
    }
}
//Update manager, employee, and ID
function update_manager() {
    connection.query(`SELECT * FROM employee`, function (err, data) {
        if (err) throw err;
        let employees = [];
        for (let i = 0; i < data.length; i++) {
            employees.push(data[i].first_name)
        }
        inquirer
            .prompt([
                {
                    name: 'employee_id',
                    message: 'Who would you like to update?',
                    type: 'list',
                    choices: employees
                },
                {
                    name: "manager_id",
                    message: "Who is their new manager?",
                    type: 'list',
                    choices: ['none'].concat(employees)
                }
            ]).then(({ employee_id, manager_id }) => {
                let queryText = ""
                if (manager_id !== "none") {
                    queryText = `UPDATE employee SET manager_id = ${employees.indexOf(manager_id) + 1} WHERE id = ${employees.indexOf(employee_id) + 1}`
                } else {
                    queryText = `UPDATE employee SET manager_id = ${null} WHERE id = ${employees.indexOf(employee_id) + 1}`
                }
                connection.query(queryText, function (err, data) {
                    if (err) throw err;

                    getJob();
                })
            })
    });
}
//Delete employee, role or department lists
function deleteList() {
    inquirer
        .prompt(
            {
                name: 'deleteList',
                message: 'What would you like to delete?',
                type: 'list',
                choices: ['employee', 'role', 'department']
            }
        ).then(function ({ deleteList }) {
            switch (deleteList) {
                case 'employee':
                    delete_employee();
                    break;
                case 'role':
                    delete_role();
                    break;
                case 'department':
                    delete_department();
                    break;
            }
        })
}
//Delete employee
function delete_employee() {
    connection.query(`SELECT * FROM employee`, function (err, data) {
        if (err) throw err;
        let employees = [];
        for (let i = 0; i < data.length; i++) {
            employees.push(data[i].first_name)
        }
            inquirer
                .prompt([
                    {
                        name: 'employee_id',
                        message: "Which employee should be deleted?",
                        type: 'list',
                        choices: employees
                    },
                ]).then(function ({ employee_id }) {
                   connection.query(`DELETE from employee WHERE id = ${employees.indexOf(employee_id) + 1}`, function (err, data) {
                        if (err) throw err;
                        getJob();                      
                    })
                })
        })
}
//Delete roles
function delete_role() {
    connection.query(`SELECT * FROM role`, function (err, data) {
        if (err) throw err;
        let roles = [];
        for (let i = 0; i < data.length; i++) {
            roles.push(data[i].title)
        }
            inquirer
                .prompt([
                    {
                        name: 'role_id',
                        message: "Which role should be deleted?",
                        type: 'list',
                        choices: roles
                    },
                ]).then(function ({ role_id }) {
                    connection.query(`DELETE from role WHERE id = ${roles.indexOf(role_id) + 1}`, function (err, data) {
                        if (err) throw err;
                        getJob();                       
                    })
                })
        })
}
//Delete departments
function delete_department() {
    connection.query(`SELECT * FROM department`, function (err, data) {
        if (err) throw err;
        let departments = [];
        for (let i = 0; i < data.length; i++) {
            departments.push(data[i].name)
        }
            inquirer
                .prompt([
                    {
                        name: 'department_id',
                        message: "Which department should be deleted?",
                        type: 'list',
                        choices: departments
                    },
                ]).then(function ({ department_id }) {
                    connection.query(`DELETE from department WHERE id = ${departments.indexOf(department_id) + 1}`, function (err, data) {
                        if (err) throw err;
                        getJob();                       
                    })
                })
        })
}