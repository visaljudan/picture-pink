import { useEffect, useState } from "react";
import axios from "../api/axios";
import socket from "../api/socket";

export const useUsersHook = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/users");
      setUsers(response.data.data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const handleUserCreated = (newUser) => {
    setUsers((prevUsers) => [...prevUsers, newUser]);
  };

  const handleUserUpdated = (updatedUser) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user._id === updatedUser._id ? updatedUser : user
      )
    );
  };

  const handleUserDeleted = (deletedUserId) => {
    setUsers((prevUsers) =>
      prevUsers.filter((user) => user._id !== deletedUserId)
    );
  };

  useEffect(() => {
    socket.on("userCreated", handleUserCreated);
    socket.on("userUpdated", handleUserUpdated);
    socket.on("userDeleted", handleUserDeleted);

    return () => {
      socket.off("userCreated", handleUserCreated);
      socket.off("userUpdated", handleUserUpdated);
      socket.off("userDeleted", handleUserDeleted);
    };
  }, []);

  return { users, loading, error };
};
