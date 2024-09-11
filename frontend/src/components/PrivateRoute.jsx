import { useSelector } from "react-redux";
import { Outlet, Navigate } from "react-router-dom";

export const PrivateRoute = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data;

  return user ? <Outlet /> : <Navigate to="/signin" />;
};

export const PrivateAdminRoute = () => {
  const { currentUser } = useSelector((state) => state.user);
  const user = currentUser?.data;

  return user.role === "Admin" ? <Outlet /> : <Navigate to="/" />;
};
