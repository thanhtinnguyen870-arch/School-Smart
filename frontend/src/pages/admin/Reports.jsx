import React from "react";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import { downloadFile } from "../../utils/downloadFile";

export default function Reports(){const[rows,setRows]=useState([]);useEffect(()=>{axiosClient.get("/reports/attendance").then(setRows);},[]);return <div className="space-y-5"><h1 className="text-2xl font-black">Thống kê và báo cáo</h1><div className="flex gap-3"><button className="btn-primary" onClick={()=>downloadFile("/reports/export-excel","attendance-report.xls")}>Xuất Excel</button><button className="rounded-lg border border-slate-700 px-4 py-2" onClick={()=>downloadFile("/reports/export-pdf","attendance-report.pdf")}>Xuất PDF</button></div><DataTable data={rows} columns={[{key:"student",label:"Học sinh",render:r=>r.studentId?.fullName},{key:"class",label:"Lớp",render:r=>r.classId?.className},{key:"status",label:"Trạng thái"},{key:"date",label:"Ngày",render:r=>r.date?.slice(0,10)}]}/></div>}
