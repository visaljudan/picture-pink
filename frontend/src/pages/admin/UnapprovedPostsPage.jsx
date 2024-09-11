import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { usePostsHook } from "../../hooks/usePosts";
import moment from "moment/moment";
import axios from "../../api/axios";
import { FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";

const UnunapprovedPostsPage = () => {
  const { posts } = usePostsHook();
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [formData, setFormData] = useState({
    approve: "unapproved",
  });
  const [filteredPosts, setFilteredPosts] = useState(posts);
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  const handleChange = async (e, post) => {
    e.preventDefault();
    setIsModalOpen(true);
    setSelectedPost(post);
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async () => {
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

  const handleCloseModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "auto";
  };

  const unapprovedPosts = filteredPosts.filter(
    (post) => post?.approve === "unapproved"
  );

  useEffect(() => {
    let filtered = posts;

    if (searchText) {
      filtered = filtered.filter(
        (post) =>
          post.user_id?.email.toLowerCase().includes(searchText) ||
          post.title.toLowerCase().includes(searchText.toLowerCase()) ||
          post.description.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedDate) {
      filtered = filtered.filter((post) => {
        const postDate = moment(post.createdAt).format("YYYY-MM-DD");
        return postDate === selectedDate;
      });
    }

    setFilteredPosts(filtered);
  }, [searchText, selectedDate, posts]);

  return (
    <AdminLayout page="unapproved-posts">
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">Posts</h2>
        <div className="bg-white p-4 rounded shadow-md">
          <div className="flex items-center w-full justify-between mt-4 space-x-4">
            <input
              type="text"
              placeholder="Search by Title, Description, Owner"
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
          </div>
          <table className="min-w-full bg-white border border-gray-200 mt-4 text-center px-8">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b col-span-2">Image</th>
                <th className="py-2 px-4 border-b"></th>
                <th className="py-2 px-4 border-b">Title</th>
                <th className="py-2 px-4 border-b">Description</th>
                <th className="py-2 px-4 border-b">Owner</th>
                <th className="py-2 px-4 border-b">Date</th>
                <th className="py-2 px-4 border-b">Approve</th>
                <th className="py-2 px-4 border-b">Actions</th>
              </tr>
            </thead>
            <tbody>
              {unapprovedPosts.map((item) => (
                <tr key={item._id}>
                  <td className="py-2 px-4 border-b col-span-2">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-16 h-auto"
                    />
                  </td>
                  <td></td>
                  <td className="py-2 px-4 border-b">{item.title}</td>
                  <td className="py-2 px-4 border-b">{item.description}</td>
                  <td className="py-2 px-4 border-b">{item.user_id?.email}</td>
                  <td className="py-2 px-4 border-b">
                    {moment(item.createdAt).format("hh:mm DD/MM/YYYY")}
                  </td>
                  <td className="py-2 px-4 border-b">
                    <span
                      className={`inline-block px-2 py-1 text-sm font-semibold rounded-full ${
                        item.approve === "approved"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {item.approve.toUpperCase()}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b space-x-2">
                    <select
                      value={item.approve}
                      name="approve"
                      onChange={(e) => handleChange(e, item)}
                      className="bg-white border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:border-pink-500"
                    >
                      <option value="approved">Approved</option>
                      <option value="unapproved">Unapproved</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 relative top-0 h-fit w-96">
            <button
              onClick={handleCloseModal}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-2xl"
            >
              <FaTimes />
            </button>
            <h2 className="text-2xl text-center text-pink-600 font-bold">
              Change Approve Status
            </h2>
            <p className="my-8">
              Are you sure you want to{" "}
              <span className="text-green-600 font-bold">Approve</span> this
              post "{selectedPost?.title}"?
            </p>
            <div className="flex items-center justify-end space-x-4 my-2">
              <button
                onClick={handleSubmit}
                className="bg-green-500 text-white rounded-md px-4 py-1"
              >
                {loading ? "Loading..." : "Approve"}
              </button>
              <button
                onClick={handleCloseModal}
                className="bg-gray-500 text-white rounded-md px-4 py-1"
              >
                Cancel
              </button>
            </div>
            {error && <p className="text-red-500">{error}</p>}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default UnunapprovedPostsPage;
