import React, { createContext, useContext, useState } from 'react';

const PostContext = createContext(null);

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);

  // posts 관련 함수들
  const addPost = newPost => {
    setPosts(prevPosts => [...prevPosts, newPost]);
  };

  const updatePost = updatedPost => {
    setPosts(prevPosts =>
      prevPosts.map(post => (post.id === updatedPost.id ? updatedPost : post))
    );
  };

  const deletePost = postId => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  return (
    <PostContext.Provider
      value={{ posts, setPosts, addPost, updatePost, deletePost }}
    >
      {children}
    </PostContext.Provider>
  );
};

export const usePost = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error('usePost must be used within a PostProvider');
  }
  return context;
};
