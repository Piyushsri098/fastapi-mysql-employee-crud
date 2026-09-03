from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
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
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Employee Manager API", "docs": "/docs"}

@app.get("/employees", response_model=list[EmployeeResponse])
def get_employees(db: Session = None):
    if db is None:
        db = SessionLocal()
    employees = db.query(Employee).all()
    return employees

@app.post("/employees", response_model=EmployeeResponse)
def create_employee(employee: EmployeeCreate, db: Session = None):
    if db is None:
        db = SessionLocal()
    db_employee = Employee(**employee.dict())
    db.add(db_employee)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@app.get("/employees/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: int, db: Session = None):
    if db is None:
        db = SessionLocal()
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    return employee

@app.put("/employees/{employee_id}", response_model=EmployeeResponse)
def update_employee(employee_id: int, employee: EmployeeUpdate, db: Session = None):
    if db is None:
        db = SessionLocal()
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    for field, value in employee.dict(exclude_unset=True).items():
        setattr(db_employee, field, value)
    db.commit()
    db.refresh(db_employee)
    return db_employee

@app.delete("/employees/{employee_id}")
def delete_employee(employee_id: int, db: Session = None):
    if db is None:
        db = SessionLocal()
    db_employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not db_employee:
        raise HTTPException(status_code=404, detail="Employee not found")
    db.delete(db_employee)
    db.commit()
    return {"message": "Employee deleted"}
