import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import {
  Users,
  Search,
  Plus,
  Edit,
  Eye,
  RefreshCw,
  Shield,
  GraduationCap,
  BookOpen,
  Trash2,
  Lock,
  Unlock,
  Key
} from 'lucide-react';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin' | 'super_admin';
  department?: string;
  year?: string;
  roll_no?: string;
  employee_id?: string;
  phone?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
}

const UserManagement: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<User>>({});
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student' as User['role'],
    department: '',
    phone: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (roleFilter) params.append('role', roleFilter);
      if (searchTerm) params.append('search', searchTerm);
      params.append('page', '1');
      params.append('limit', '50');

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found. Please login again.');
      }

      const url = `http://192.160.108.56:5010/api/users?${params.toString()}`;
      console.log('Fetching users from:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Authentication failed. Please login again.');
        } else if (response.status === 403) {
          throw new Error('Access denied. Admin privileges required.');
        } else if (response.status === 404) {
          throw new Error('API endpoint not found. Check backend configuration.');
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const data = await response.json();
      console.log('Users data received:', data);

      // Check if the response has the expected structure
      if (data.users && Array.isArray(data.users)) {
        setUsers(data.users);
      } else if (Array.isArray(data)) {
        // Handle case where response is directly an array
        setUsers(data);
      } else {
        console.warn('Unexpected response structure:', data);
        setUsers([]);
      }
    } catch (err: any) {
      console.error('Error fetching users:', err);

      if (err.message.includes('Failed to fetch') || err.name === 'TypeError') {
        setError('Cannot connect to server. Please check if the backend is running on http://192.160.108.56:5010');
      } else {
        setError(err.message || 'An unexpected error occurred while fetching users.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Read URL parameters on mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    if (roleParam) {
      setRoleFilter(roleParam);
    }
  }, []);

  useEffect(() => {
    if (currentUser && ['admin', 'super_admin'].includes(currentUser.role)) {
      fetchUsers();
    }
  }, [currentUser, roleFilter, searchTerm]);

  // Test backend connection on component mount
  useEffect(() => {
    const testConnection = async () => {
      try {
        // Use the correct health endpoint from API_ENDPOINTS
        const healthData = await fetch('http://192.160.108.56:5010/api/health', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        });

        if (healthData.ok) {
          const data = await healthData.json();
          console.log('Backend connection successful:', data.message);
        } else {
          throw new Error(`Health check failed: ${healthData.status}`);
        }
      } catch (err) {
        console.error('Backend connection failed:', err);
        setError('Cannot connect to backend server. Please ensure it is running on http://192.160.108.56:5010');
      }
    };

    if (currentUser && ['admin', 'super_admin'].includes(currentUser.role)) {
      testConnection();
    }
  }, [currentUser]);

  const handleUserAction = async (userId: string, action: 'activate' | 'deactivate') => {
    if (!confirm(`Are you sure you want to ${action} this user?`)) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const url = `http://192.160.108.56:5010/api/users/${userId}/${action}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const result = await response.json();
        await fetchUsers(); // Refresh the user list
        alert(result.message || `User ${action}d successfully`);
      } else {
        let errorMessage = `Failed to ${action} user`;

        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (response.status === 400) {
          errorMessage = 'Cannot perform this action on the selected user.';
        } else if (response.status === 404) {
          errorMessage = 'User not found.';
        } else {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = `Server error (${response.status})`;
          }
        }

        alert(errorMessage);
      }
    } catch (err: any) {
      console.error(`Error ${action}ing user:`, err);
      alert(`Error: Cannot connect to server. Please check if the backend is running.`);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (!confirm(`Are you sure you want to DELETE user "${userName}"? This action cannot be undone!`)) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const url = `http://192.160.108.56:5010/api/users/${userId}`;
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        await fetchUsers(); // Refresh the user list
        alert('User deleted successfully');
      } else {
        let errorMessage = 'Failed to delete user';

        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Super admin privileges required.';
        } else if (response.status === 404) {
          errorMessage = 'User not found.';
        } else {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = `Server error (${response.status})`;
          }
        }

        alert(errorMessage);
      }
    } catch (err: any) {
      console.error('Error deleting user:', err);
      alert(`Error: Cannot connect to server. Please check if the backend is running.`);
    }
  };

  const handleResetPassword = async (userId: string, userName: string) => {
    const newPassword = prompt(`Enter new password for ${userName}:`);
    if (!newPassword) return;

    if (newPassword.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const url = `http://192.160.108.56:5010/api/users/${userId}/reset-password`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ new_password: newPassword })
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.message || 'Password reset successfully');
      } else {
        let errorMessage = 'Failed to reset password';

        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (response.status === 404) {
          errorMessage = 'User not found.';
        } else {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = `Server error (${response.status})`;
          }
        }

        alert(errorMessage);
      }
    } catch (err: any) {
      console.error('Error resetting password:', err);
      alert(`Error: Cannot connect to server. Please check if the backend is running.`);
    }
  };

  const handleEditUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const response = await fetch(`http://192.160.108.56:5010/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data.user);
        setEditFormData({
          name: data.user.name,
          email: data.user.email,
          role: data.user.role,
          department: data.user.department || '',
          phone: data.user.phone || '',
          is_active: data.user.is_active
        });
        setShowEditModal(true);
      } else {
        let errorMessage = 'Failed to fetch user details';
        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (response.status === 404) {
          errorMessage = 'User not found.';
        }
        alert(errorMessage);
      }
    } catch (err: any) {
      console.error('Error fetching user details:', err);
      alert('Error: Cannot connect to server. Please check if the backend is running.');
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const response = await fetch(`http://192.160.108.56:5010/api/users/${selectedUser._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(editFormData)
      });

      if (response.ok) {
        const result = await response.json();
        setShowEditModal(false);
        setSelectedUser(null);
        setEditFormData({});
        await fetchUsers(); // Refresh the user list
        alert(result.message || 'User updated successfully');
      } else {
        let errorMessage = 'Failed to update user';
        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (response.status === 404) {
          errorMessage = 'User not found.';
        } else {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = `Server error (${response.status})`;
          }
        }
        alert(errorMessage);
      }
    } catch (err: any) {
      console.error('Error updating user:', err);
      alert('Error: Cannot connect to server. Please check if the backend is running.');
    }
  };

  const handleAddUser = async () => {
    // Validate form
    if (!addFormData.name || !addFormData.email || !addFormData.password) {
      alert('Please fill in all required fields (Name, Email, Password)');
      return;
    }

    if (addFormData.password.length < 8) {
      alert('Password must be at least 8 characters long');
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const response = await fetch('http://192.160.108.56:5010/api/users', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(addFormData)
      });

      if (response.ok) {
        const result = await response.json();
        setShowAddModal(false);
        setAddFormData({
          name: '',
          email: '',
          password: '',
          role: 'student',
          department: '',
          phone: ''
        });
        await fetchUsers(); // Refresh the user list
        alert(result.message || 'User created successfully');
      } else {
        let errorMessage = 'Failed to create user';
        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (response.status === 400) {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || 'Invalid user data';
          } catch {
            errorMessage = 'Invalid user data';
          }
        } else {
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorMessage;
          } catch {
            errorMessage = `Server error (${response.status})`;
          }
        }
        alert(errorMessage);
      }
    } catch (err: any) {
      console.error('Error creating user:', err);
      alert('Error: Cannot connect to server. Please check if the backend is running.');
    }
  };

  const handleViewUser = async (userId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        alert('Authentication token not found. Please login again.');
        return;
      }

      const response = await fetch(`http://192.160.108.56:5010/api/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedUser(data.user);
        setShowUserModal(true);
      } else {
        let errorMessage = 'Failed to fetch user details';
        if (response.status === 401) {
          errorMessage = 'Authentication failed. Please login again.';
        } else if (response.status === 403) {
          errorMessage = 'Access denied. Admin privileges required.';
        } else if (response.status === 404) {
          errorMessage = 'User not found.';
        }
        alert(errorMessage);
      }
    } catch (err: any) {
      console.error('Error fetching user details:', err);
      alert('Error: Cannot connect to server. Please check if the backend is running.');
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <GraduationCap className="h-4 w-4 text-blue-600" />;
      case 'teacher': return <BookOpen className="h-4 w-4 text-green-600" />;
      case 'admin': return <Shield className="h-4 w-4 text-orange-600" />;
      case 'super_admin': return <Shield className="h-4 w-4 text-purple-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-orange-100 text-orange-800';
      case 'super_admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentUser || !['admin', 'super_admin'].includes(currentUser.role)) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-800">Access denied. Admin privileges required.</p>
          <div className="mt-2 text-sm text-red-600">
            <p>Current user role: {currentUser?.role || 'Not logged in'}</p>
            <p>Token exists: {localStorage.getItem('access_token') ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => {
              window.history.pushState({}, '', '/dashboard');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="flex items-center px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Dashboard
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600">Manage all users, roles, and permissions</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={async () => {
              try {
                const response = await fetch('http://192.160.108.56:5010/api/health', {
                  method: 'GET',
                  headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                  }
                });

                if (response.ok) {
                  const data = await response.json();
                  alert(`Backend Status: ${data.status}\nMessage: ${data.message}\nTimestamp: ${data.timestamp}`);
                } else {
                  alert(`Backend connection failed: HTTP ${response.status}`);
                }
              } catch (err: any) {
                alert(`Backend connection failed: ${err.message || 'Cannot reach server'}`);
              }
            }}
            className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            Test Connection
          </button>
          <button 
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add User
          </button>
        </div>
      </div>



      {/* User Statistics */}
      {!loading && !error && users.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Students</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'student').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-green-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Teachers</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => u.role === 'teacher').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow border">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-600" />
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-500">Admins</p>
                <p className="text-2xl font-bold text-gray-900">
                  {users.filter(u => ['admin', 'super_admin'].includes(u.role)).length}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow border">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="admin">Admins</option>
            <option value="super_admin">Super Admins</option>
          </select>
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow border overflow-hidden">
        {error && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-800 font-medium">{error}</p>
                {error.includes('Cannot connect to server') && (
                  <div className="mt-2 text-sm text-red-700">
                    <p className="font-medium">To start the backend server:</p>
                    <ol className="list-decimal list-inside mt-1 space-y-1">
                      <li>Open a terminal in the <code className="bg-red-100 px-1 rounded">backend</code> directory</li>
                      <li>Install dependencies: <code className="bg-red-100 px-1 rounded">pip install -r requirements.txt</code></li>
                      <li>Start the server: <code className="bg-red-100 px-1 rounded">python run.py</code></li>
                      <li>Ensure MongoDB is running (required for the backend)</li>
                      <li>Server should start on <code className="bg-red-100 px-1 rounded">http://192.160.108.56:5010</code></li>
                    </ol>
                  </div>
                )}
              </div>
              <button
                onClick={fetchUsers}
                className="text-red-600 hover:text-red-800 text-sm underline"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div className="p-8 text-center">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
            <p className="text-gray-600">Loading users...</p>
            <p className="text-sm text-gray-500 mt-1">This may take a few seconds</p>
          </div>
        )}

        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No users found. {searchTerm || roleFilter ? 'Try adjusting your search criteria.' : 'Start by adding some users.'}
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <span className="text-sm font-medium text-gray-700">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {getRoleIcon(user.role)}
                          <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(user.role)}`}>
                            {user.role.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {user.department || 'N/A'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                          {user.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleViewUser(user._id)}
                            className="p-1 text-blue-600 hover:text-blue-900 hover:bg-blue-50 rounded"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user._id)}
                            className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                            title="Edit User"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleResetPassword(user._id, user.name)}
                            className="p-1 text-orange-600 hover:text-orange-900 hover:bg-orange-50 rounded"
                            title="Reset Password"
                          >
                            <Key className="h-4 w-4" />
                          </button>
                          {currentUser?._id !== user._id && (
                            user.is_active ? (
                              <button
                                onClick={() => handleUserAction(user._id, 'deactivate')}
                                className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                                title="Block/Deactivate User"
                              >
                                <Lock className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => handleUserAction(user._id, 'activate')}
                                className="p-1 text-green-600 hover:text-green-900 hover:bg-green-50 rounded"
                                title="Unblock/Activate User"
                              >
                                <Unlock className="h-4 w-4" />
                              </button>
                            )
                          )}
                          {currentUser?.role === 'super_admin' && currentUser?._id !== user._id && (
                            <button
                              onClick={() => handleDeleteUser(user._id, user.name)}
                              className="p-1 text-red-700 hover:text-red-900 hover:bg-red-50 rounded"
                              title="Delete User (Super Admin Only)"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* User Detail Modal */}
      {showUserModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">User Details</h2>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xl font-medium text-gray-700">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{selectedUser.name}</h3>
                  <p className="text-gray-600">{selectedUser.email}</p>
                  <div className="flex items-center mt-1">
                    {getRoleIcon(selectedUser.role)}
                    <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${selectedUser.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {selectedUser.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                {selectedUser.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-gray-900">{selectedUser.phone}</p>
                  </div>
                )}
                
                {selectedUser.department && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <p className="text-gray-900">{selectedUser.department}</p>
                  </div>
                )}
                
                {selectedUser.roll_no && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Roll Number</label>
                    <p className="text-gray-900">{selectedUser.roll_no}</p>
                  </div>
                )}
                
                {selectedUser.employee_id && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employee ID</label>
                    <p className="text-gray-900">{selectedUser.employee_id}</p>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created At</label>
                  <p className="text-gray-900">{new Date(selectedUser.created_at).toLocaleDateString()}</p>
                </div>
                
                {selectedUser.last_login && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Login</label>
                    <p className="text-gray-900">{new Date(selectedUser.last_login).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {/* Role-specific information */}
              {selectedUser.role === 'student' && selectedUser.enrolled_courses_details && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enrolled Courses</label>
                  <div className="space-y-2">
                    {selectedUser.enrolled_courses_details.length > 0 ? (
                      selectedUser.enrolled_courses_details.map((course: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-gray-600">Progress: {course.progress}%</p>
                          <p className="text-sm text-gray-600">Enrolled: {new Date(course.enrolled_at).toLocaleDateString()}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No courses enrolled</p>
                    )}
                  </div>
                </div>
              )}

              {selectedUser.role === 'teacher' && selectedUser.created_courses_details && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Created Courses</label>
                  <div className="space-y-2">
                    {selectedUser.created_courses_details.length > 0 ? (
                      selectedUser.created_courses_details.map((course: any, index: number) => (
                        <div key={index} className="bg-gray-50 p-3 rounded-lg">
                          <p className="font-medium">{course.title}</p>
                          <p className="text-sm text-gray-600">Students: {course.enrolled_students}</p>
                          <p className="text-sm text-gray-600">Created: {new Date(course.created_at).toLocaleDateString()}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500">No courses created</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setShowUserModal(false);
                  setSelectedUser(null);
                  handleEditUser(selectedUser._id);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Edit User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Edit User</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  setEditFormData({});
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  value={editFormData.name || ''}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editFormData.email || ''}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={editFormData.role || ''}
                  onChange={(e) => setEditFormData({...editFormData, role: e.target.value as User['role']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={editFormData.department || ''}
                  onChange={(e) => setEditFormData({...editFormData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={editFormData.phone || ''}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editFormData.is_active || false}
                  onChange={(e) => setEditFormData({...editFormData, is_active: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Active User
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                  setEditFormData({});
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Update User
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'student',
                    department: '',
                    phone: ''
                  });
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({...addFormData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter full name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({...addFormData, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="user@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  value={addFormData.password}
                  onChange={(e) => setAddFormData({...addFormData, password: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Minimum 8 characters"
                />
                <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select
                  value={addFormData.role}
                  onChange={(e) => setAddFormData({...addFormData, role: e.target.value as User['role']})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={addFormData.department}
                  onChange={(e) => setAddFormData({...addFormData, department: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Computer Science"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="text"
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData({...addFormData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Phone number"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setAddFormData({
                    name: '',
                    email: '',
                    password: '',
                    role: 'student',
                    department: '',
                    phone: ''
                  });
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddUser}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Create User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;