import React, { useEffect, useState } from 'react';
import { Search, Trash2, UserX, UserCheck, Mail, Phone } from 'lucide-react';
import Swal from 'sweetalert2';

const getInitials = (name) => {
  if (!name) return '?';
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const avatarColors = ['bg-blue-200 text-blue-800', 'bg-green-200 text-green-800', 'bg-purple-200 text-purple-800', 'bg-red-200 text-red-800', 'bg-yellow-200 text-yellow-800'];

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm) ||
    user.id.toString().includes(searchTerm)
  );

  useEffect(() => {
    const fetchUsers = async () => {
      const apiUrl = 'http://localhost:8305/api/users';
      try {
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error('Failed to fetch users');
        const data = await response.json();
        
        // Filter only users with role = 'user'
        const usersOnly = data.filter(u => u.role === 'user');
        
        setUsers(usersOnly.map(u => ({
          ...u,
          status: u.blockStatus === 'yes' ? 'Blocked' : 'Active',
          id: u.userId, // Map userId to id for compatibility
          name: u.fullName
        })));
      } catch (err) {
        setError(err.message);
        Swal.fire('Error', err.message, 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const blockUserInBackend = async (userId, reason) => {
    try {
      const response = await fetch(`http://localhost:8305/api/users/${userId}/block`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comments: reason })
      });
      if (!response.ok) throw new Error('Failed to block user');
      setUsers(users => users.map(u => u.id === userId ? { ...u, status: 'Blocked', blockStatus: 'yes', comments: reason } : u));
    } catch (err) {
      Swal.fire('Error', err.message, 'error');
    }
  };

  const unblockUserInBackend = async (userId) => {
    try {
      console.log('Unblock request for userId:', userId);
      const token = sessionStorage.getItem('jwtToken') || 'static-admin-token';
      console.log('Unblock using token:', token);
      const response = await fetch(`http://localhost:8305/api/users/${userId}/unblock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Unblock response status:', response.status);
      console.log('Unblock response headers:', Array.from(response.headers.entries()));
      const errorText = await response.text();
      console.log('Unblock error response:', errorText);
      if (!response.ok) {
        throw new Error('Failed to unblock user: ' + errorText);
      }
      setUsers(users => users.map(u => u.id === userId ? { ...u, status: 'Active', blockStatus: 'no', comments: 'no comments' } : u));
    } catch (err) {
      console.error('UnblockUserInBackend error:', err);
      Swal.fire('Error', err.message, 'error');
    }
  };

  const updateUser = (userId, status, reason) => {
    if (status === 'Blocked') {
      blockUserInBackend(userId, reason);
    } else if (status === 'Active') {
      unblockUserInBackend(userId);
    } else {
      setUsers(users.map(u =>
        u.id === userId
          ? { ...u, status, blockStatus: 'no', comments: 'no comments' }
          : u
      ));
    }
    const user = users.find(u => u.id === userId);
    Swal.fire({
      icon: 'success',
      title: `${status}!`,
      text: `${user.name} has been ${status.toLowerCase()}.`,
      timer: 2000,
      showConfirmButton: false
    });
  };

  const handleBlockUser = (userId) => {
    const user = users.find(u => u.id === userId);
    Swal.fire({
      title: `Block ${user.name}`,
      text: 'Please select a reason for blocking this user:',
      input: 'select',
      inputOptions: {
        'Misbehaved with Driver': 'Misbehaved with Driver',
        'Violated Terms of Service': 'Violated Terms of Service',
        'Payment Issues': 'Payment Issues',
        'Other': 'Other (specify reason)'
      },
      inputPlaceholder: 'Select a reason',
      showCancelButton: true,
      confirmButtonText: 'Next &rarr;',
      confirmButtonColor: '#ef4444', // red-500
      cancelButtonColor: '#6b7280', // gray-500
      customClass: { popup: 'rounded-xl shadow-lg', input: 'mt-4' },
      inputValidator: (value) => !value && 'You need to select a reason!'
    }).then((result) => {
      if (!result.isConfirmed) return;

      if (result.value === 'Other') {
        Swal.fire({
          title: 'Specify Reason for Blocking',
          input: 'textarea',
          inputPlaceholder: 'Enter the specific reason here...',
          showCancelButton: true,
          confirmButtonText: 'Block User',
          confirmButtonColor: '#ef4444',
          cancelButtonColor: '#6b7280',
          customClass: { popup: 'rounded-xl shadow-lg', input: 'h-24' },
          inputValidator: (value) => !value && 'You must provide a reason!'
        }).then((textResult) => {
          if (textResult.isConfirmed && textResult.value) {
            updateUser(userId, 'Blocked', textResult.value);
          }
        });
      } else {
        updateUser(userId, 'Blocked', result.value);
      }
    });
  };

  const handleUnblockUser = (userId) => {
    const user = users.find(u => u.id === userId);
    Swal.fire({
      title: `Unblock ${user.name}?`,
      text: "This will allow the user to access the service again.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981', // green-500
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Yes, Unblock'
    }).then((result) => {
      if (result.isConfirmed) {
        updateUser(userId, 'Active', undefined);
      }
    });
  };

  const handleDelete = async (userId) => {
    const user = users.find(u => u.id === userId);
    const result = await Swal.fire({
      title: `Delete ${user.name}?`,
      text: 'Are you sure you want to delete this user? This action is permanent.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#6b7280',
      customClass: { popup: 'rounded-xl shadow-lg' }
    });
    if (result.isConfirmed) {
      try {
        const response = await fetch(`http://localhost:8305/admin/user/${userId}`, {
          method: 'DELETE'
        });
        if (!response.ok) throw new Error('Failed to delete user');
        setUsers(users.filter(u => u.id !== userId));
        Swal.fire({
          icon: 'success',
          title: 'Deleted!',
          text: `${user.name} has been permanently deleted.`,
          timer: 2000,
          showConfirmButton: false
        });
      } catch (err) {
        Swal.fire('Error', err.message, 'error');
      }
    }
  };

  if (loading) return <div className="p-6 text-center text-gray-500">Loading users...</div>;
  if (error) return <div className="p-6 text-center text-red-500">{error}</div>;

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-800">Manage Users</h3>
          <div className="text-sm text-gray-500">
            Total Users: {users.length} | Showing: {filteredUsers.length}
          </div>
        </div>
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search users by name, email, phone, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr className="text-sm text-gray-600 uppercase tracking-wider">
              <th className="p-4 font-medium">Name</th>
              <th className="p-4 font-medium">Contact</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Comments</th>
              <th className="p-4 font-medium text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredUsers.map((user, index) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 font-bold ${avatarColors[index % avatarColors.length]}`}>
                      {getInitials(user.name)}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800">{user.name}</div>
                      <div className="text-sm text-gray-500 font-mono">ID: {user.id}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center text-sm text-gray-700 mb-1">
                    <Mail size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                    <span className="truncate">{user.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-700">
                    <Phone size={14} className="mr-2 text-gray-400 flex-shrink-0" />
                    <span>{user.phone}</span>
                  </div>
                </td>
                <td className="p-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    user.blockStatus === 'yes' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                  }`}>
                    {user.blockStatus === 'yes' ? 'Blocked' : 'Active'}
                  </span>
                  {user.blockStatus === 'yes' && user.comments && (
                    <p className="text-xs text-gray-500 mt-1 italic" title={user.comments}>
                      Reason: <span className="truncate">{user.comments}</span>
                    </p>
                  )}
                </td>
                <td className="p-4">
                  <span className="text-sm text-gray-700">{user.comments}</span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center space-x-2">
                    {user.blockStatus === 'yes' || user.status === 'Blocked' ? (
                      <button onClick={() => handleUnblockUser(user.id)} className="p-2 rounded-full text-green-600 hover:bg-green-100 transition-colors" title="Unblock User">
                        <UserCheck size={18} />
                      </button>
                    ) : (
                      <button onClick={() => handleBlockUser(user.id)} className="p-2 rounded-full text-yellow-600 hover:bg-yellow-100 transition-colors" title="Block User">
                        <UserX size={18} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="p-2 rounded-full text-red-600 hover:bg-red-100 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredUsers.length === 0 && users.length > 0 && (
              <tr><td colSpan="5" className="text-center p-8 text-gray-500">No users match your search criteria.</td></tr>
            )}
            {users.length === 0 && (
              <tr><td colSpan="5" className="text-center p-8 text-gray-500">No users found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Users;