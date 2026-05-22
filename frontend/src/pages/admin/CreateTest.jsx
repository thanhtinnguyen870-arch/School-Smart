import React, { useEffect, useState } from "react";
import { ImagePlus, UploadCloud } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";

const subjects = ["Toán", "Ngữ Văn", "Vật Lý", "Hóa Học", "Tiếng Anh", "Sinh Học"];

export default function CreateTest() {
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [useWordFile, setUseWordFile] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    axiosClient.get("/classes").then((rows) => {
      const nextClasses = rows || [];
      setClasses(nextClasses);
      setSelectedClassId(searchParams.get("classId") || nextClasses[0]?._id || "");
      setSelectedSubject(searchParams.get("subject") || "");
    });
  }, [searchParams]);

  const save = async (event) => {
    event.preventDefault();
    if (submitting) return;

    const formData = new FormData(event.currentTarget);
    if (!selectedClassId) return toast.warning("Vui lòng chọn lớp trước.");
    if (!selectedSubject) return toast.warning("Vui lòng chọn môn học trước.");

    formData.set("classId", selectedClassId);
    formData.set("subject", selectedSubject);
    const file = formData.get("file");
    const hasFile = file && file.name;

    if (!formData.get("title") && hasFile) {
      formData.set("title", file.name.replace(/\.[^.]+$/, ""));
    }

    if (!formData.get("title")) return toast.warning("Vui lòng nhập tên bài kiểm tra hoặc chọn file Word.");
    if (useWordFile && !hasFile) return toast.warning("Vui lòng chọn file Word chứa câu hỏi trắc nghiệm.");

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
          imageField: q1Image?.name ? "q1Image" : undefined
        },
        {
          questionText: formData.get("q2"),
          type: "essay",
          score: Number(formData.get("q2Score")) || 5,
          imageField: q2Image?.name ? "q2Image" : undefined
        }
      ].filter((question) => question.questionText);

      if (!questions.length) return toast.warning("Vui lòng nhập ít nhất một câu hỏi trắc nghiệm hoặc tự luận.");

      formData.set("questions", JSON.stringify(questions));
      ["q1", "a", "b", "c", "d", "correct", "q1Score", "q2", "q2Score", "file"].forEach((field) => formData.delete(field));
    }

    try {
      setSubmitting(true);
      await axiosClient.post("/tests", formData, { headers: { "Content-Type": "multipart/form-data" } });
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
      <h1 className="text-2xl font-black">Tạo bài kiểm tra</h1>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-black text-slate-700">
          Lớp học
          <select
            name="classId"
            className="input"
            value={selectedClassId}
            onChange={(event) => {
              setSelectedClassId(event.target.value);
              setSelectedSubject("");
            }}
            required
          >
            <option value="">Chọn lớp học</option>
            {classes.map((classItem) => (
              <option key={classItem._id} value={classItem._id}>
                {classItem.className} - {classItem.classCode}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-black text-slate-700">
          Môn học
          <select className="input" value={selectedSubject} onChange={(event) => setSelectedSubject(event.target.value)} disabled={!selectedClassId} required>
            <option value="">Chọn môn học</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm font-black text-slate-700">
          Tên bài kiểm tra
          <input name="title" className="input" placeholder="Có thể bỏ trống nếu dùng file Word" />
        </label>

        <label className="grid gap-2 text-sm font-black text-slate-700">
          Thời gian làm bài
          <input name="duration" type="number" min="1" className="input" placeholder="Số phút" />
        </label>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-black text-slate-700">
          Thời gian mở
          <input name="startTime" type="datetime-local" className="input" />
        </label>
        <label className="grid gap-2 text-sm font-black text-slate-700">
          Thời gian đóng
          <input name="endTime" type="datetime-local" className="input" />
        </label>
      </div>

      <label className="flex items-center gap-3 rounded-2xl border border-sky-100 bg-sky-50 p-4 text-sm font-bold text-sky-800">
        <input type="checkbox" checked={useWordFile} onChange={(event) => setUseWordFile(event.target.checked)} />
        Tạo câu hỏi tự động từ file Word
      </label>

      {useWordFile ? (
        <div className="grid gap-3 rounded-2xl border border-cyan/30 bg-cyan/10 p-4">
          <label className="grid gap-2 text-sm font-black text-slate-700">
            File Word trắc nghiệm
            <input name="file" type="file" accept=".docx" className="input" />
          </label>
          <div className="flex items-center gap-2 text-sm font-bold text-cyan">
            <UploadCloud size={18} /> Hệ thống sẽ đọc file và sinh danh sách câu hỏi cho học sinh làm.
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          <section className="grid gap-3 rounded-2xl border border-sky-100 bg-white p-4 shadow-soft">
            <h2 className="font-black text-slate-900">Câu hỏi trắc nghiệm</h2>
            <label className="grid gap-2 text-sm font-black text-slate-700">
              Nội dung câu hỏi
              <input name="q1" className="input" placeholder="Nhập nội dung câu hỏi trắc nghiệm" />
            </label>

            <div className="grid gap-2 md:grid-cols-4">
              {["A", "B", "C", "D"].map((option) => (
                <label key={option} className="grid gap-2 text-sm font-black text-slate-700">
                  Đáp án {option}
                  <input name={option.toLowerCase()} className="input" placeholder={`Đáp án ${option}`} />
                </label>
              ))}
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <label className="grid gap-2 text-sm font-black text-slate-700">
                Đáp án đúng
                <input name="correct" className="input" placeholder="A, B, C hoặc D" />
              </label>
              <label className="grid gap-2 text-sm font-black text-slate-700">
                Điểm
                <input name="q1Score" type="number" min="0.1" step="0.1" className="input" defaultValue="5" />
              </label>
              <label className="grid gap-2 text-sm font-black text-slate-700">
                Ảnh minh họa
                <span className="input flex items-center gap-2">
                  <ImagePlus size={16} />
                  <input name="q1Image" type="file" accept=".png,.jpg,.jpeg,.webp" className="w-full bg-transparent text-sm" />
                </span>
              </label>
            </div>
          </section>

          <section className="grid gap-3 rounded-2xl border border-fuchsia-100 bg-white p-4 shadow-soft">
            <h2 className="font-black text-slate-900">Câu hỏi tự luận</h2>
            <label className="grid gap-2 text-sm font-black text-slate-700">
              Nội dung câu hỏi
              <textarea name="q2" className="input min-h-28" placeholder="Nhập nội dung câu hỏi tự luận" />
            </label>
            <div className="grid gap-3 md:grid-cols-2">
              <label className="grid gap-2 text-sm font-black text-slate-700">
                Điểm
                <input name="q2Score" type="number" min="0.1" step="0.1" className="input" defaultValue="5" />
              </label>
              <label className="grid gap-2 text-sm font-black text-slate-700">
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

      <button type="submit" className="btn-primary" disabled={submitting || !selectedClassId || !selectedSubject}>
        {submitting ? "Đang tạo..." : "Tạo bài kiểm tra"}
      </button>
    </form>
  );
}
