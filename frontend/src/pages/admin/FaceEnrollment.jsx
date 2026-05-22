import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Eye, RotateCcw, ScanFace, Square, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import Modal from "../../components/Modal";
import { getSingleFaceDescriptor, loadFaceApiModels } from "../../utils/faceApi";

export default function FaceEnrollment() {
  const videoRef = useRef(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [saving, setSaving] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [students, setStudents] = useState([]);
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [lastEnrolledName, setLastEnrolledName] = useState("");
  const [previewStudent, setPreviewStudent] = useState(null);

  const hasValidFaceSample = (student) => Array.isArray(student.faceDescriptor) && student.faceDescriptor.length >= 128;
  const enrolledStudents = useMemo(() => students.filter(hasValidFaceSample), [students]);
  const unregisteredStudents = useMemo(() => students.filter((s) => !hasValidFaceSample(s)), [students]);

  const load = async () => {
    const result = await axiosClient.get("/students?limit=200");
    setStudents(result.items || []);
  };

  useEffect(() => {
    load();
    loadFaceApiModels()
      .then(() => setModelsReady(true))
      .catch(() => toast.error("Không thể tải mô hình face-api.js"));
    return () => closeCamera();
  }, []);

  const openCamera = async () => {
    if (videoRef.current?.srcObject) {
      setCameraOn(true);
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    setCameraOn(true);
  };

  const closeCamera = () => {
    videoRef.current?.srcObject?.getTracks()?.forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  };

  const captureFaceSample = async () => {
    if (saving) return;
    const student = students.find((item) => item._id === selectedStudentId);
    if (!student) {
      toast.warning("Chọn học sinh trước khi chụp mẫu mặt.");
      return;
    }

    await openCamera();
    const video = videoRef.current;
    if (!video?.videoWidth) {
      toast.warning("Camera chưa sẵn sàng, đợi 1-2 giây rồi bấm lại.");
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);

    try {
      setSaving(true);
      if (!modelsReady) {
        await loadFaceApiModels();
        setModelsReady(true);
      }

      const faceResult = await getSingleFaceDescriptor(video);
      if (faceResult.error === "NO_FACE") {
        toast.warning("Không phát hiện khuôn mặt. Hãy đưa mặt vào khung và chụp lại.");
        return;
      }
      if (faceResult.error === "MULTIPLE_FACES") {
        toast.warning("Chỉ được có 1 khuôn mặt trong khung khi đăng ký.");
        return;
      }

      const imageData = canvas.toDataURL("image/jpeg", 0.72);
      const descriptor = faceResult.descriptor;
      await axiosClient.post(`/students/${student._id}/register-face-sample`, { imageData, descriptor });
      const remaining = Math.max(0, unregisteredStudents.length - 1);
      toast.success(remaining ? `Đăng ký thành công cho ${student.fullName}. Còn ${remaining} học sinh.` : "Đã đăng ký đủ khuôn mặt cho tất cả học sinh.");
      setLastEnrolledName(student.fullName);
      setSelectedStudentId("");
      await load();
    } catch (error) {
      toast.error(error.message || "Đăng ký khuôn mặt thất bại");
    } finally {
      setSaving(false);
    }
  };

  const deleteFaceSample = async (student) => {
    const ok = window.confirm(`Xóa mẫu khuôn mặt của ${student.fullName}? Sau đó có thể đăng ký lại.`);
    if (!ok) return;
    try {
      await axiosClient.delete(`/students/${student._id}/face-sample`);
      toast.success(`Đã xóa mẫu khuôn mặt của ${student.fullName}.`);
      if (selectedStudentId === student._id) setSelectedStudentId("");
      setLastEnrolledName("");
      await load();
    } catch (error) {
      toast.error(error.message || "Không thể xóa mẫu khuôn mặt");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-black">Đăng Ký Khuôn Mặt</h1>
          <p className="text-slate-400">Lấy mẫu khuôn mặt cho học sinh một lần. Mục Điểm danh AI sẽ dùng dữ liệu này để đối chiếu.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={openCamera}><Camera size={18} /> Mở camera</button>
          <button className="rounded-lg border border-rose px-4 py-2 text-rose" onClick={closeCamera}><Square size={18} className="inline" /> Tắt camera</button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_.85fr]">
        <div className="relative overflow-hidden rounded-2xl bg-black neon-border">
          <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
          {!cameraOn && <div className="absolute inset-0 grid place-items-center bg-slate-950/80 text-slate-400"><div className="text-center"><Camera className="mx-auto mb-3" size={42} /><p>Camera đang tắt</p></div></div>}
          {cameraOn && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[58%] w-[34%] min-w-[132px] max-w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-[32px] border-2 border-cyan shadow-neon">
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded bg-cyan px-3 py-1 text-xs font-bold text-slate-950">Mẫu khuôn mặt</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-3 font-bold">Trạng thái đăng ký</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg border border-mint/30 bg-mint/10 p-3"><p className="text-slate-400">Đã đăng ký</p><p className="text-2xl font-black text-mint">{enrolledStudents.length}</p></div>
              <div className="rounded-lg border border-amber/30 bg-amber/10 p-3"><p className="text-slate-400">Chưa đăng ký</p><p className="text-2xl font-black text-amber">{unregisteredStudents.length}</p></div>
            </div>
          </div>

          <div className="card">
            <h2 className="mb-3 font-bold">Chụp mẫu</h2>
            <div className="space-y-3">
              {lastEnrolledName && <div className="rounded-lg border border-mint/30 bg-mint/10 px-3 py-2 text-sm text-mint">Thành công: {lastEnrolledName}. Hãy chọn học sinh tiếp theo.</div>}
              <select className="input" value={selectedStudentId} disabled={saving} onChange={(e) => setSelectedStudentId(e.target.value)}>
                <option value="">Chọn học sinh chưa đăng ký</option>
                {unregisteredStudents.map((student) => <option key={student._id} value={student._id}>{student.fullName} - {student.studentCode} - {student.classId?.className || "Chưa có lớp"}</option>)}
              </select>
              {!unregisteredStudents.length && <p className="rounded-lg bg-mint/10 px-3 py-2 text-sm text-mint">Tất cả học sinh đã có mẫu khuôn mặt.</p>}
              <button className="btn-primary w-full" onClick={captureFaceSample} disabled={saving || !selectedStudentId}><ScanFace size={18} /> {saving ? "Đang xử lý face-api..." : "Chụp và lưu mẫu mặt"}</button>
              <p className={`text-xs ${modelsReady ? "text-mint" : "text-amber"}`}>{modelsReady ? "face-api.js đã sẵn sàng" : "Đang tải mô hình face-api.js..."}</p>
            </div>
          </div>

          <div className="card">
            <h2 className="mb-3 font-bold">Học sinh đã đăng ký</h2>
            <div className="max-h-56 overflow-y-auto rounded-lg border border-slate-800 bg-slate-950/40 p-2 text-xs">
              {enrolledStudents.length ? enrolledStudents.map((student) => (
                <div key={student._id} className="flex items-center justify-between gap-3 border-b border-slate-800 py-1.5 last:border-b-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <img src={student.faceImages?.[0]} alt={student.fullName} className="h-10 w-10 shrink-0 rounded-lg border border-slate-700 object-cover" />
                    <span className="min-w-0 truncate">{student.fullName} - {student.classId?.className || "Chưa có lớp"}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <button className="inline-flex items-center gap-1 rounded border border-cyan/40 px-2 py-1 text-cyan hover:bg-cyan/10" onClick={() => setPreviewStudent(student)}><Eye size={13} /> Xem</button>
                    <button className="inline-flex items-center gap-1 rounded border border-rose/40 px-2 py-1 text-rose hover:bg-rose/10" onClick={() => deleteFaceSample(student)}><Trash2 size={13} /> Xóa</button>
                  </div>
                </div>
              )) : <p className="text-slate-500">Chưa có học sinh nào đăng ký.</p>}
            </div>
          </div>
        </div>
      </div>

      <DataTable
        columns={[
          { key: "studentCode", label: "Ma HS" },
          { key: "fullName", label: "Học sinh" },
          { key: "class", label: "Lớp", render: (r) => r.classId?.className },
          {
            key: "image",
            label: "Ảnh mẫu",
            render: (r) => r.faceImages?.length ? (
              <button className="group flex items-center gap-2" onClick={() => setPreviewStudent(r)}>
                <img src={r.faceImages[0]} alt={r.fullName} className="h-11 w-11 rounded-lg border border-slate-700 object-cover group-hover:border-cyan" />
                <span className="text-xs text-cyan">{r.faceImages.length} ảnh</span>
              </button>
            ) : (
              <span className="text-slate-500">-</span>
            )
          },
          { key: "face", label: "Mẫu mặt", render: (r) => <span className={`rounded-full px-2 py-1 text-xs ${hasValidFaceSample(r) ? "bg-mint/10 text-mint" : "bg-amber/10 text-amber"}`}>{hasValidFaceSample(r) ? "Đã đăng ký" : "Chưa đăng ký"}</span> }
        ]}
        data={students}
        searchKey="fullName"
        actions={(row) => hasValidFaceSample(row)
          ? <button className="inline-flex items-center gap-1 text-rose" onClick={() => deleteFaceSample(row)}><RotateCcw size={15} /> Đăng ký lại</button>
          : <button className="inline-flex items-center gap-1 text-cyan" onClick={async () => { setSelectedStudentId(row._id); await openCamera(); }}><ScanFace size={15} /> Lấy mẫu</button>}
      />

      <Modal open={Boolean(previewStudent)} title={`Ảnh khuôn mặt - ${previewStudent?.fullName || ""}`} onClose={() => setPreviewStudent(null)}>
        {previewStudent?.faceImages?.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {previewStudent.faceImages.map((image, index) => (
              <div key={`${previewStudent._id}-${index}`} className="overflow-hidden rounded-xl border border-slate-800 bg-slate-950/60">
                <img src={image} alt={`${previewStudent.fullName} sample ${index + 1}`} className="aspect-video w-full object-cover" />
                <div className="flex items-center justify-between px-3 py-2 text-xs text-slate-400">
                  <span>Mẫu #{index + 1}</span>
                  <span>{previewStudent.studentCode}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">Học sinh này chưa có ảnh mẫu khuôn mặt.</p>
        )}
      </Modal>
    </div>
  );
}
