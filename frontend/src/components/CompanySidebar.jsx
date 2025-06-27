// src/components/company/NoticeSidebar.jsx
import React from 'react';

export default function Com({ draftPosts, onAddDraftPost, onStartRecruit }) {
  return (
    <aside
      className="sticky top-24 mt-20 ml-12 w-72 p-8 bg-white rounded-xl shadow transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg text-sm text-gray-800"
    >
      <h3 className="text-base font-bold text-gray-900 mb-6">📢 공고 관리</h3>

      <button
        onClick={onAddDraftPost}
        className="w-full mb-8 bg-emerald-500 text-white text-base font-semibold py-2.5 px-4 rounded-full hover:bg-emerald-600 transition"
      >
        ➕ 새 공고 추가
      </button>

      {draftPosts.map((post) => (
        <div key={post.id} className="mb-7">
          <div className="font-semibold text-sm text-gray-800">{post.title}</div>
          <div className="bg-emerald-50 rounded-lg mt-2 px-4 py-3 shadow-inner text-gray-700 text-sm">
            <ul className="pl-2 list-disc space-y-1">
              <li
                className="cursor-pointer hover:text-emerald-600"
                onClick={() => onStartRecruit(post.id)}
              >
                새 채용 시작
              </li>
            </ul>
          </div>
        </div>
      ))}
    </aside>
  );
}
