import { Route, Switch, Redirect } from "wouter";
import { Provider } from "./components/provider";
import { ProtectedRoute } from "./components/protected-route";

// Public
import LoginPage from "./pages/login";

// Employee
import DashboardPage from "./pages/dashboard";
import AttendancePage from "./pages/attendance";
import UpdatesPage from "./pages/updates";
import HolidaysPage from "./pages/holidays";
import ProfilePage from "./pages/profile";
import MyReportsPage from "./pages/my-reports";
import TasksPage from "./pages/tasks";

// Admin
import AdminIndexPage from "./pages/admin/index";
import AdminEmployeesPage from "./pages/admin/employees";
import AdminAttendancePage from "./pages/admin/attendance";
import AdminUpdatesPage from "./pages/admin/updates";
import AdminHolidaysPage from "./pages/admin/holidays";
import AdminMonitoringPage from "./pages/admin/monitoring";
import AdminReportsPage from "./pages/admin/reports";
import AdminAuditPage from "./pages/admin/audit";
import AdminTasksPage from "./pages/admin/tasks";
import AdminAnnouncementsPage from "./pages/admin/announcements";

function App() {
  return (
    <Provider>
      <Switch>
        {/* Public */}
        <Route path="/login" component={LoginPage} />

        {/* Employee routes */}
        <Route path="/dashboard">
          <ProtectedRoute><DashboardPage /></ProtectedRoute>
        </Route>
        <Route path="/attendance">
          <ProtectedRoute><AttendancePage /></ProtectedRoute>
        </Route>
        <Route path="/updates">
          <ProtectedRoute><UpdatesPage /></ProtectedRoute>
        </Route>
        <Route path="/tasks">
          <ProtectedRoute><TasksPage /></ProtectedRoute>
        </Route>
        <Route path="/holidays">
          <ProtectedRoute><HolidaysPage /></ProtectedRoute>
        </Route>
        <Route path="/profile">
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        </Route>
        <Route path="/my-reports">
          <ProtectedRoute><MyReportsPage /></ProtectedRoute>
        </Route>

        {/* Admin routes */}
        <Route path="/admin">
          <ProtectedRoute adminOnly><AdminIndexPage /></ProtectedRoute>
        </Route>
        <Route path="/admin/employees">
          <ProtectedRoute adminOnly><AdminEmployeesPage /></ProtectedRoute>
        </Route>
        <Route path="/admin/attendance">
          <ProtectedRoute adminOnly><AdminAttendancePage /></ProtectedRoute>
        </Route>
        <Route path="/admin/updates">
          <ProtectedRoute adminOnly><AdminUpdatesPage /></ProtectedRoute>
        </Route>
        <Route path="/admin/tasks">
          <ProtectedRoute adminOnly><AdminTasksPage /></ProtectedRoute>
        </Route>
        <Route path="/admin/announcements">
          <ProtectedRoute adminOnly><AdminAnnouncementsPage /></ProtectedRoute>
        </Route>
        <Route path="/admin/holidays">
          <ProtectedRoute adminOnly><AdminHolidaysPage /></ProtectedRoute>
        </Route>
        <Route path="/admin/monitoring">
          <ProtectedRoute adminOnly><AdminMonitoringPage /></ProtectedRoute>
        </Route>
        <Route path="/admin/reports">
          <ProtectedRoute adminOnly><AdminReportsPage /></ProtectedRoute>
        </Route>
        <Route path="/admin/audit">
          <ProtectedRoute adminOnly><AdminAuditPage /></ProtectedRoute>
        </Route>

        {/* Fallback */}
        <Route path="/">
          <Redirect to="/login" />
        </Route>
        <Route>
          <Redirect to="/login" />
        </Route>
      </Switch>

    </Provider>
  );
}

export default App;
