from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from database import engine, SessionLocal
from models import Base, Employee
from schemas import EmployeeCreate, EmployeeUpdate, EmployeeResponse

app = FastAPI(title="Employee API", version="1.0.0")

# Create tables
Base.metadata.create_all(bind=engine)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db():
    """
    Dependency to get database session.
    Automatically handles session lifecycle - creates and closes connections.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Employee Manager API", "docs": "/docs"}

@app.get("/employees", response_model=list[EmployeeResponse])
def get_employees(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """
    Get all employees with pagination.
    
    - **skip**: Number of records to skip (default 0)
    - **limit**: Maximum number of records to return (default 50, max 100)
    """
    # Validate limit to prevent requesting too much data
    if limit > 100:
        limit = 100
    if skip < 0:
        skip = 0
    
    employees = db.query(Employee).offset(skip).limit(limit).all()
    return employees

@app.get("/employees/count", response_model=dict)
def get_employees_count(db: Session = Depends(get_db)):
    """Get total count of employees for pagination purposes."""
    count = db.query(Employee).count()
    return {"total": count}

@app.post("/employees", response_model=EmployeeResponse)
def create_employee(employee: EmployeeCreate, db: Session = Depends(get_db)):
    """
    Create a new employee.
    
    Returns the created employee with ID and hire_date.
    """
    db_employee = Employee(**employee.dict())
    db.add(db_employee)
    try:
        db.commit()
        db.refresh(db_employee)
        return db_employee
    except IntegrityError as e:
        db.rollback()
        if "email" in str(e.orig).lower():
            raise HTTPException(
                status_code=409,
                detail="Employee with this email already exists"
            )
        raise HTTPException(
            status_code=409,
            detail="Database constraint violation"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to create employee"
        )

@app.get("/employees/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: int, db: Session = Depends(get_db)):
    """Get a specific employee by ID."""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@app.put("/employees/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: int,
    employee: EmployeeUpdate,
    db: Session = Depends(get_db)
):
    """
    Update an existing employee.
    
    Only fields provided in the request body will be updated.
    """
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    # Only update fields that were provided
    update_data = employee.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_employee, field, value)
    
    try:
        db.commit()
        db.refresh(db_employee)
        return db_employee
    except IntegrityError as e:
        db.rollback()
        if "email" in str(e.orig).lower():
            raise HTTPException(
                status_code=409,
                detail="Employee with this email already exists"
            )
        raise HTTPException(
            status_code=409,
            detail="Database constraint violation"
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to update employee"
        )

@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = Depends(get_db)):
    """Delete an employee by ID."""
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    
    try:
        db.delete(db_employee)
        db.commit()
        return {"message": "Employee deleted successfully", "id": employee_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to delete employee"
        )