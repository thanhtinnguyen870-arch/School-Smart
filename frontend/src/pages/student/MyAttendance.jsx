import React from "react";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
import { useAuthStore } from "../../store/authStore";
export default function MyAttendance(){const user=useAuthStore(s=>s.user);const[rows,setRows]=useState([]);useEffect(()=>{if(user?.studentId)axiosClient.get(`/attendance/student/${user.studentId}`).then(setRows);},[user]);return <div className="space-y-5"><h1 className="text-2xl font-black">Lịch sử điểm danh</h1><DataTable data={rows} columns={[{key:"date",label:"Ngày",render:r=>r.date?.slice(0,10)},{key:"checkInTime",label:"Check-in",render:r=>r.checkInTime?.slice(11,19)},{key:"status",label:"Trạng thái"},{key:"method",label:"Phương thức"},{key:"confidence",label:"Confidence"}]}/></div>}
