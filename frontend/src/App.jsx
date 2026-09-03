import { useEffect, useState } from 'react'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee } from './api'
import './App.css'

function App() {
  const [employees, setEmployees] = useState([])
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

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    try {
      setLoading(true)
      const data = await getEmployees()
      setEmployees(data)
      setError(null)
    } catch (err) {
      setError('Failed to load employees: ' + err.message)
      console.error(err)
    } finally {
      setLoading(false)
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
    try {
      if (editingId) {
        await updateEmployee(editingId, formData)
        setEditingId(null)
      } else {
        await createEmployee(formData)
      }
      setFormData({
        first_name: '',
        last_name: '',
        email: '',
        department: '',
        salary: '',
      })
      fetchEmployees()
    } catch (err) {
      setError('Failed to save employee: ' + err.message)
      console.error(err)
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
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      try {
        await deleteEmployee(id)
        fetchEmployees()
      } catch (err) {
        setError('Failed to delete employee: ' + err.message)
        console.error(err)
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
        />
        <input
          type="text"
          name="last_name"
          placeholder="Last Name"
          value={formData.last_name}
          onChange={handleInputChange}
          required
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          required
        />
        <input
          type="text"
          name="department"
          placeholder="Department"
          value={formData.department}
          onChange={handleInputChange}
          required
        />
        <input
          type="number"
          name="salary"
          placeholder="Salary"
          value={formData.salary}
          onChange={handleInputChange}
          required
        />
        <button type="submit">
          {editingId ? 'Update Employee' : 'Add Employee'}
        </button>
        {editingId && (
          <button type="button" onClick={handleCancel} className="cancel-btn">
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <div className="loading">Loading employees...</div>
      ) : (
        <div className="employees-list">
          <h2>Employees ({employees.length})</h2>
          {employees.length === 0 ? (
            <p>No employees found.</p>
          ) : (
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
                  <tr key={employee.id}>
                    <td>{employee.id}</td>
                    <td>
                      {employee.first_name} {employee.last_name}
                    </td>
                    <td>{employee.email}</td>
                    <td>{employee.department}</td>
                    <td>${employee.salary.toFixed(2)}</td>
                    <td>
                      <button
                        onClick={() => handleEdit(employee)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(employee.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

export default App
