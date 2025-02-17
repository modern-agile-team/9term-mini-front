import useFetchPosts from '@/hooks/useFetchPosts'; // 🔥 커스텀 훅 import
import FeedList from '@/pages/Home/FeedList';

const Feed = () => {
  const { posts, observerRef, loading } = useFetchPosts();

  return (
    <div className="feed-container">
      <FeedList posts={posts} observerRef={observerRef} />
      {loading && <p>Loading...</p>}
    </div>
  );
};

export default Feed;
