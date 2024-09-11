import React from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { BiUser, BiBook, BiStats } from "react-icons/bi";
import { useUsersHook } from "../../hooks/useUsers";
import { usePostsHook } from "../../hooks/usePosts";

const DashboardPage = () => {
  const { users } = useUsersHook();
  const totalUsers = users.filter((user) => user.role !== "Admin").length;

  const { posts } = usePostsHook();
  const totalApproved = posts.filter(
    (post) => post.approve === "approved"
  ).length;
  const totalUnapproved = posts.filter(
    (post) => post.approve === "unapproved"
  ).length;
  const totalPending = posts.filter(
    (post) => post.approve === "pending"
  ).length;

  return (
    <AdminLayout page="dashboard">
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded shadow-md flex items-center">
            <BiUser className="text-pink-600 text-3xl mr-4" />
            <div>
              <p className="text-gray-600">Total Users</p>
              <p className="text-xl font-bold">{totalUsers || 0}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow-md flex items-center">
            <BiBook className="text-pink-600 text-3xl mr-4" />
            <div>
              <p className="text-gray-600">Total Posts</p>
              <p className="text-xl font-bold">{posts.length}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow-md flex items-center">
            <BiStats className="text-pink-600 text-3xl mr-4" />
            <div>
              <p className="text-gray-600">Daily Visits</p>
              <p className="text-xl font-bold">1,234</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow-md flex items-center">
            <BiBook className="text-pink-600 text-3xl mr-4" />
            <div>
              <p className="text-gray-600">Total Posts Approved</p>
              <p className="text-xl font-bold">{totalApproved}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow-md flex items-center">
            <BiBook className="text-pink-600 text-3xl mr-4" />
            <div>
              <p className="text-gray-600">Total Posts Unapproved</p>
              <p className="text-xl font-bold">{totalUnapproved}</p>
            </div>
          </div>
          <div className="bg-white p-4 rounded shadow-md flex items-center">
            <BiBook className="text-pink-600 text-3xl mr-4" />
            <div>
              <p className="text-gray-600">Total Posts Pending</p>
              <p className="text-xl font-bold">{totalPending}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default DashboardPage;
