CREATE TABLE IF NOT EXISTS employees (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    department VARCHAR(100) NOT NULL,
    salary FLOAT NOT NULL,
    hire_date DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO employees (first_name, last_name, email, department, salary, hire_date) VALUES
('John', 'Doe', 'john.doe@example.com', 'Engineering', 95000, NOW()),
('Jane', 'Smith', 'jane.smith@example.com', 'Marketing', 75000, NOW()),
('Bob', 'Johnson', 'bob.johnson@example.com', 'Sales', 65000, NOW()),
('Alice', 'Williams', 'alice.williams@example.com', 'Engineering', 92000, NOW()),
('Charlie', 'Brown', 'charlie.brown@example.com', 'HR', 60000, NOW()),
('Diana', 'Davis', 'diana.davis@example.com', 'Engineering', 98000, NOW()),
('Eve', 'Miller', 'eve.miller@example.com', 'Finance', 85000, NOW()),
('Frank', 'Wilson', 'frank.wilson@example.com', 'Operations', 70000, NOW()),
('Grace', 'Moore', 'grace.moore@example.com', 'Marketing', 72000, NOW()),
('Henry', 'Taylor', 'henry.taylor@example.com', 'Sales', 68000, NOW()),
('Iris', 'Anderson', 'iris.anderson@example.com', 'Engineering', 96000, NOW()),
('Jack', 'Thomas', 'jack.thomas@example.com', 'Finance', 82000, NOW()),
('Kelly', 'Jackson', 'kelly.jackson@example.com', 'HR', 62000, NOW()),
('Leo', 'White', 'leo.white@example.com', 'Operations', 71000, NOW()),
('Mia', 'Harris', 'mia.harris@example.com', 'Marketing', 76000, NOW());
