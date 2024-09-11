import ImageGrid from "../components/ImageGrid";
import { usePostsHook } from "../hooks/usePosts";
import MainLayout from "../layouts/MainLayout";

const HomePage = () => {
  const { posts } = usePostsHook();
  return (
    <MainLayout page="home">
      <div className="flex flex-col justify-center items-center">
        <h2 className="text-2xl font-bold text-pink-600">
          Welcome to Picture Pink
        </h2>
       
        <ImageGrid posts={posts} />
      </div>
    </MainLayout>
  );
};

export default HomePage;
