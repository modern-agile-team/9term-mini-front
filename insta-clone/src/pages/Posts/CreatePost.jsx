// src/pages/Posts/CreatePost.jsx

const CreatePost = ({ onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div className="bg-white rounded-lg p-6 w-[400px] shadow-lg">
        <h2 className="text-lg font-bold mb-4">새 게시물 만들기</h2>

        {/* 파일 업로드 (간단한 디자인) */}
        <input
          type="file"
          accept="image/*"
          className="border border-gray-300 p-2 rounded w-full mb-3"
        />

        {/* 텍스트 입력 */}
        <textarea
          placeholder="캡션을 입력하세요..."
          className="border border-gray-300 p-2 rounded w-full h-20 resize-none mb-3"
        />

        {/* 버튼 */}
        <div className="flex justify-between">
          <button
            className="px-4 py-2 bg-gray-200 rounded"
            onClick={onClose} // 🔹 닫기 버튼
          >
            취소
          </button>
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            게시하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
