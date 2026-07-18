import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import AuthPage from "./pages/AuthPage";
import TeacherDashboard from "./pages/TeacherDashboard";
import TeacherSubject from "./pages/TeacherSubject";
import TeacherLiveSession from "./pages/TeacherLiveSession";
import TeacherSessionReport from "./pages/TeacherSessionReport";
import StudentDashboard from "./pages/StudentDashboard";
import StudentSubject from "./pages/StudentSubject";
import AttendPage from "./pages/AttendPage";

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={<AuthPage />} />

      <Route path="/attend" element={<AttendPage />} />

      <Route
        path="/teacher"
        element={
          <ProtectedRoute role="teacher">
            <TeacherDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/subjects/:id"
        element={
          <ProtectedRoute role="teacher">
            <TeacherSubject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/sessions/:id"
        element={
          <ProtectedRoute role="teacher">
            <TeacherLiveSession />
          </ProtectedRoute>
        }
      />
      <Route
        path="/teacher/sessions/:id/report"
        element={
          <ProtectedRoute role="teacher">
            <TeacherSessionReport />
          </ProtectedRoute>
        }
      />

      <Route
        path="/student"
        element={
          <ProtectedRoute role="student">
            <StudentDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/subjects/:id"
        element={
          <ProtectedRoute role="student">
            <StudentSubject />
          </ProtectedRoute>
        }
      />

      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.role === "teacher" ? "/teacher" : "/student"} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
