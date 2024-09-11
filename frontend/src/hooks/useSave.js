import { useEffect, useState } from "react";
import axios from "../api/axios";
import socket from "../api/socket";

export const useSavesHook = () => {
  const [saves, setSaves] = useState([]);
  const [userSaves, setUserSaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchSavesByUserID = async (user) => {
    setLoading(true);
    try {
      const response = await axios.get(`/saves/user/${user?._id}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });
      setUserSaves(response.data.data);
      setLoading(false);
    } catch (error) {
      setError(error?.response?.data?.message);
      setLoading(false);
    }
  };

  const handleSaveCreated = (newSave) => {
    setSaves((prevSaves) =>
      Array.isArray(prevSaves) ? [...prevSaves, newSave] : [newSave]
    );
    setUserSaves((prevSaves) =>
      Array.isArray(prevSaves) ? [...prevSaves, newSave] : [newSave]
    );
  };

  const handleSaveUpdated = (updatedSave) => {
    setSaves((prevSaves) =>
      Array.isArray(prevSaves)
        ? prevSaves.map((save) =>
            save._id === updatedSave._id ? updatedSave : save
          )
        : []
    );
    setUserSaves((prevSaves) =>
      Array.isArray(prevSaves)
        ? prevSaves.map((save) =>
            save._id === updatedSave._id ? updatedSave : save
          )
        : []
    );
  };

  const handleSaveDeleted = (deletedSaveId) => {
    setSaves((prevSaves) =>
      Array.isArray(prevSaves)
        ? prevSaves.filter((save) => save._id !== deletedSaveId)
        : []
    );
    setUserSaves((prevSaves) =>
      Array.isArray(prevSaves)
        ? prevSaves.filter((save) => save._id !== deletedSaveId)
        : []
    );
  };

  useEffect(() => {
    socket.on("saveCreated", handleSaveCreated);
    socket.on("saveUpdated", handleSaveUpdated);
    socket.on("saveDeleted", handleSaveDeleted);

    return () => {
      socket.off("saveCreated", handleSaveCreated);
      socket.off("saveUpdated", handleSaveUpdated);
      socket.off("saveDeleted", handleSaveDeleted);
    };
  }, []);

  return { saves, loading, error, fetchSavesByUserID, userSaves };
};
