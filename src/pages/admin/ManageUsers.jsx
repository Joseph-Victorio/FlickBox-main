import React, { useState, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import {
  FaTimes,
  FaEdit,
  FaTrash,
  FaUserPlus,
  FaBan,
  FaUserShield,
  FaUser,
  FaArrowLeft,
} from "react-icons/fa";
import { Link } from "react-router-dom";

const API_URL = "https://flickbox.my.id/api/users.php";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [newUserData, setNewUserData] = useState({
    username: "",
    email: "",
    phone: "",
    password_hash: "",
    age: "",
    role: "user",
    status: "active",
  });
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState({});

  const fetchUsers = async () => {
    const res = await fetch(API_URL);
    const data = await res.json();
    setUsers(data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewUserData((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));
  };

  const openAddModal = () => {
    setEditingUser(null);
    setNewUserData({
      username: "",
      email: "",
      phone: "",
      role: "user",
      status: "active",
      password_hash: "",
      age: "",
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setNewUserData({
      username: user.username,
      email: user.email,
      phone: user.phone || "",
      role: user.role,
      status: user.status,
      password_hash: "",
      age: user.age || "",
    });
    setFormErrors({});
    setShowFormModal(true);
  };

  const closeFormModal = () => setShowFormModal(false);

  const validateForm = () => {
    const errors = {};
    if (!(newUserData.username || "").trim())
      errors.username = "Username is required";
    if (!(newUserData.email || "").trim()) errors.email = "Email is required";
    if (!editingUser && !(newUserData.password_hash || "").trim()) {
      errors.password_hash = "Password is required";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddUser = async () => {
    if (!validateForm()) return;
    await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUserData),
    });
    fetchUsers();
    closeFormModal();
  };

  // Edit user
  const handleEditUser = async () => {
    if (!validateForm()) return;
    await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingUser.id, ...newUserData }),
    });
    fetchUsers();
    closeFormModal();
  };

  // Delete user
  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    await fetch(API_URL, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    fetchUsers();
  };

  // handle suspend
  const handleSuspendUser = async (user) => {
    const newStatus = user.status === "suspended" ? "active" : "suspended";
    const actionText = newStatus === "suspended" ? "Suspend" : "Unsuspend";

    if (!window.confirm(`${actionText} user: ${user.username}?`)) return;

    await fetch(API_URL, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        age: user.age,
        role: user.role,
        status: newStatus,
      }),
    });

    fetchUsers();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate("/admin")}
          className="flex items-center text-blue-400 hover:text-blue-300"
        >
          <FaArrowLeft className="mr-2" /> Back to Dashboard
        </button>
        <h1 className="md:text-3xl font-bold flex items-center">
          <FaUser className="mr-3 text-blue-400" />
          User Management
        </h1>
      </div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-white">User Management</h1>
        <div className="flex gap-2">
          <button
            onClick={openAddModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
          >
            <FaUserPlus /> Add User
          </button>
        </div>
      </div>

      {/* User Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border border-gray-700 text-white">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-4 py-2 border-b border-gray-700">Username</th>
              <th className="px-4 py-2 border-b border-gray-700">Email</th>
              <th className="px-4 py-2 border-b border-gray-700">Phone</th>
              <th className="px-4 py-2 border-b border-gray-700">Role</th>
              <th className="px-4 py-2 border-b border-gray-700">Status</th>
              <th className="px-4 py-2 border-b border-gray-700">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-700">
                <td className="px-4 py-2 border-b border-gray-700">
                  {user.username}
                </td>
                <td className="px-4 py-2 border-b border-gray-700">
                  {user.email}
                </td>
                <td className="px-4 py-2 border-b border-gray-700">
                  {user.phone}
                </td>

                {/* Role */}
                <td className="px-4 py-2 border-b border-gray-700">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                      user.role === "admin" ? "bg-red-600" : "bg-blue-600"
                    }`}
                  >
                    {user.role === "admin" && <FaUserShield />}
                    {user.role === "user" && <FaUser />}
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </td>

                {/* Status */}
                <td className="px-4 py-2 border-b border-gray-700">
                  <span
                    className={`px-2 py-1 rounded text-white text-xs ${
                      user.status === "active"
                        ? "bg-green-600"
                        : user.status === "inactive"
                        ? "bg-gray-600"
                        : user.status === "suspended"
                        ? "bg-red-600"
                        : "bg-yellow-600"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>

                <td className="px-4 py-2 border-b border-gray-700 flex gap-2">
                  <button
                    onClick={() => handleSuspendUser(user)}
                    className={`px-2 py-1 rounded text-white flex items-center gap-1 ${
                      user.status === "suspended"
                        ? "bg-green-600 hover:bg-green-700"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                    title={
                      user.status === "suspended"
                        ? "Unsuspend User"
                        : "Suspend User"
                    }
                  >
                    <FaBan />
                  </button>

                  <button
                    onClick={() => openEditModal(user)}
                    className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-white flex items-center gap-1"
                  >
                    <FaEdit />
                  </button>

                  <button
                    onClick={() => handleDeleteUser(user.id)}
                    className="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-white flex items-center gap-1"
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Form Modal */}
      {showFormModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-2xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-scroll">
            <div className="p-6 border-b border-gray-700 flex justify-between items-center">
              <h2 className="text-xl font-bold">
                {editingUser ? "Edit User" : "Add New User"}
              </h2>
              <button
                onClick={closeFormModal}
                className="text-gray-400 hover:text-white"
              >
                <FaTimes />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-gray-400 mb-2">Username *</label>
                <input
                  type="text"
                  name="username"
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  value={newUserData.username}
                  onChange={handleInputChange}
                />
                {formErrors.username && (
                  <p className="text-red-400 text-sm mt-1">
                    {formErrors.username}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Email *</label>
                <input
                  type="email"
                  name="email"
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  value={newUserData.email}
                  onChange={handleInputChange}
                />
                {formErrors.email && (
                  <p className="text-red-400 text-sm mt-1">
                    {formErrors.email}
                  </p>
                )}
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-gray-400 mb-2">Password *</label>
                  <input
                    type="password"
                    name="password_hash"
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                    value={newUserData.password_hash}
                    onChange={handleInputChange}
                  />
                  {formErrors.password_hash && (
                    <p className="text-red-400 text-sm mt-1">
                      {formErrors.password_hash}
                    </p>
                  )}
                </div>
              )}

              <div>
                <label className="block text-gray-400 mb-2">Phone</label>
                <input
                  type="text"
                  name="phone"
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  value={newUserData.phone}
                  onChange={handleInputChange}
                />
              </div>

              <div>
                <label className="block text-gray-400 mb-2">Age</label>
                <input
                  type="number"
                  name="age"
                  className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                  value={newUserData.age}
                  onChange={handleInputChange}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 mb-2">Role</label>
                  <select
                    name="role"
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                    value={newUserData.role}
                    onChange={handleInputChange}
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 mb-2">Status</label>
                  <select
                    name="status"
                    className="w-full bg-gray-700 text-white px-3 py-2 rounded-lg"
                    value={newUserData.status}
                    onChange={handleInputChange}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  onClick={closeFormModal}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={editingUser ? handleEditUser : handleAddUser}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg"
                >
                  {editingUser ? "Update User" : "Add User"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
