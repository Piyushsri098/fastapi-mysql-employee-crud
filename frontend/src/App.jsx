import { useEffect, useState, useRef } from 'react'
import { getEmployees, getEmployeesCount, createEmployee, updateEmployee, deleteEmployee } from './api'
import './App.css'

const ITEMS_PER_PAGE = 10

function App() {
  const [employees, setEmployees] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [currentPage, setCurrentPage] = useState(0)
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    department: '',
    salary: '',
  })
  const [editingId, setEditingId] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeletingId, setIsDeletingId] = useState(null)
  const submitTimeoutRef = useRef(null)

  useEffect(() => {
    fetchEmployees()
    fetchEmployeeCount()
  }, [currentPage])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current)
      }
    }
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const skip = currentPage * ITEMS_PER_PAGE
      const data = await getEmployees(skip, ITEMS_PER_PAGE)
      setEmployees(data)
      setError(null)
    } catch (err) {
      setError('Failed to load employees: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchEmployeeCount = async () => {
    try {
      const data = await getEmployeesCount()
      setTotalCount(data.total)
    } catch (err) {
      console.error('Failed to fetch employee count:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Prevent double submission
    if (isSubmitting) return
    
    try {
      setIsSubmitting(true)
      setError(null)

      if (editingId) {
        // Update existing employee - optimistic update
        const updatedEmployee = { ...formData, id: editingId }
        const optimisticEmployees = employees.map(emp =>
          emp.id === editingId ? updatedEmployee : emp
        )
        setEmployees(optimisticEmployees)
        
        try {
          await updateEmployee(editingId, formData)
          setEditingId(null)
        } catch (err) {
          // Revert on error
          fetchEmployees()
          throw err
        }
      } else {
        // Create new employee
        const newEmployee = await createEmployee(formData)
        
        // Optimistic update: add to list if there's space
        if (employees.length < ITEMS_PER_PAGE) {
          setEmployees([...employees, newEmployee])
        }
        
        // Update total count
        setTotalCount(totalCount + 1)
      }

      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        department: '',
        salary: '',
      })
    } catch (err) {
      setError('Failed to save employee: ' + err.response?.data?.detail || err.message)
      console.error(err)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEdit = (employee) => {
    setFormData({
      first_name: employee.first_name,
      last_name: employee.last_name,
      email: employee.email,
      department: employee.department,
      salary: employee.salary,
    })
    setEditingId(employee.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        setIsDeletingId(id)
        setError(null)
        
        // Optimistic update: remove from list
        const updatedEmployees = employees.filter(emp => emp.id !== id)
        setEmployees(updatedEmployees)
        setTotalCount(totalCount - 1)
        
        try {
          await deleteEmployee(id)
        } catch (err) {
          // Revert on error
          fetchEmployees()
          fetchEmployeeCount()
          throw err
        }
      } catch (err) {
        setError('Failed to delete employee: ' + err.response?.data?.detail || err.message)
        console.error(err)
      } finally {
        setIsDeletingId(null)
      }
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      department: '',
      salary: '',
    })
  }

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  return (
    <div className="container">
      <h1>Employee Manager</h1>

      {error && <div className="error">{error}</div>}

      <form onSubmit={handleSubmit} className="form">
        <input
          type="text"
          name="first_name"
          placeholder="First Name"
          value={formData.first_name}
          onChange={handleInputChange}
          required
          disabled={isSubmitting}
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleInputChange}
          required
          disabled={isSubmitting}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
          disabled={isSubmitting}
        />
        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleInputChange}
          required
          disabled={isSubmitting}
        />
        <input
          type="number"
          name="salary"
          placeholder="Salary"
          value={formData.salary}
          onChange={handleInputChange}
          required
          disabled={isSubmitting}
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? 'Saving...'
            : editingId
            ? 'Update Employee'
            : 'Add Employee'}
        </button>
        {editingId && (
          <button
            type="button"
            onClick={handleCancel}
            className="cancel-btn"
            disabled={isSubmitting}
          >
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <div className="loading">Loading employees...</div>
      ) : (
        <div className="employees-list">
          <h2>Employees (Total: {totalCount})</h2>
          {employees.length === 0 ? (
            <p>No employees found.</p>
          ) : (
            <>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Department</th>
                    <th>Salary</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((employee) => (
                    <tr key={employee.id} className={isDeletingId === employee.id ? 'deleting' : ''}>
                      <td>{employee.id}</td>
                      <td>
                        {employee.first_name} {employee.last_name}
                      </td>
                      <td>{employee.email}</td>
                      <td>{employee.department}</td>
                      <td>${parseFloat(employee.salary).toFixed(2)}</td>
                      <td>
                        <button
                          onClick={() => handleEdit(employee)}
                          className="edit-btn"
                          disabled={isSubmitting || isDeletingId === employee.id}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="delete-btn"
                          disabled={isSubmitting || isDeletingId === employee.id}
                        >
                          {isDeletingId === employee.id ? 'Deleting...' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
                    disabled={currentPage === 0 || loading}
                  >
                    Previous
                  </button>
                  <span>
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages - 1, currentPage + 1))}
                    disabled={currentPage === totalPages - 1 || loading}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default App