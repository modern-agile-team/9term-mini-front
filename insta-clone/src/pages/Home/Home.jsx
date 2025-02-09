import React from 'react';
import FeedList from './Feed';
import Navbar from './Navbar';
import Footer from './Footer';

const Home = () => {
  return (
    <div className="max-w-[768px] w-full h-screen mx-auto overflow-hidden border border-gray-300 flex flex-col">
      <Navbar />
      <div className="flex-1 overflow-auto">
        <FeedList />
      </div>
      <Footer />
    </div>
  );
};

export default Home;
