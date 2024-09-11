import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { FaTimes } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { usePostsHook } from "../../hooks/usePosts";
import axios from "../../api/axios";
import {
  BiData,
  BiEdit,
  BiHeart,
  BiLogOut,
  BiSelectMultiple,
  BiTrash,
} from "react-icons/bi";
import {
  signOutFailure,
  signOutStart,
  signOutSuccess,
} from "../../app/user/userSlice";
import { app } from "../../firebase";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import moment from "moment";

const AccountPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data;
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { error: errorPosts, fetchPostsByUserID, userPosts } = usePostsHook();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isEdit, setIsEdit] = useState(false);
  const [isDelete, setIsDelete] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [filePerc, setFilePerc] = useState(0);
  const [fileUploadError, setFileUploadError] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "active",
    image: null,
  });
  const [filteredPosts, setFilteredPosts] = useState(userPosts);
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [approveFilter, setApproveFilter] = useState("");

  const handleSignOut = async (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(signOutStart());
    try {
      // Perform sign-out logic here
      dispatch(signOutSuccess());
      setLoading(false);
      navigate("/");
    } catch (error) {
      setLoading(false);
      const errorMessage =
        error?.response?.data?.message || "Failed to sign out";
      dispatch(signOutFailure(errorMessage));
    }
  };

  const handleEdit = (id) => {
    const post = userPosts.find((post) => post._id === id);
    setSelectedPost(post);
    setFormData({
      title: post.title,
      description: post.description,
      status: post.status,
      image: post.image,
    });
    setImagePreview(post.image);
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
    setLoading(true);
    try {
      setLoading(false);
      await axios.put(`/posts/${selectedPost?._id}`, formData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      handleCloseModal();
    } catch (error) {
      setLoading(false);
      setError(error?.response?.data?.message);
      console.error("Error updating user:", error);
    }
  };

  const handleDelete = (id) => {
    setSelectedPost(userPosts.find((post) => post._id === id));
    setIsDelete(true);
    document.body.style.overflow = "hidden";
  };

  const handleConfirmDelete = async () => {
    const id = selectedPost._id;
    setLoading(true);
    try {
      await axios.delete(`/posts/${id}`, {
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
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    if (user) {
      fetchPostsByUserID(user);
    }
  }, []);

  useEffect(() => {
    let filtered = userPosts;

    if (searchText) {
      filtered = filtered.filter(
        (post) =>
          post._id.includes(searchText) ||
          post.title.toLowerCase().includes(searchText.toLowerCase()) ||
          post.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter((post) => post.status === statusFilter);
    }

    if (approveFilter) {
      filtered = filtered.filter((post) => post.approve === approveFilter);
    }

    if (selectedDate) {
      filtered = filtered.filter((post) => {
        const postDate = moment(post.createdAt).format("YYYY-MM-DD");
        return postDate === selectedDate;
      });
    }

    setFilteredPosts(filtered);
  }, [searchText, statusFilter, approveFilter, selectedDate, userPosts]);

  return (
    <MainLayout>
      <div className="w-full flex flex-col items-center">
        <div className="flex flex-col items-center">
          <img
            src={user?.profile_image}
            alt="profile_image"
            className="rounded-full w-32 h-32 object-cover"
          />
          <p className="font-bold">{user?.name}</p>
          <div className="flex space-x-4 mt-2 ">
            {user?.role === "Admin" ? (
              <Link
                to="/admin/dashboard"
                className=" border border-pink-600 text-pink-600  px-4  py-1 rounded-md flex items-center justify-center space-x-2"
              >
                <BiData />
                <span>Dashboard</span>
              </Link>
            ) : (
              ""
            )}

            <Link
              to="/setting"
              className="border border-pink-600 text-pink-600 px-4 py-1 rounded-md flex items-center justify-center space-x-2"
            >
              <BiSelectMultiple />
              <span>Settings</span>
            </Link>
            <Link
              to="/favourite"
              className=" border border-pink-600 text-pink-600  px-4  py-1 rounded-md flex items-center justify-center space-x-2"
            >
              <BiHeart />
              <span>Favorite</span>
            </Link>
            <Link
              to="/create-post"
              className=" border border-pink-600 text-pink-600  px-4  py-1 rounded-md flex items-center justify-center space-x-2"
            >
              <BiEdit />
              <span>Create Post</span>
            </Link>

            <button
              onClick={handleSignOut}
              className=" border border-pink-600 text-white bg-pink-600  px-4  py-1 rounded-md flex items-center justify-center space-x-2 hover:bg-white hover:text-pink-600"
            >
              <BiLogOut />
              <span>{loading ? "Loading..." : "Sign Out"}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center w-full justify-between mt-4 space-x-4">
          <input
            type="text"
            placeholder="Search by ID, Title, Description"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="border rounded w-full px-4 py-2"
          />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded w-full px-4 py-2"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded w-full px-4 py-2"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
          <select
            value={approveFilter}
            onChange={(e) => setApproveFilter(e.target.value)}
            className="border rounded w-full px-4 py-2"
          >
            <option value="">All Approvals</option>
            <option value="approved">Approved</option>
            <option value="pending">Pending</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <table className="min-w-full bg-white border border-gray-200 mt-4 text-center px-8">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b col-span-2">Image</th>
              <th className="py-2 px-4 border-b">Title</th>
              <th className="py-2 px-4 border-b">Description</th>
              <th className="py-2 px-4 border-b">Date</th>
              <th className="py-2 px-4 border-b">Status</th>
              <th className="py-2 px-4 border-b">Approve</th>
              <th className="py-2 px-4 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {errorPosts ? (
              <td className="py-2 px-4 border-b">{errorPosts}</td>
            ) : (
              filteredPosts.map((item) => (
                <tr key={item._id}>
                  <td className="py-2 px-4 border-b col-span-2">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-auto m-auto"
                    />
                  </td>
                  <td className="py-2 px-4 border-b">{item.title}</td>
                  <td className="py-2 px-4 border-b">{item.description}</td>
                  <td className="py-2 px-4 border-b">
                    {moment(item.createdAt).format("hh:mm DD/MM/YYYY")}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span
                      className={`inline-block px-2 py-1 text-sm font-semibold rounded-full ${
                        item.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span
                      className={`inline-block px-2 py-1 text-sm font-semibold rounded-full ${
                        item.approve === "approved"
                          ? "bg-green-100 text-green-700"
                          : item.approve === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.approve.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b space-x-2 text-2xl">
                    <button
                      onClick={() => handleEdit(item._id)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      <BiEdit />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      <BiTrash />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
          <div className="bg-white p-6 relative top-0 h-screen overflow-y-auto w-96">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
            >
              <FaTimes />
            </button>
            <h2 className="text-2xl text-center text-pink-600 font-bold">
              Edit Photo
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                      className="h-auto w-60 object-cover mx-auto "
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
              <div>
                <label
                  className="block text-pink-600 text-md font-bold"
                  htmlFor="title"
                >
                  Title
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  value={formData.title}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <div>
                <label
                  className="block text-pink-600 text-md font-bold"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
                ></textarea>
              </div>
              <div>
                <label
                  className="block text-pink-600 text-md font-bold"
                  htmlFor="status"
                >
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-pink-600 border border-pink-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline hover:border hover:border-pink-600 hover:text-pink-600 hover:bg-white"
                >
                  {loading ? "Loading..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ">
          <div className="bg-white p-6 relative top-0 h-fit w-96">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
            >
              <FaTimes />
            </button>
            <h2 className="text-2xl text-center text-pink-600 font-bold">
              Delete Photo
            </h2>
            <p className="my-8">Are you sure to delete this photo?</p>
            <div className="flex items-center justify-end space-x-4 my-2">
              <button
                onClick={handleConfirmDelete}
                className="bg-red-500 text-white rounded-md px-4 py-1"
              >
                {loading ? "Loading..." : "Delete"}
              </button>
              <button className="bg-gray-500 text-white rounded-md px-4 py-1">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

export default AccountPage;
