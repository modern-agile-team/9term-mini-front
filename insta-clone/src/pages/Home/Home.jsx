import React from 'react';
import FeedList from './Feed';
import Sidebar from './Sidebar';

const Home = () => {
  return (
    <div className="flex w-full h-screen">
      <Sidebar />
      <FeedList />
    </div>
  );
};

export default Home;
