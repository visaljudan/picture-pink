import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { usePostsHook } from "../hooks/usePosts";
import axios from "../api/axios";
import MainLayout from "../layouts/MainLayout";
import ImageGrid from "../components/ImageGrid";

const ProfilePage = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const { error: errorPosts, fetchPostsByUserID, userPosts } = usePostsHook();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserByID = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/users/${id}`);
        setUser(response.data.data);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        setError(error?.response?.data?.message);
        console.error("Error fetching user: " + error);
      }
    };

    fetchUserByID();
  }, [id]);

  useEffect(() => {
    if (user) {
      fetchPostsByUserID(user);
    }
  }, [user]);

  return (
    <MainLayout>
      <div className="w-full flex flex-col items-center">
        <div className="flex flex-col items-center">
          <img
            src={user?.profile_image}
            alt="profile_image"
            className="rounded-full w-32 h-32 object-cover"
          />
          <p className="font-bold text-xl mt-2">{user?.name}</p>
        </div>
        <ImageGrid posts={userPosts} />
      </div>
    </MainLayout>
  );
};

export default ProfilePage;
