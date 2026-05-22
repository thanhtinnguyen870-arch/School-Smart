import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";

export default function TestManagement() {
  const [items, setItems] = useState([]);
  useEffect(()=>{axiosClient.get("/tests").then(setItems);},[]);
  return <div className="space-y-5"><div className="flex justify-between"><h1 className="text-2xl font-black">Bài kiểm tra</h1><Link to="/admin/tests/create" className="btn-primary">Tạo bài kiểm tra</Link></div><DataTable data={items} searchKey="title" columns={[{key:"title",label:"Tên"},{key:"subject",label:"Môn"},{key:"duration",label:"Phút"},{key:"class",label:"Lớp",render:r=>r.classId?.className},{key:"status",label:"Trạng thái"}]} actions={(r)=><Link className="text-cyan" to={`/admin/tests/${r._id}/results`}>Kết quả</Link>}/></div>;
}
