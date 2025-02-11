import { useState } from 'react';

const useComments = (initialComments, currentUser) => {
  const [commentList, setCommentList] = useState(initialComments);

  const addComment = newComment => {
    if (newComment.trim() !== '' && currentUser) {
      setCommentList([
        ...commentList,
        { id: Date.now(), username: currentUser, text: newComment },
      ]);
    }
  };

  const deleteComment = commentId => {
    setCommentList(commentList.filter(comment => comment.id !== commentId));
  };

  return { commentList, addComment, deleteComment };
};

export default useComments;
