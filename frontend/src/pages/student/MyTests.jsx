import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";

const formatTime = (value) => value?.slice(0, 16).replace("T", " ") || "-";

export default function MyTests() {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axiosClient.get("/tests/student/my-tests").then(setRows);
  }, []);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black">Bài kiểm tra</h1>
        <p className="text-sm text-slate-400">Điểm sẽ mở sau khi bài kiểm tra kết thúc 2 phút.</p>
      </div>

      <DataTable
        data={rows}
        searchKey="title"
        columns={[
          { key: "title", label: "Tên bài" },
          { key: "subject", label: "Môn học" },
          { key: "duration", label: "Phút" },
          { key: "endTime", label: "Kết thúc", render: (row) => formatTime(row.endTime) },
          {
            key: "status",
            label: "Trạng thái",
            render: (row) => row.submitted ? (row.canViewResult ? "Đã có điểm" : "Chờ công bố điểm") : (row.isOpen ? "Đang mở" : "Đã đóng"),
          },
        ]}
        actions={(row) => {
          if (row.submitted && row.canViewResult) {
            return <Link className="text-mint" to={`/student/tests/${row._id}/result`}>Xem điểm</Link>;
          }

          if (row.submitted) {
            return <span className="text-slate-400">Mở lúc {formatTime(row.resultReleaseAt)}</span>;
          }

          if (row.isOpen) {
            return <Link className="text-cyan" to={`/student/tests/${row._id}`}>Làm bài</Link>;
          }

          return <span className="text-slate-500">Hết hạn</span>;
        }}
      />
    </div>
  );
}
