import React from "react";
import { Link } from "react-router-dom";

const Logo = ({ className }) => {
  return (
    <Link
      to={"/"}
      className={`text-pink-600 font-bold text-xl ${
        className ? className : ""
      }`}
    >
      Picture Pink
    </Link>
  );
};

export default Logo;
