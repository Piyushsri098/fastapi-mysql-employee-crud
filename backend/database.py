from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "mysql+pymysql://appuser:apppass@localhost:3306/employee_db"
)

# Create engine with connection pooling and optimizations
engine = create_engine(
    DATABASE_URL,
    pool_size=20,              # Number of connections to keep in the pool
    max_overflow=10,           # Max additional connections beyond pool_size
    pool_pre_ping=True,        # Test connections before using them
    pool_recycle=3600,         # Recycle connections after 1 hour
    echo=False,                # Set to True for SQL query logging
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)