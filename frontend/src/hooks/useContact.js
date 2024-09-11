import { useEffect, useState } from "react";
import axios from "../api/axios";
import socket from "../api/socket";

export const useContactsHook = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    try {
      const response = await axios.get("/contacts");
      setContacts(response.data.data);
      setLoading(false);
    } catch (error) {
      setError(error);
      setLoading(false);
    }
  };

  const handleContactCreated = (newContact) => {
    setContacts((prevContacts) => [...prevContacts, newContact]);
  };

  const handleContactUpdated = (updatedContact) => {
    setContacts((prevContacts) =>
      prevContacts.map((contact) =>
        contact._id === updatedContact._id ? updatedContact : contact
      )
    );
  };

  const handleContactDeleted = (deletedContactId) => {
    setContacts((prevContacts) =>
      prevContacts.filter((contact) => contact._id !== deletedContactId)
    );
  };

  useEffect(() => {
    socket.on("contactCreated", handleContactCreated);
    socket.on("contactUpdated", handleContactUpdated);
    socket.on("contactDeleted", handleContactDeleted);

    return () => {
      socket.off("contactCreated", handleContactCreated);
      socket.off("contactUpdated", handleContactUpdated);
      socket.off("contactDeleted", handleContactDeleted);
    };
  }, []);

  return { contacts, loading, error };
};
