import React, { useState } from "react";
import MainLayout from "../layouts/MainLayout";
import { useSelector } from "react-redux";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

const ContactPage = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await axios.post("/contacts", formData);
      navigate("/");
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setError(error?.response?.datt?.message);
      console.error(error);
    }
  };

  return (
    <MainLayout page="contact">
      <div className="w-96 mx-auto shadow-lg">
        <h2 className="text-2xl text-center text-pink-600 font-bold">
          Contact Us
        </h2>
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-md rounded p-8 space-y-6"
        >
          <div>
            <label
              className="block text-pink-600 text-md font-bold"
              htmlFor="name"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled
              className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label
              className="block text-pink-600 text-md font-bold"
              htmlFor="email"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled
              className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label
              className="block text-pink-600 text-md font-bold"
              htmlFor="subject"
            >
              Subject
            </label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full p-2 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div>
            <label
              className="block text-pink-600 text-md font-bold"
              htmlFor="message"
            >
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded h-32"
              required
            />
          </div>
          <div className="flex justify-center">
            <button
              type="submit"
              className="bg-pink-600 text-white px-4 py-2 rounded hover:bg-pink-700"
            >
              Send Message
            </button>
          </div>
          {error && <span className="text-red-500">{error}</span>}
        </form>
      </div>
    </MainLayout>
  );
};

export default ContactPage;
