// src/pages/Home/Feed.jsx
import React from 'react';
import FeedCard from './FeedCard';

const FeedList = ({ posts }) => (
  <div className="w-full max-w-[768px] mx-auto p-6 flex flex-col items-center">
    {posts.map(post => (
      <div
        key={post.id}
        className="w-[80%] border-b border-gray-200 last:border-none"
      >
        <FeedCard {...post} />
      </div>
    ))}
  </div>
);

const Feed = () => {
  const posts = [
    {
      id: 1,
      username: 'user1_1',
      image:
        'https://www.chosun.com/resizer/v2/CU422HY2YJHS7JQ3REJ24E4H64.PNG?auth=e52a4a4dccedb36b8dd88edd8c33e25ec341eeaf2ae40b4ac886d11257e1e801&width=616',
      caption: '여행왔슈',
      likes: 10,
      comments: [
        { username: 'user2', text: '멋진 사진이네요!' },
        { username: 'user3', text: '어디로 여행 가셨나요?' },
      ],
    },
    {
      id: 2,
      username: 'user2',
      image:
        'https://www.kdca.go.kr/html/a2/namoimage/images/000058/0111_[KDCA]_%EC%8A%AC%EA%B8%B0%EB%A1%9C%EC%9A%B4_%EC%A0%91%EC%A2%85%EC%83%9D%ED%99%9C_%EC%B9%B4%EB%93%9C%EB%89%B4%EC%8A%A4_JPG_1.jpg',
      caption: '청소년 코로나 예방캠페인',
      likes: 5,
      comments: [
        { username: 'user1_1', text: '좋은 캠페인이네요!' },
        { username: 'user4', text: '이런 캠페인 많이 있었으면 좋겠어요' },
      ],
    },
  ];

  return (
    <div className="feed-container">
      <FeedList posts={posts} />
    </div>
  );
};

export default Feed;
