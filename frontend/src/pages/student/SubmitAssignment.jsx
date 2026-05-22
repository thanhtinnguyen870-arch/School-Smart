import React from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import axiosClient from "../../api/axiosClient";
import { useAuthStore } from "../../store/authStore";
export default function SubmitAssignment(){const{id}=useParams();const user=useAuthStore(s=>s.user);const submit=async e=>{e.preventDefault();const fd=new FormData(e.currentTarget);fd.append("studentId",user.studentId);await axiosClient.post(`/assignments/${id}/submit`,fd);toast.success("Đã nộp bài");};return <form onSubmit={submit} className="card grid max-w-2xl gap-3"><h1 className="text-2xl font-black">Nộp bài tập</h1><textarea name="content" className="input" placeholder="Nội dung bài làm"/><input type="file" name="file" className="input"/><button className="btn-primary">Nộp bài</button></form>}
