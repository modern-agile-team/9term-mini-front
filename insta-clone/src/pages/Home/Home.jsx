import React from 'react';
import Sidebar from './Sidebar';
import Feed from './Feed';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Home Page</h1>
      <p>로그인 후 보이는 홈 화면입니다.</p>
      <Sidebar />
      <Feed />
    </div>
  );
};

export default Home;
