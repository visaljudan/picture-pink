import React, { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { useContactsHook } from "../../hooks/useContact";
import { BiTrash } from "react-icons/bi";
import moment from "moment";
import { FaTimes } from "react-icons/fa";
import axios from "../../api/axios";
import { useSelector } from "react-redux";

const ContactsPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data;
  const { contacts } = useContactsHook();
  const [filteredPosts, setFilteredPosts] = useState(contacts);
  const [searchText, setSearchText] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedContact, setSelectedContact] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [isDelete, setIsDelete] = useState(false);
  const handleDelete = (id) => {
    setSelectedContact(contacts.find((contact) => contact._id === id));
    setIsDelete(true);
    document.body.style.overflow = "hidden";
  };

  const handleConfirmDelete = async () => {
    const id = selectedContact._id;
    setLoading(true);
    try {
      await axios.delete(`/contacts/${id}`, {
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
    setIsDelete(false);
    setSelectedContact(null);
    document.body.style.overflow = "auto";
  };

  useEffect(() => {
    let filtered = contacts;

    if (searchText) {
      filtered = filtered.filter(
        (post) =>
          post.name.toLowerCase().includes(searchText.toLowerCase()) ||
          post.email.toLowerCase().includes(searchText.toLowerCase()) ||
          post.message.toLowerCase().includes(searchText.toLowerCase()) ||
          post.subject.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedDate) {
      filtered = filtered.filter((post) => {
        const postDate = moment(post.createdAt).format("YYYY-MM-DD");
        return postDate === selectedDate;
      });
    }

    setFilteredPosts(filtered);
  }, [searchText, selectedDate, contacts]);

  return (
    <AdminLayout page="contacts">
      <div className="container mx-auto p-4">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">Contacts</h2>
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
          <table className="min-w-full bg-white border border-gray-200 text-start">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b text-start">Name</th>
                <th className="py-2 px-4 border-b text-start">Email</th>
                <th className="py-2 px-4 border-b text-start">Subject</th>
                <th className="py-2 px-4 border-b text-start">Message</th>
                <th className="py-2 px-4 border-b text-start">Date</th>
                <th className="py-2 px-4 border-b text-start">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPosts.length === 0 ? (
                <tr>
                  <td className="py-2 px-4 border-b" colSpan="6">
                    No data found
                  </td>
                </tr>
              ) : (
                filteredPosts.map((contact) => (
                  <tr key={contact._id}>
                    <td className="py-2 px-4 border-b">{contact.name}</td>
                    <td className="py-2 px-4 border-b">{contact.email}</td>
                    <td className="py-2 px-4 border-b">{contact.subject}</td>
                    <td className="py-2 px-4 border-b">{contact.message}</td>
                    <td className="py-2 px-4 border-b">
                      {moment(contact.createdAt).format("hh:mm DD/MM/YYYY")}
                    </td>
                    <td className="py-2 px-4 border-b space-x-2">
                      <button
                        onClick={() => handleDelete(contact._id)}
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
      </div>
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
              Are you sure you want to delete {selectedContact?.name}?
            </p>
            {error && <p className="text-red-500 text-center mb-4">{error}</p>}
            <div className="flex justify-end space-x-4">
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

export default ContactsPage;
