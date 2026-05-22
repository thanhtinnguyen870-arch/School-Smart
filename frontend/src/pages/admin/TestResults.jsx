import React, { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { useParams } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import { downloadFile } from "../../utils/downloadFile";

export default function TestResults() {
  const { id } = useParams();
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axiosClient.get(`/tests/${id}/results`).then(setRows);
  }, [id]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black">Kết quả bài kiểm tra</h1>
        </div>
        <button
          className="btn-primary"
          onClick={() => downloadFile(`/tests/${id}/results/export-excel`, "ket-qua-bai-kiem-tra.xlsx")}
        >
          <Download size={18} /> Xuất Excel
        </button>
      </div>

      <DataTable
        data={rows}
        columns={[
          { key: "studentCode", label: "Mã HS", render: (row) => row.studentId?.studentCode || "-" },
          { key: "student", label: "Học sinh", render: (row) => row.studentId?.fullName || "-" },
          { key: "score", label: "Điểm" },
          { key: "submittedAt", label: "Nộp lúc", render: (row) => row.submittedAt?.slice(0, 16).replace("T", " ") || "-" },
          { key: "status", label: "Trạng thái", render: (row) => row.status || "submitted" },
        ]}
      />
    </div>
  );
}
