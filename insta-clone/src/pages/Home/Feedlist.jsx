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

export default FeedList;
