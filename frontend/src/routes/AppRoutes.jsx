import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "../components/ProtectedRoute";
import AdminLayout from "../layouts/AdminLayout";
import StudentLayout from "../layouts/StudentLayout";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import NotFound from "../pages/auth/NotFound";
import Unauthorized from "../pages/auth/Unauthorized";
import AdminDashboard from "../pages/admin/AdminDashboard";
import FaceAttendance from "../pages/admin/FaceAttendance";
import FaceEnrollment from "../pages/admin/FaceEnrollment";
import StudentManagement from "../pages/admin/StudentManagement";
import StudentForm from "../pages/admin/StudentForm";
import StudentDetail from "../pages/admin/StudentDetail";
import ClassManagement from "../pages/admin/ClassManagement";
import GradeManagement from "../pages/admin/GradeManagement";
import AssignmentManagement from "../pages/admin/AssignmentManagement";
import TestManagement from "../pages/admin/TestManagement";
import CreateTest from "../pages/admin/CreateTest";
import TestResults from "../pages/admin/TestResults";
import Reports from "../pages/admin/Reports";
import Notifications from "../pages/admin/Notifications";
import Settings from "../pages/admin/Settings";
import StudentDashboard from "../pages/student/StudentDashboard";
import MyProfile from "../pages/student/MyProfile";
import MyGrades from "../pages/student/MyGrades";
import MyAttendance from "../pages/student/MyAttendance";
import MyAssignments from "../pages/student/MyAssignments";
import AssignmentDetail from "../pages/student/AssignmentDetail";
import SubmitAssignment from "../pages/student/SubmitAssignment";
import MyTests from "../pages/student/MyTests";
import TakeTest from "../pages/student/TakeTest";
import TestResult from "../pages/student/TestResult";
import StudentNotifications from "../pages/student/StudentNotifications";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute roles={["admin", "teacher"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="face-enrollment" element={<FaceEnrollment />} />
          <Route path="attendance" element={<FaceAttendance />} />
          <Route path="students" element={<StudentManagement />} />
          <Route path="students/new" element={<StudentForm />} />
          <Route path="students/:id" element={<StudentDetail />} />
          <Route path="classes" element={<ClassManagement />} />
          <Route path="grades" element={<GradeManagement />} />
          <Route path="assignments" element={<AssignmentManagement />} />
          <Route path="tests" element={<TestManagement />} />
          <Route path="tests/create" element={<CreateTest />} />
          <Route path="tests/:id/results" element={<TestResults />} />
          <Route path="reports" element={<Reports />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute roles={["student"]} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="/student/dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="grades" element={<MyGrades />} />
          <Route path="attendance" element={<MyAttendance />} />
          <Route path="assignments" element={<MyAssignments />} />
          <Route path="assignments/:id" element={<AssignmentDetail />} />
          <Route path="assignments/:id/submit" element={<SubmitAssignment />} />
          <Route path="tests" element={<MyTests />} />
          <Route path="tests/:id" element={<TakeTest />} />
          <Route path="tests/:id/result" element={<TestResult />} />
          <Route path="notifications" element={<StudentNotifications />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
