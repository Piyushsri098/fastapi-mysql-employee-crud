from sqlalchemy import Column, Integer, String, Float, DateTime, Index
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    department = Column(String(100), nullable=False)
    salary = Column(Float, nullable=False)
    hire_date = Column(DateTime, default=datetime.utcnow)

    # Define indexes for better query performance
    __table_args__ = (
        Index('idx_email', 'email'),
        Index('idx_department', 'department'),
        Index('idx_hire_date', 'hire_date'),
    )