import React, { useEffect, useState } from "react";
import { ImagePlus, UploadCloud } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";

export default function CreateTest() {
  const [classes, setClasses] = useState([]);
  const [useWordFile, setUseWordFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axiosClient.get("/classes").then(setClasses);
  }, []);

  const save = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    const file = formData.get("file");
    const hasFile = file && file.name;

    if (!formData.get("title") && hasFile) {
      formData.set("title", file.name.replace(/\.[^.]+$/, ""));
    }

    if (!formData.get("title")) {
      toast.warning("Vui lòng nhập tên bài kiểm tra hoặc chọn file Word.");
      return;
    }

    if (useWordFile && !hasFile) {
      toast.warning("Vui lòng chọn file Word chứa câu hỏi trắc nghiệm.");
      return;
    }

    if (!useWordFile) {
      const q1Image = formData.get("q1Image");
      const q2Image = formData.get("q2Image");
      const questions = [
        {
          questionText: formData.get("q1"),
          type: "multiple",
          options: ["A", "B", "C", "D"].map((option) => `${option}. ${formData.get(option.toLowerCase()) || ""}`),
          correctAnswer: formData.get("correct"),
          score: Number(formData.get("q1Score")) || 5,
          imageField: q1Image?.name ? "q1Image" : undefined,
        },
        {
          questionText: formData.get("q2"),
          type: "essay",
          score: Number(formData.get("q2Score")) || 5,
          imageField: q2Image?.name ? "q2Image" : undefined,
        },
      ].filter((question) => question.questionText);

      if (!questions.length) {
        toast.warning("Vui lòng nhập ít nhất một câu hỏi trắc nghiệm hoặc tự luận.");
        return;
      }

      formData.set("questions", JSON.stringify(questions));
      ["q1", "a", "b", "c", "d", "correct", "q1Score", "q2", "q2Score", "file"].forEach((field) => formData.delete(field));
    }

    try {
      setSubmitting(true);
      await axiosClient.post("/tests", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success(useWordFile ? "Đã tạo bài kiểm tra từ file Word." : "Đã tạo bài kiểm tra.");
      navigate("/admin/tests");
    } catch (error) {
      toast.error(error.message || "Không thể tạo bài kiểm tra.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={save} noValidate className="card grid gap-4">
      <div>
        <h1 className="text-2xl font-black">Tạo bài kiểm tra</h1>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-slate-300">
          Tên bài kiểm tra
          <input name="title" className="input" placeholder="Nếu bỏ trống, hệ thống sẽ lấy tên file Word" />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-300">
          Môn học
          <input name="subject" className="input" placeholder="Ví dụ: Vật lý" />
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-300">
          Lớp học
          <select name="classId" className="input">
            <option value="">Chọn lớp học</option>
            {classes.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>
                {classItem.className}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-semibold text-slate-300">
          Thời gian làm bài
          <input name="duration" type="number" min="1" className="input" placeholder="Số phút" />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold text-slate-300">
          Thời gian mở
          <input name="startTime" type="datetime-local" className="input" />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-300">
          Thời gian đóng
          <input name="endTime" type="datetime-local" className="input" />
        </label>
      </div>

      <label className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4 text-sm text-slate-300">
        <input type="checkbox" checked={useWordFile} onChange={(event) => setUseWordFile(event.target.checked)} />
        Tạo câu hỏi tự động từ file Word
      </label>

      {useWordFile ? (
        <div className="grid gap-3 rounded-xl border border-cyan/30 bg-cyan/10 p-4">
          <label className="grid gap-2 text-sm font-semibold text-slate-300">
            File Word trắc nghiệm
            <input name="file" type="file" accept=".docx" className="input" />
          </label>
          <div className="rounded-lg border border-slate-800 bg-slate-950/60 p-3 text-sm text-slate-400">
            <p className="mb-2 font-semibold text-slate-200">Định dạng hỗ trợ:</p>
            <pre className="whitespace-pre-wrap font-sans">{`Câu 1: Nội dung câu hỏi
A. Đáp án A
B. Đáp án B
C. Đáp án C
D. Đáp án D

Bảng đáp án cuối file:
Câu      1   2
Đáp án   A   C`}</pre>
          </div>
          <div className="flex items-center gap-2 text-sm text-cyan">
            <UploadCloud size={18} /> Hệ thống sẽ đọc file và sinh danh sách câu trắc nghiệm cho học sinh làm.
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <section className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <h2 className="font-bold">Câu hỏi trắc nghiệm</h2>
            <label className="grid gap-2 text-sm font-semibold text-slate-300">
              Nội dung câu hỏi
              <input name="q1" className="input" placeholder="Nhập nội dung câu hỏi trắc nghiệm" />
            </label>

            <div className="grid gap-2 md:grid-cols-4">
              {["A", "B", "C", "D"].map((option) => (
                <label key={option} className="grid gap-2 text-sm font-semibold text-slate-300">
                  Đáp án {option}
                  <input name={option.toLowerCase()} className="input" placeholder={`Đáp án ${option}`} />
                </label>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="grid gap-2 text-sm font-semibold text-slate-300">
                Đáp án đúng
                <input name="correct" className="input" placeholder="Nhập A, B, C hoặc D" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-300">
                Điểm
                <input name="q1Score" type="number" min="0.1" step="0.1" className="input" defaultValue="5" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-300">
                Ảnh minh họa
                <span className="input flex items-center gap-2">
                  <ImagePlus size={16} />
                  <input name="q1Image" type="file" accept=".png,.jpg,.jpeg,.webp" className="w-full bg-transparent text-sm" />
                </span>
              </label>
            </div>
          </section>

          <section className="grid gap-3 rounded-xl border border-slate-800 bg-slate-950/40 p-4">
            <h2 className="font-bold">Câu hỏi tự luận</h2>
            <label className="grid gap-2 text-sm font-semibold text-slate-300">
              Nội dung câu hỏi
              <textarea name="q2" className="input min-h-28" placeholder="Nhập nội dung câu hỏi tự luận" />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-slate-300">
                Điểm
                <input name="q2Score" type="number" min="0.1" step="0.1" className="input" defaultValue="5" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-slate-300">
                Ảnh minh họa
                <span className="input flex items-center gap-2">
                  <ImagePlus size={16} />
                  <input name="q2Image" type="file" accept=".png,.jpg,.jpeg,.webp" className="w-full bg-transparent text-sm" />
                </span>
              </label>
            </div>
          </section>
        </div>
      )}

      <button type="submit" className="btn-primary" disabled={submitting}>
        {submitting ? "Đang tạo..." : "Tạo bài kiểm tra"}
      </button>
    </form>
  );
}
