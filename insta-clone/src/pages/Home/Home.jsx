import Feed from '@/pages/Home/Feed';
import Navbar from '@/pages/Home/Navbar';
import Footer from '@/pages/Home/Footer';

const Home = () => {
  return (
    <div className="max-w-[768px] w-full h-screen mx-auto overflow-hidden border border-gray-300 flex flex-col">
      <Navbar />
      <div className="flex-1 overflow-auto">
        <Feed />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
