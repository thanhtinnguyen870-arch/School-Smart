import React, { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";

export default function TestResult() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [locked, setLocked] = useState(null);

  useEffect(() => {
    axiosClient
      .get(`/tests/student/${id}/my-result`)
      .then(setData)
      .catch((error) => setLocked(error));
  }, [id]);

  if (locked) {
    return (
      <div className="card max-w-2xl space-y-4">
        <h1 className="text-2xl font-black text-slate-950">Chưa thể xem điểm</h1>
        <p className="font-semibold text-slate-600">{locked.message || "Điểm chưa được mở."}</p>
        {locked.resultReleaseAt && <p className="font-bold text-cyan">Thời gian mở điểm: {locked.resultReleaseAt.slice(0, 16).replace("T", " ")}</p>}
        <Link to="/student/tests" className="btn-primary">Quay lại bài kiểm tra</Link>
      </div>
    );
  }

  if (!data) return <div className="card font-semibold text-slate-600">Đang tải kết quả...</div>;

  const { test, result, totalScore } = data;

  return (
    <div className="space-y-5">
      <div className="card">
        <h1 className="text-2xl font-black text-slate-950">{test.title}</h1>
        <p className="mt-1 font-bold text-slate-500">{test.subject || "Bài kiểm tra"}</p>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-mint/30 bg-mint/10 p-4">
            <p className="text-sm font-bold text-slate-500">Điểm</p>
            <p className="text-3xl font-black text-mint">{result.score}/{totalScore}</p>
          </div>
          <div className="rounded-2xl border border-cyan/30 bg-cyan/10 p-4">
            <p className="text-sm font-bold text-slate-500">Thời gian nộp</p>
            <p className="font-black text-cyan">{result.submittedAt?.slice(0, 16).replace("T", " ")}</p>
          </div>
          <div className="rounded-2xl border border-violet/30 bg-violet/10 p-4">
            <p className="text-sm font-bold text-slate-500">Số câu</p>
            <p className="font-black text-violet">{test.questions?.length || 0}</p>
          </div>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="font-black text-slate-950">Chi tiết câu trả lời</h2>
        {test.questions?.map((question, index) => {
          const answer = result.answers?.[index]?.answer || "Chưa trả lời";
          const selectedKey = String(answer).trim().charAt(0).toUpperCase();
          const correctKey = String(question.correctAnswer || "").trim().charAt(0).toUpperCase();
          const correct = question.type === "multiple" && selectedKey === correctKey;

          return (
            <div key={question._id} className="rounded-2xl border border-slate-200 bg-white p-4">
              <p className="font-black text-slate-900">{index + 1}. {question.questionText}</p>
              <p className="mt-2 text-sm font-semibold text-slate-600">Bạn chọn: {answer}</p>
              {question.type === "multiple" && (
                <p className={`mt-1 text-sm font-bold ${correct ? "text-mint" : "text-rose"}`}>
                  Đáp án đúng: {question.correctAnswer} - {correct ? "Đúng" : "Sai"}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
