import React from "react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosClient from "../../api/axiosClient";
import DataTable from "../../components/DataTable";
export default function MyAssignments(){const[rows,setRows]=useState([]);useEffect(()=>{axiosClient.get("/assignments").then(setRows);},[]);return <div className="space-y-5"><h1 className="text-2xl font-black">Bài tập</h1><DataTable data={rows} searchKey="title" columns={[{key:"title",label:"Tiêu đề"},{key:"subject",label:"Môn"},{key:"deadline",label:"Hạn",render:r=>r.deadline?.slice(0,10)},{key:"status",label:"Trạng thái"}]} actions={(r)=><Link to={`/student/assignments/${r._id}`} className="text-cyan">Mở</Link>}/></div>}
