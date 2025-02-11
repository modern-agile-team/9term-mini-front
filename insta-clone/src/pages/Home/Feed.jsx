import { useState, useEffect, useRef } from 'react';
import FeedCard from '@/pages/Home/FeedCard';

const FeedList = ({ posts, observerRef }) => {
  return (
    <div className="w-full max-w-[768px] mx-auto p-6 flex flex-col items-center">
      {posts.map(post => (
        <div
          key={post.id}
          className="w-[80%] border-b border-gray-200 last:border-none"
        >
          <FeedCard {...post} />
        </div>
      ))}
      {/* 🔹 마지막 피드 아래에 observerRef 배치 */}
      <div ref={observerRef} className="text-center text-xs text-gray-400 py-2">
        ⏳ 피드 불러오는 중...
      </div>
    </div>
  );
};

const Feed = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      username: 'user1_1',
      image:
        'https://cdn.news.hidoc.co.kr/news/photo/202104/24409_58461_0826.jpg',
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
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTmMPQb8IJeXeHn_Fxj8HN19mDbRKEFCmCjwQ&s',
      caption: '냐옹이',
      likes: 5,
      comments: [
        { username: 'user1_1', text: '귀엽군' },
        { username: 'user4', text: '이름이 뭐야옹?' },
      ],
    },
  ]);
  const [visiblePosts, setVisiblePosts] = useState(2); // 초기 로딩 개수
  const observerRef = useRef(null);

  // 🔹 더 많은 피드 로드 (더미 데이터 추가)
  const loadMorePosts = () => {
    setTimeout(() => {
      const newPosts = [
        {
          id: posts.length + 1,
          username: `user${posts.length + 1}`,
          image:
            'https://cdn.travie.com/news/photo/first/201710/img_19975_1.jpg',
          caption: `새로운 피드 ${posts.length + 1}`,
          likes: Math.floor(Math.random() * 100),
          comments: [],
        },
        {
          id: posts.length + 2,
          username: `user${posts.length + 2}`,
          image:
            'https://cdn.class101.net/images/3e1377ef-0370-454f-8829-251668e8d7bd',
          caption: `새로운 피드 ${posts.length + 2}`,
          likes: Math.floor(Math.random() * 100),
          comments: [],
        },
      ];
      setPosts(prevPosts => [...prevPosts, ...newPosts]);
      setVisiblePosts(prev => prev + newPosts.length);
    }, 1000); // 로딩 시뮬레이션 (1초 후 데이터 추가)
  };

  // 🔹 Intersection Observer를 사용한 무한 스크롤 구현
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) {
          console.log('🔍 [INFO] Observer 트리거됨 - 새로운 피드 불러오기');
          loadMorePosts();
        }
      },
      { threshold: 1.0 }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) observer.disconnect();
    };
  }, [posts]); // 🔹 posts 변경될 때마다 observer 다시 설정

  return (
    <div className="feed-container">
      <FeedList
        posts={posts.slice(0, visiblePosts)}
        observerRef={observerRef}
      />
    </div>
  );
};

export default Feed;
