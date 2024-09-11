import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { BiEdit, BiTrash } from "react-icons/bi";
import { FaTimes } from "react-icons/fa";
import { useUsersHook } from "../../hooks/useUsers";
import axios from "../../api/axios";
import { app } from "../../firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { useDispatch, useSelector } from "react-redux";
import {
  updateFailure,
  updateStart,
  updateSuccess,
} from "../../app/user/userSlice";

const UsersPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data;
  const dispatch = useDispatch();
  const { users, loading: userLoading, error: userError } = useUsersHook();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profile_image: null,
  });

  const [searchQuery, setSearchQuery] = useState("");

  const handleEdit = (id) => {
    const user = users.find((user) => user._id === id);
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      profile_image: user.profile_image,
    });
    setImagePreview(user.profile_image);
    setIsEdit(true);
    document.body.style.overflow = "hidden";
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    const storage = getStorage(app);
    if (file) {
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, `profiles/${fileName}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setFilePerc(Math.ceil(progress));
        },
        (error) => {
          console.error("Upload error:", error);
          setFileUploadError(true);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setImagePreview(downloadURL);
            setFormData((prevData) => ({
              ...prevData,
              profile_image: downloadURL,
            }));
            setFilePerc(0);
            setFileUploadError(false);
          });
        }
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedUser?._id === user?._id) {
      dispatch(updateStart());
    }
    setLoading(true);
    try {
      const response = await axios.put(
        `/users/${selectedUser?._id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      const data = response.data;
      if (selectedUser?._id === user?._id) {
        dispatch(updateSuccess(data));
      }
      setLoading(false);
      handleCloseModal();
    } catch (error) {
      if (selectedUser?._id === user?._id) {
        dispatch(updateFailure(error?.response?.data?.message));
      }
      setLoading(false);
      setError(error?.response?.data?.message);
      console.error("Error updating user:", error);
    }
  };

  const handleDelete = (id) => {
    setSelectedUser(users.find((user) => user._id === id));
    setIsDelete(true);
    document.body.style.overflow = "hidden";
  };

  const handleConfirmDelete = async () => {
    const id = selectedUser._id;
    setLoading(true);
    try {
      await axios.delete(`/users/${id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      setLoading(false);
      handleCloseModal();
    } catch (error) {
      setLoading(false);
      setError(error?.response?.data?.message);
      console.error("Error deleting user:", error);
    }
  };

  const handleCloseModal = () => {
    setIsEdit(false);
    setIsDelete(false);
    setSelectedUser(null);
    document.body.style.overflow = "auto";
  };

  const sortedUsers = users.sort((a, b) => a?.role?.localeCompare(b?.role));

  const filteredUsers = sortedUsers.filter(
    (user) =>
      user._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout page="users">
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">Users</h2>
        <div className="bg-white p-4 rounded shadow-md">
          <input
            type="text"
            placeholder="Search by ID, name, or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-4 p-2 border rounded w-full"
          />
          <table className="min-w-full bg-white border border-gray-200 text-start">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-start">Id</th>
                <th className="py-2 px-4 border-b text-start">Profile</th>
                <th className="py-2 px-4 border-b text-start">Name</th>
                <th className="py-2 px-4 border-b text-start">Role</th>
                <th className="py-2 px-4 border-b text-start">Email</th>
                <th className="py-2 px-4 border-b text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td className="py-2 px-4 border-b" colSpan="6">
                    No data found
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="py-2 px-4 border-b">{user._id}</td>
                    <td className="py-2 px-4 border-b">
                      <img
                        src={user.profile_image}
                        alt={user.name}
                        className="w-16 h-16 object-cover rounded-full "
                      />
                    </td>
                    <td className="py-2 px-4 border-b">{user.name}</td>
                    <td className="py-2 px-4 border-b">{user.role}</td>
                    <td className="py-2 px-4 border-b">{user.email}</td>
                    <td className="py-2 px-4 border-b space-x-2">
                      <div className="flex items-center justify-center text-2xl">
                        <button
                          onClick={() => handleEdit(user._id)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <BiEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <BiTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 relative top-0 max-h-screen w-96">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
            >
              <FaTimes />
            </button>
            <h2 className="text-2xl text-center text-pink-600 font-bold">
              Edit User
            </h2>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <form onSubmit={handleSubmit}>
              <div>
                <label
                  className="block text-pink-600 text-md font-bold"
                  htmlFor="image"
                >
                  Image
                </label>
                <input
                  type="file"
                  name="image"
                  id="image"
                  style={{ display: "none" }}
                  accept="image/*"
                  onChange={handleImageChange}
                  className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
                />
                <label
                  htmlFor="image"
                  className="shadow appearance-none text-pink-600 rounded p-2 leading-tight focus:outline-none focus:shadow-outline"
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Profile Preview"
                      className="h-32 w-32 object-cover rounded-full mx-auto "
                    />
                  ) : (
                    "Choose an image"
                  )}
                </label>
              </div>
              {fileUploadError ? (
                <span className="text-red-700">
                  Error uploading image (image must be less than 2MB)
                </span>
              ) : filePerc > 0 && filePerc < 100 ? (
                <div className="relative pt-1">
                  <div className="flex mb-2 items-center justify-between">
                    <div>
                      <span className="text-slate-700">{`Uploading ${filePerc}%`}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-700">{`${filePerc}%`}</span>
                    </div>
                  </div>
                  <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
                    <div
                      style={{ width: `${filePerc}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-700"
                    ></div>
                  </div>
                </div>
              ) : filePerc === 100 ? (
                <span className="text-green-700">
                  Image successfully uploaded!
                </span>
              ) : (
                ""
              )}

              <div className="mb-4">
                <label
                  className="block text-pink-600 text-md font-bold"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div className="mb-4">
                <label
                  className="block text-pink-600 text-md font-bold"
                  htmlFor="name"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="bg-pink-600 text-white py-2 px-4 rounded hover:bg-pink-700"
                  disabled={loading}
                >
                  {loading ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 relative top-0 max-h-screen w-96">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
            >
              <FaTimes />
            </button>
            <h2 className="text-2xl text-center text-pink-600 font-bold">
              Delete User
            </h2>
            <p className="text-gray-700 text-center mb-4">
              Are you sure you want to delete {selectedUser?.name}?
            </p>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <div className="flex justify-between">
              <button
                onClick={handleCloseModal}
                className="bg-gray-300 text-gray-700 py-2 px-4 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="bg-red-600 text-white py-2 px-4 rounded hover:bg-red-700"
                disabled={loading}
              >
                {loading ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UsersPage;
