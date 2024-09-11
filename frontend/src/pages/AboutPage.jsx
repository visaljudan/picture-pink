import { useUsersHook } from "../hooks/useUsers";
import MainLayout from "../layouts/MainLayout";

const AboutPage = () => {
  const { users } = useUsersHook();
  const adminUser = users.filter((user) => user?.role === "Admin");
  return (
    <MainLayout page="about">
      <div className="flex flex-col justify-center items-center p-4">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">
          About Picture Pink
        </h2>
        <p className="text-center max-w-2xl text-gray-600">
          Welcome to Picture Pink, your go-to destination for discovering and
          sharing beautiful images. Our platform is designed to bring together
          photographers, artists, and enthusiasts to showcase their work and
          inspire each other. Whether you are looking for breathtaking
          landscapes, stunning portraits, or creative abstract art, Picture Pink
          has it all.
        </p>
        <p className="text-center max-w-2xl text-gray-600 mt-4">
          At Picture Pink, we believe in the power of visual storytelling. Our
          mission is to create a community where everyone can share their unique
          perspective and connect with others who appreciate the beauty of
          visual art. Join us on this journey and let your creativity shine!
        </p>
        <p className="text-pink-600 text-2xl font-bold my-4">Founder</p>
        <div className="text-center max-w-2xl text-pink-600 ">
          {adminUser.map((user, index) => (
            <div key={index}>
              <img
                src={user?.profile_image}
                alt="profile"
                className="w-32 h-32 object-cover rounded-full"
              />
              <p className="font-bold">{user?.name}</p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default AboutPage;
