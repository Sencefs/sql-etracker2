INSERT INTO department (dept_name)
VALUES 
('Eggs and Omelettes'),
('Peanut Butter and Jam'),
('Tea and Coffee');
INSERT INTO job (title, salary, department_id)
VALUES 
('Authoritator', 75000, 1),
('Tea and Coffee Maker', 85000, 1),
('Peanut Butter Spreader', 78000, 1),
('Mouse Tamer', 100000, 2),
('Money Counter', 80000, 2),
('Egg Maker', 75000, 3),
('Reeses Puff', 500000, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES 
('Jamiroquai', 'Silverham', 1, NULL),
('Hamsternious', 'Silverham', 2, 1),
('Tom', 'Edilson', 3, 2),
('Wyatt', 'Earth', 4, NULL),
('Lew', 'Lattimson', 5, 4),
('Marcus', 'Twainerton', 6, NULL),
('Janet', 'Austrin', 7, NULL);