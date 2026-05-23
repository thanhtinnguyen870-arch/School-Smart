import React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Camera, Download, Play, RotateCcw, StepForward, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import { downloadFile } from "../../utils/downloadFile";
import { findBestFaceMatch, getSingleFaceDescriptor, loadFaceApiModels } from "../../utils/faceApi";

const attendanceStatusLabels = {
  present: "Có mặt",
  excused: "Nghỉ có phép"
};

export default function FaceAttendance() {
  const videoRef = useRef(null);
  const timerRef = useRef(null);
  const studentsRef = useRef([]);
  const todayRef = useRef([]);
  const busyRef = useRef(false);
  const requireNewFaceRef = useRef(false);

  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [cameraOn, setCameraOn] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [busy, setBusy] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [facePresent, setFacePresent] = useState(false);
  const [faceStatus, setFaceStatus] = useState("Chọn lớp để bắt đầu điểm danh.");
  const [students, setStudents] = useState([]);
  const [today, setToday] = useState([]);
  const [detected, setDetected] = useState(null);
  const [scanQueue, setScanQueue] = useState([]);
  const [scanLog, setScanLog] = useState([]);
  const [matchingStudent, setMatchingStudent] = useState(null);
  const [waitingNext, setWaitingNext] = useState(false);

  const selectedClass = useMemo(
    () => classes.find((item) => item._id === selectedClassId),
    [classes, selectedClassId]
  );

  const enrolledStudents = useMemo(
    () => students.filter((s) => Array.isArray(s.faceDescriptor) && s.faceDescriptor.length >= 128),
    [students]
  );

  const unregisteredStudents = useMemo(
    () => students.filter((s) => !(Array.isArray(s.faceDescriptor) && s.faceDescriptor.length >= 128)),
    [students]
  );

  const pendingStudents = useMemo(
    () => enrolledStudents.filter((student) => !today.some((row) => row.studentId?._id === student._id)),
    [enrolledStudents, today]
  );

  const canStartAttendance = selectedClassId && students.length > 0 && unregisteredStudents.length === 0;
  const cameraLabel = busy
    ? matchingStudent
      ? `Đang đối chiếu: ${matchingStudent.fullName}`
      : "Đang đối chiếu"
    : waitingNext
      ? detected?.fullName
        ? `Đã điểm danh: ${detected.fullName}`
        : "Đã điểm danh"
      : facePresent
        ? "Đã thấy khuôn mặt"
        : "Đang quét";

  const stopScanner = () => {
    clearInterval(timerRef.current);
    timerRef.current = null;
    setScanning(false);
    setBusy(false);
    setMatchingStudent(null);
    setFacePresent(false);
    setWaitingNext(false);
    requireNewFaceRef.current = false;
  };

  const closeCamera = () => {
    videoRef.current?.srcObject?.getTracks()?.forEach((track) => track.stop());
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraOn(false);
  };

  const stopAll = () => {
    stopScanner();
    closeCamera();
  };

  const loadClasses = async () => {
    const result = await axiosClient.get("/classes");
    setClasses(result || []);
    if (!selectedClassId && result?.length) setSelectedClassId(result[0]._id);
  };

  const load = async (classId = selectedClassId) => {
    if (!classId) {
      setStudents([]);
      setToday([]);
      studentsRef.current = [];
      todayRef.current = [];
      return;
    }

    const [studentResult, todayResult] = await Promise.all([
      axiosClient.get(`/students?limit=200&classId=${classId}`),
      axiosClient.get(`/attendance/today?classId=${classId}`)
    ]);

    const nextStudents = studentResult.items || [];
    setStudents(nextStudents);
    setToday(todayResult);
    studentsRef.current = nextStudents;
    todayRef.current = todayResult;
  };

  useEffect(() => {
    loadClasses();
    loadFaceApiModels()
      .then(() => setModelsReady(true))
      .catch(() => toast.error("Không thể tải mô hình face-api.js"));
    return () => stopAll();
  }, []);

  useEffect(() => {
    stopAll();
    setDetected(null);
    setScanLog([]);
    setScanQueue([]);
    setFaceStatus(selectedClassId ? "Sẵn sàng điểm danh lớp đã chọn." : "Chọn lớp để bắt đầu điểm danh.");
    load(selectedClassId);
  }, [selectedClassId]);

  const openCamera = async () => {
    if (videoRef.current?.srcObject) {
      setCameraOn(true);
      return;
    }
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    videoRef.current.srcObject = stream;
    setCameraOn(true);
  };

  const buildPendingStudents = () => {
    const checkedIds = new Set(todayRef.current.map((row) => row.studentId?._id));
    return studentsRef.current
      .filter((s) => Array.isArray(s.faceDescriptor) && s.faceDescriptor.length >= 128)
      .filter((student) => !checkedIds.has(student._id));
  };

  const finishScan = (message = "Tất cả học sinh trong lớp đã được điểm danh hôm nay.") => {
    toast.info(message);
    stopScanner();
    setFaceStatus("Hoàn tất điểm danh lớp.");
  };

  const processDetectedFace = async (descriptor) => {
    if (busyRef.current) return;
    setMatchingStudent(null);

    const pending = buildPendingStudents();
    setScanQueue(pending);
    if (!pending.length) return finishScan();

    const match = findBestFaceMatch(descriptor, pending);
    if (!match.matched) {
      setDetected(null);
      setFaceStatus(match.ambiguous
        ? "Khuôn mặt chưa đủ chắc chắn để điểm danh. Hãy đứng thẳng, đủ sáng và quét lại."
        : "Khuôn mặt không khớp với học sinh nào trong lớp đang chờ điểm danh.");
      setScanLog((rows) => [
        {
          id: `unknown-${Date.now()}`,
          name: "Không xác định",
          status: match.ambiguous && match.secondBest
            ? `Chưa chắc: ${match.best.student.fullName} (${match.best.distance.toFixed(2)}) / ${match.secondBest.student.fullName} (${match.secondBest.distance.toFixed(2)})`
            : match.best ? `Gần nhất: ${match.best.student.fullName}, distance ${match.best.distance.toFixed(2)}` : "Không có mẫu phù hợp",
          confidence: "--"
        },
        ...rows
      ].slice(0, 8));
      return;
    }

    busyRef.current = true;
    setBusy(true);
    const student = match.student;
    setMatchingStudent(student);
    setFaceStatus(`Đã khớp với ${student.fullName}. Đang lưu điểm danh...`);

    try {
      const result = await axiosClient.post("/attendance/check-in", {
        studentId: student._id,
        confidence: match.confidence
      });

      setDetected({ ...student, confidence: match.confidence });
      toast.success(result.duplicate ? `${student.fullName} đã điểm danh trước đó` : `${student.fullName} đã điểm danh thành công`);
      setScanLog((rows) => [
        {
          id: `${student._id}-${Date.now()}`,
          name: student.fullName,
          status: result.duplicate ? "Đã điểm danh trước đó" : `Đúng người - distance ${match.distance.toFixed(2)}`,
          confidence: `${match.confidence}%`
        },
        ...rows
      ].slice(0, 8));

      requireNewFaceRef.current = true;
      setWaitingNext(true);
      setFaceStatus("Đã điểm danh thành công. Bấm Tiếp tục để quét người tiếp theo.");
      await load(selectedClassId);
      setScanQueue(buildPendingStudents());
    } catch (error) {
      toast.warning(error.message || "Không thể lưu điểm danh");
      setScanLog((rows) => [
        { id: `${student._id}-${Date.now()}-fail`, name: student.fullName, status: error.message || "Lưu điểm danh thất bại", confidence: "--" },
        ...rows
      ].slice(0, 8));
    } finally {
      setMatchingStudent(null);
      busyRef.current = false;
      setBusy(false);
    }
  };

  const startAttendance = async () => {
    if (!selectedClassId) return toast.warning("Vui lòng chọn lớp cần điểm danh.");
    if (!students.length) return toast.warning("Lớp này chưa có học sinh.");
    if (!canStartAttendance) return toast.warning(`Còn ${unregisteredStudents.length} học sinh trong lớp chưa đăng ký khuôn mặt.`);
    if (!pendingStudents.length) return toast.info("Tất cả học sinh trong lớp đã được điểm danh hôm nay.");

    if (!modelsReady) {
      await loadFaceApiModels();
      setModelsReady(true);
    }

    await openCamera();
    const pending = buildPendingStudents();
    setScanQueue(pending);
    setScanLog([{ id: `ready-${Date.now()}`, name: "Hệ thống", status: `Đang điểm danh lớp ${selectedClass?.className || ""}`, confidence: "--" }]);
    setDetected(null);
    setMatchingStudent(null);
    setWaitingNext(false);
    setFaceStatus("Đang chờ khuôn mặt vào khung.");
    requireNewFaceRef.current = false;
    setScanning(true);
    clearInterval(timerRef.current);

    timerRef.current = setInterval(async () => {
      if (busyRef.current) return;
      const faceResult = await getSingleFaceDescriptor(videoRef.current);
      const hasFace = !faceResult.error;
      setFacePresent(hasFace);

      if (requireNewFaceRef.current) {
        setFaceStatus("Đã điểm danh thành công. Bấm Tiếp tục để quét người tiếp theo.");
        return;
      }

      if (faceResult.error === "NO_FACE") {
        setFaceStatus("Chưa phát hiện khuôn mặt trong khung.");
        return;
      }

      if (faceResult.error === "MULTIPLE_FACES") {
        setFaceStatus("Chỉ cho 1 khuôn mặt trong khung khi điểm danh.");
        return;
      }

      setDetected(null);
      setFaceStatus("Đã phát hiện khuôn mặt. Đang đối chiếu trong lớp đã chọn...");
      await processDetectedFace(faceResult.descriptor);
    }, 1200);
  };

  const continueNextStudent = () => {
    const pending = buildPendingStudents();
    setScanQueue(pending);
    if (!pending.length) return finishScan();

    setDetected(null);
    setMatchingStudent(null);
    setWaitingNext(false);
    requireNewFaceRef.current = false;
    setFaceStatus("Sẵn sàng quét khuôn mặt tiếp theo.");
  };

  const deleteAttendanceRecord = async (record) => {
    const studentName = record.studentId?.fullName || "bản ghi này";
    const ok = window.confirm(`Xóa điểm danh của ${studentName}? Sau khi xóa có thể điểm danh lại.`);
    if (!ok) return;

    try {
      await axiosClient.delete(`/attendance/${record._id}`);
      toast.success("Đã xóa bản ghi điểm danh. Có thể điểm danh lại.");
      await load(selectedClassId);
      setScanQueue(buildPendingStudents());
    } catch (error) {
      toast.error(error.message || "Không thể xóa bản ghi điểm danh");
    }
  };

  const resetClassAttendance = async () => {
    if (!selectedClassId) return toast.warning("Vui lòng chọn lớp.");
    const ok = window.confirm(`Xóa điểm danh hôm nay của lớp ${selectedClass?.className || ""} để điểm danh lại?`);
    if (!ok) return;

    try {
      const result = await axiosClient.delete(`/attendance/today/reset?classId=${selectedClassId}`);
      toast.success(`Đã xóa ${result.deletedCount || 0} bản ghi điểm danh của lớp.`);
      setDetected(null);
      setMatchingStudent(null);
      setScanQueue([]);
      setScanLog([]);
      await load(selectedClassId);
    } catch (error) {
      toast.error(error.message || "Không thể reset điểm danh lớp");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h1 className="text-2xl font-black">Điểm Danh AI Theo Lớp</h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button className="btn-primary" onClick={startAttendance} disabled={scanning || busy || !selectedClassId}>
            <Play size={18} /> Bắt đầu điểm danh
          </button>
          {waitingNext && (
            <button className="rounded-lg border border-mint px-4 py-2 text-mint" onClick={continueNextStudent}>
              <StepForward size={18} className="inline" /> Tiếp tục
            </button>
          )}
          <button className="rounded-lg border border-amber px-4 py-2 text-amber" onClick={resetClassAttendance}>
            <RotateCcw size={18} className="inline" /> Điểm danh lại lớp
          </button>
          <button className="rounded-lg border border-slate-700 px-4 py-2" onClick={() => downloadFile("/reports/export-excel", "attendance-report.xls")}>
            <Download size={18} className="inline" /> Excel
          </button>
        </div>
      </div>

      <div className="card">
        <div className="grid gap-4 lg:grid-cols-[1fr_2fr] lg:items-end">
          <label className="block">
            <span className="mb-2 block text-sm font-black text-slate-700">Lớp điểm danh</span>
            <select className="input" value={selectedClassId} onChange={(e) => setSelectedClassId(e.target.value)} disabled={scanning}>
              <option value="">Chọn lớp</option>
              {classes.map((item) => <option key={item._id} value={item._id}>{item.className} - {item.classCode}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="card"><p className="text-sm text-slate-400">Sĩ số lớp</p><p className="mt-2 text-3xl font-black">{students.length}</p></div>
        <div className="card"><p className="text-sm text-slate-400">Đã có khuôn mặt</p><p className="mt-2 text-3xl font-black text-mint">{enrolledStudents.length}</p></div>
        <div className="card"><p className="text-sm text-slate-400">Chưa đăng ký</p><p className="mt-2 text-3xl font-black text-amber">{unregisteredStudents.length}</p></div>
        <div className="card"><p className="text-sm text-slate-400">Đã điểm danh</p><p className="mt-2 text-3xl font-black text-cyan">{today.length}</p></div>
      </div>

      {!canStartAttendance && selectedClassId && (
        <div className="rounded-xl border border-amber/30 bg-amber/10 p-4 text-sm text-amber">
          Chưa thể điểm danh AI cho lớp này. Hãy đăng ký khuôn mặt cho toàn bộ học sinh của lớp trước.
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
        <div className={`relative overflow-hidden rounded-2xl bg-black neon-border ${detected ? "shadow-neon" : ""}`}>
          <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
          {!cameraOn && <div className="absolute inset-0 grid place-items-center bg-slate-950/80 text-slate-400"><div className="text-center"><Camera className="mx-auto mb-3" size={42} /><p>Camera sẽ mở khi bắt đầu điểm danh</p></div></div>}
          {cameraOn && (
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[58%] w-[34%] min-w-[132px] max-w-[240px] -translate-x-1/2 -translate-y-1/2 rounded-[32px] border-2 border-mint shadow-neon">
              <span className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-[calc(100%+10px)] whitespace-nowrap rounded bg-mint px-3 py-1 text-xs font-bold text-slate-950">{cameraLabel}</span>
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="card">
            <h2 className="mb-3 font-bold">Trạng thái hệ thống</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <span className="rounded-lg bg-cyan/10 p-3 text-center text-cyan">{busy ? "Đang đối chiếu" : scanning ? (facePresent ? "Có khuôn mặt" : "Chờ khuôn mặt") : "Tạm dừng"}</span>
              <span className="rounded-lg bg-mint/10 p-3 text-center text-mint">{scanning ? scanQueue.length : pendingStudents.length} chờ quét</span>
              <span className="rounded-lg bg-amber/10 p-3 text-center text-amber">{today.length} đã ghi nhận</span>
              <span className={`rounded-lg p-3 text-center ${modelsReady ? "bg-mint/10 text-mint" : "bg-amber/10 text-amber"}`}>{modelsReady ? "Model sẵn sàng" : "Đang tải model"}</span>
            </div>
            <p className={`mt-3 rounded-lg px-3 py-2 text-sm ${facePresent ? "bg-mint/10 text-mint" : "bg-cyan/10 text-cyan"}`}>{faceStatus}</p>
          </div>

          <div className="card">
            <h2 className="mb-3 font-bold">Đối chiếu hiện tại</h2>
            {matchingStudent ? (
              <div className="space-y-3 text-sm font-semibold text-slate-700">
                <div className="flex items-center gap-3">
                  <img src={matchingStudent.faceImages?.[0]} alt={matchingStudent.fullName} className="h-20 w-20 rounded-xl border border-cyan/40 object-cover shadow-neon" />
                  <div>
                    <p className="text-xl font-black text-slate-950">{matchingStudent.fullName}</p>
                    <p>Mã: {matchingStudent.studentCode}</p>
                    <p>Lớp: {matchingStudent.classId?.className}</p>
                  </div>
                </div>
              </div>
            ) : detected ? (
              <div className="space-y-2 text-sm font-semibold text-slate-700">
                <p className="rounded-lg bg-mint/10 px-3 py-2 font-semibold text-mint">Điểm danh thành công</p>
                <p className="text-xl font-black text-slate-950">{detected.fullName}</p>
                <p>Mã: {detected.studentCode}</p>
                <p>Lớp: {detected.classId?.className}</p>
                <p>Độ chính xác: <span className="text-mint">{detected.confidence}%</span></p>
                {waitingNext && (
                  <button className="btn-primary mt-2 w-full" onClick={continueNextStudent}>
                    <StepForward size={18} /> Tiếp tục người tiếp theo
                  </button>
                )}
              </div>
            ) : (
              <p className="text-slate-500">Chưa ghi nhận</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="mb-3 font-bold">Nhật ký lớp {selectedClass?.className || ""}</h2>
        {scanLog.length ? (
          <div className="grid gap-2 text-sm">
            {scanLog.map((row) => (
              <div key={row.id} className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-3 py-2">
                <span className="font-medium">{row.name}</span>
                <span className="text-slate-400">{row.status}</span>
                <span className="text-mint">{row.confidence}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-slate-500">Chưa có nhật ký</p>
        )}
      </div>

      <DataTable
        columns={[
          { key: "name", label: "Học sinh", render: (r) => r.studentId?.fullName || "Không rõ" },
          { key: "code", label: "Mã", render: (r) => r.studentId?.studentCode || "-" },
          { key: "class", label: "Lớp", render: (r) => r.classId?.className || "-" },
          { key: "status", label: "Trạng thái", render: (r) => attendanceStatusLabels[r.status] || r.status || "-" },
          { key: "method", label: "Cách" },
          { key: "confidence", label: "Confidence", render: (r) => `${r.confidence || 100}%` }
        ]}
        data={today}
        actions={(row) => (
          <button className="inline-flex items-center gap-1 text-rose" onClick={() => deleteAttendanceRecord(row)}>
            <Trash2 size={15} /> Xóa
          </button>
        )}
      />
    </div>
  );
}
