import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../store/authStore";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://localhost:5000/api").replace(/\/api\/?$/, "");
const questionImageUrl = (question) => question?.imageUrl ? `${API_ORIGIN}${question.imageUrl}` : "";

export default function TakeTest() {
  const { id } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    axiosClient.get(`/tests/${id}`).then(setTest);
  }, [id]);

  const submit = async () => {
    if (submitting || !test) return;

    try {
      setSubmitting(true);
      await axiosClient.post(`/tests/${id}/submit`, {
        studentId: user.studentId,
        answers: test.questions.map((question, index) => ({
          questionId: question._id,
          answer: answers[index]
        }))
      });
      toast.success("Đã nộp bài. Điểm sẽ mở sau khi bài kiểm tra kết thúc 2 phút.");
      navigate("/student/tests");
    } catch (error) {
      toast.error(error.message || "Không thể nộp bài.");
      if (error.message?.includes("đã nộp")) navigate("/student/tests");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card space-y-5">
      <div>
        <h1 className="text-2xl font-black text-slate-950">{test?.title || "Bài kiểm tra"}</h1>
      </div>

      {test?.questions?.map((question, index) => (
        <div key={question._id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="font-black text-slate-900">
            {index + 1}. {question.questionText}
          </p>

          {question.imageUrl && (
            <img
              src={questionImageUrl(question)}
              alt={question.imageName || `Câu ${index + 1}`}
              className="mt-3 max-h-[360px] w-full rounded-xl border border-slate-200 object-contain"
            />
          )}

          {question.type === "multiple" ? (
            question.options.map((option) => (
              <label key={option} className="mt-3 block rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-700 transition hover:border-cyan hover:bg-sky-50">
                <input
                  type="radio"
                  name={`q${index}`}
                  className="mr-2"
                  onChange={() => setAnswers({ ...answers, [index]: option })}
                />
                {option}
              </label>
            ))
          ) : (
            <textarea
              className="input mt-3 min-h-32"
              placeholder="Nhập câu trả lời tự luận"
              onChange={(event) => setAnswers({ ...answers, [index]: event.target.value })}
            />
          )}
        </div>
      ))}

      <button onClick={submit} className="btn-primary" disabled={submitting}>
        {submitting ? "Đang nộp..." : "Nộp bài"}
      </button>
    </div>
  );
}
