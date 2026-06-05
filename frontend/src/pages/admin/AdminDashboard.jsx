import {
  ClipboardList,
  CheckCircle,
  Loader,
  Users,
  User,
  Trash2,
  LogOut,
  Ticket,
  UserPlus,
  X,
  Paperclip,
  FileText,
  FileImage,
  FileArchive,
  FileSpreadsheet,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from "recharts";

import { useEffect, useState } from "react";
import axios from "axios";
import "./AdminDashboard.css";
function AdminDashboard() {

  const [tickets, setTickets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState("tickets");
  const [profileOpen, setProfileOpen] = useState(false);
const [profileData, setProfileData] = useState(null);
const [profileName, setProfileName] = useState("");
const [profilePassword, setProfilePassword] = useState("");
const [profileConfirmPassword, setProfileConfirmPassword] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState({});
  const [statusFilter, setStatusFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [role, setRole] = useState("EMPLOYEE");
  


  
  const [searchTerm, setSearchTerm] = useState("");
  const token = localStorage.getItem("token");

  // Load Tickets
  const loadTickets = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/tickets", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = response.data.data;

if (Array.isArray(data)) {
  setTickets(data);
} else {
  setTickets(data?.content || []);
}
    } catch (error) {
      console.log(error);
    }
  };

  // Load Employees
  const loadEmployees = async () => {
    try {
      const response = await axios.get("http://localhost:8080/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data.data || []);
    } catch (error) {
      console.log(error);
    }
  };
 // Load Profile
  const loadProfile = async () => {
  try {
    const response = await axios.get("http://localhost:8080/api/users/me", {
      headers: { Authorization: `Bearer ${token}` },
    });

    setProfileData(response.data.data);
    setProfileName(response.data.data.name);
  } catch (error) {
    console.log(error);
  }
};
// Update Profile
const updateProfile = async () => {

  if (profilePassword || profileConfirmPassword) {

    if (profilePassword !== profileConfirmPassword) {
      alert("Password and confirm password do not match");
      return;
    }

    const confirmChange = window.confirm(
      "Do you want to change password?"
    );

    if (!confirmChange) {
      return;
    }
  }

  try {

    await axios.put(
      "http://localhost:8080/api/users/me",
      {
        name: profileName,
        password: profilePassword,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    alert("Profile Updated");

    setProfilePassword("");
    setProfileConfirmPassword("");

    loadProfile();

    setProfileOpen(false);

  } catch (error) {
    console.log(error);
    alert("Failed to update profile");
  }
};
  const loadComments = async (ticketId) => {
  try {

    const response = await axios.get(
      `http://localhost:8080/api/comments/ticket/${ticketId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setComments((prev) => ({
      ...prev,
      [ticketId]: response.data.data || [],
    }));

  } catch (error) {
    console.log(error);
  }
};

  useEffect(() => {

  loadTickets();
  loadEmployees();
  loadProfile();

  const interval = setInterval(() => {

    loadTickets();

  }, 5000);

  return () => clearInterval(interval);

}, []);

useEffect(() => {

  tickets.forEach((ticket) => {
    loadComments(ticket.id);
  });

}, [tickets]);

  // Create Employee
  const createEmployee = async () => {
    try {
      await axios.post(
        "http://localhost:8080/api/users",
        { name, email, password, role },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Employee Created");
      setName("");
      setEmail("");
      setPassword("");
      setRole("EMPLOYEE");
      loadEmployees();
      setShowAddForm(false);
    } catch (error) {
      console.log(error);
      alert("Failed to create employee");
    }
  };

  // Delete Employee
  const deleteEmployee = async (id) => {
    try {
      await axios.delete(`http://localhost:8080/api/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Employee Deleted");
      loadEmployees();


    } catch (error) {
      console.log(error);
      alert("Failed to delete employee");
    }
  };

  // Update Ticket Status
  const updateTicketStatus = async (ticketId, status) => {
    try {
      await axios.patch(
        `http://localhost:8080/api/tickets/${ticketId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      loadTickets();
    } catch (error) {
      console.log(error);
      alert("Failed to update status");
    }
  };

    // comments functions

  const addComment = async (ticketId) => {

  if (!newComment[ticketId]?.trim()) return;

  try {

    await axios.post(
      "http://localhost:8080/api/comments",
      {
        ticketId,
        comment: newComment[ticketId],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setNewComment((prev) => ({
      ...prev,
      [ticketId]: "",
    }));

    loadComments(ticketId);

  } catch (error) {
    console.log(error);
    alert("Failed to add comment");
  }
};

  // Open attachment image
  const openImage = async (attachmentId) => {
    try {
      const response = await axios.get(
        `http://localhost:8080/api/attachments/${attachmentId}/download`,
        {
          responseType: "blob",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const imageUrl = URL.createObjectURL(response.data);
      setPreviewImage(imageUrl);
    } catch (error) {
      console.log(error);
      alert("Failed to open image");
    }
  };

  // Counts
  const pendingCount   = tickets.filter((t) => t.status === "OPEN").length;
  const runningCount   = tickets.filter((t) => t.status === "IN_PROGRESS").length;
  const completedCount = tickets.filter((t) => t.status === "RESOLVED").length;


 const filteredTickets = tickets.filter((ticket) => {

  const statusMatch =
    !statusFilter || ticket.status === statusFilter;

  const branchMatch =
    !branchFilter ||
    ticket.branch?.branchName === branchFilter;

  const searchMatch =
    !searchTerm ||
    ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.createdBy?.name?.toLowerCase().includes(searchTerm.toLowerCase());

  return statusMatch && branchMatch && searchMatch;

});
  const getInitials = (n) =>
    n ? n.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "??";

  const statusMeta = {
    OPEN:        { label: "Pending",     dot: "bg-yellow-400", badge: "bg-yellow-400/10 text-yellow-300 border border-yellow-500/30" },
    IN_PROGRESS: { label: "In Progress", dot: "bg-blue-400",   badge: "bg-blue-400/10 text-blue-300 border border-blue-500/30"     },
    RESOLVED:    { label: "Resolved",    dot: "bg-green-400",  badge: "bg-green-400/10 text-green-300 border border-green-500/30"  },
  };
const getFileIcon = (fileName) => {

  const lower = fileName.toLowerCase();

  if (
    lower.endsWith(".png") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".gif") ||
    lower.endsWith(".webp")
  ) {
    return <FileImage size={14} />;
  }

  if (
    lower.endsWith(".pdf")
  ) {
    return <FileText size={14} />;
  }

  if (
    lower.endsWith(".xls") ||
    lower.endsWith(".xlsx") ||
    lower.endsWith(".csv")
  ) {
    return <FileSpreadsheet size={14} />;
  }

  if (
    lower.endsWith(".zip") ||
    lower.endsWith(".rar")
  ) {
    return <FileArchive size={14} />;
  }

  return <Paperclip size={14} />;
};

const branchStats = {};

tickets.forEach((ticket) => {
  const branchName = ticket.branch?.branchName || "Unknown";

  branchStats[branchName] = (branchStats[branchName] || 0) + 1;
});

const branchStatsArray = Object.entries(branchStats);
const statusChartData = [
  { name: "Pending", value: pendingCount, color: "#facc15" },
  { name: "Running", value: runningCount, color: "#60a5fa" },
  { name: "Completed", value: completedCount, color: "#4ade80" },
];

const branchChartData = branchStatsArray.map(([branch, count]) => ({
  branch,
  count,
}));

return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
 `
      }</style>

      <div
  className="adm-root"
  style={{
    display: "flex",
    overflow: "hidden"
  }}
>

        {/* Sidebar */}
        <aside className="adm-sidebar">
          <div className="adm-logo">
            <div className="adm-logo-icon">
              <ClipboardList size={17} color="#fff" />
            </div>
            <div>
              <p style={{fontSize:13,fontWeight:700,color:'#f1f5f9',lineHeight:1.2}}>AdminPanel</p>
              <p style={{fontSize:10,color:'#475569',marginTop:2}}>Control Center</p>
            </div>
          </div>
          <nav className="adm-nav">
              <div
  onClick={() => setActiveTab("dashboard")}
  className={`adm-nav-item ${
    activeTab === "dashboard" ? "active" : ""
  }`}
>
  <ClipboardList size={15} color="#818cf8" />
  <span>Dashboard</span>
</div>
            <div
  onClick={() => setActiveTab("tickets")}
  className={`adm-nav-item ${
    activeTab === "tickets" ? "active" : ""
  }`}
>
  <Ticket size={15} color="#94a3b8" />
  <span>Tickets</span>

  <span className="adm-badge gray">
    {tickets.length}
  </span>
</div>
          </nav>
          <div className="adm-logout">
            <button onClick={() => { localStorage.clear(); window.location.href = "/"; }}>
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </aside>

        {/* Main */}
        <main style={{flex:1,display:'flex',flexDirection:'column',overflowY:'auto'}}>

          <header className="adm-topbar">
            <div>
              <img 
            src="https://kathiawarstores.com/wp-content/uploads/2024/04/New_logo_selected_Final_Main-logo90yers.png" 
            alt="Kathiawar Stores Logo" 
            style={{ height: '50px', objectFit: 'contain', display: 'block' }} 
          />
              <p style={{fontSize:12,color:'rgb(255, 255, 255)',marginTop:3}}>Kathiawar Stores</p>
            </div>
           <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

                <button
                  onClick={() => setProfileOpen(true)}
                  className="adm-profile-btn"
                >
                  <User size={14} />
                  Profile
                </button>

                <div className="adm-live">
                  <div className="adm-live-dot" />
                  Live
                </div>

              </div>
          </header>

          <div style={{padding:'24px 28px',display:'flex',flexDirection:'column',gap:20,maxWidth:1600,width:'100%',margin:'0 auto'}}>
               


{activeTab === "dashboard" && (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap');

      
    `}</style>

    <div className="db-root">

      {/* ── TOP STAT CARDS ── */}
      <div className="db-stat-grid">

        {/* Total */}
        <div className="db-stat-card">
          <div className="db-stat-icon-wrap" style={{ background: 'rgba(99,102,241,0.12)' }}>
            <svg width="20" height="20" fill="none" stroke="#818cf8" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/>
              <rect x="9" y="3" width="6" height="4" rx="1"/>
            </svg>
          </div>
          <p className="db-stat-label">Total Tickets</p>
          <p className="db-stat-value">{tickets.length}</p>
          <p className="db-stat-sub">All time tickets</p>
          <span className="db-stat-trend db-trend-up">↑ Live</span>
        </div>

        {/* Pending */}
        <div className="db-stat-card">
          <div className="db-stat-icon-wrap" style={{ background: 'rgba(251,191,36,0.1)' }}>
            <svg width="20" height="20" fill="none" stroke="#fbbf24" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          </div>
          <p className="db-stat-label" style={{ color: '#fbbf24' }}>Pending</p>
          <p className="db-stat-value">{pendingCount}</p>
          <p className="db-stat-sub">Awaiting response</p>
          <span className="db-stat-trend db-trend-up">↑ 8%</span>
        </div>

        {/* Running */}
        <div className="db-stat-card">
          <div className="db-stat-icon-wrap" style={{ background: 'rgba(96,165,250,0.1)' }}>
            <svg width="20" height="20" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <p className="db-stat-label" style={{ color: '#60a5fa' }}>Running</p>
          <p className="db-stat-value">{runningCount}</p>
          <p className="db-stat-sub">In progress</p>
          <span className="db-stat-trend db-trend-down">↓ 3%</span>
        </div>

        {/* Resolved */}
        <div className="db-stat-card">
          <div className="db-stat-icon-wrap" style={{ background: 'rgba(74,222,128,0.1)' }}>
            <svg width="20" height="20" fill="none" stroke="#4ade80" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
              <polyline points="22 4 12 14.01 9 11.01"/>
            </svg>
          </div>
          <p className="db-stat-label" style={{ color: '#4ade80' }}>Resolved</p>
          <p className="db-stat-value">{completedCount}</p>
          <p className="db-stat-sub">Successfully resolved</p>
          <span className="db-stat-trend db-trend-up">↑ 15%</span>
        </div>

        {/* Resolution Rate */}
        <div className="db-stat-card">
          <div className="db-stat-icon-wrap" style={{ background: 'rgba(167,139,250,0.1)' }}>
            <svg width="20" height="20" fill="none" stroke="#a78bfa" strokeWidth="2" viewBox="0 0 24 24">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <p className="db-stat-label" style={{ color: '#a78bfa' }}>Resolution Rate</p>
          <p className="db-stat-value" style={{ fontSize: 28 }}>
            {tickets.length ? Math.round((completedCount / tickets.length) * 100) : 0}%
          </p>
          <p className="db-stat-sub">Resolution percentage</p>
          <span className="db-stat-trend db-trend-up">↑ 10%</span>
        </div>

      </div>

      {/* ── MIDDLE ROW: Overview Chart + Donut ── */}
      <div className="db-mid-grid">

        {/* Tickets Overview Line Chart */}
        <div className="db-panel">
          <div className="db-panel-head">
            <div>
              <p className="db-panel-title">Tickets Overview</p>
              <div className="db-chart-legend" style={{ marginTop: 6 }}>
                <div className="db-legend-item"><span className="db-legend-dot" style={{ background: '#fbbf24' }} />Pending</div>
                <div className="db-legend-item"><span className="db-legend-dot" style={{ background: '#60a5fa' }} />Running</div>
                <div className="db-legend-item"><span className="db-legend-dot" style={{ background: '#4ade80' }} />Resolved</div>
              </div>
            </div>
            <span className="db-badge-period">Last 7 Days ▾</span>
          </div>
          <div style={{ padding: '10px 12px 14px' }}>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={branchChartData} barCategoryGap="30%">
                <XAxis dataKey="branch" stroke="#adb7c5" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#adb7c5" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    color: '#e2e8f0',
                    fontSize: 12,
                  }}
                  cursor={{ fill: 'rgba(99,102,241,0.06)' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut Chart - Tickets by Branch */}
        <div className="db-panel">
          <div className="db-panel-head">
            <div>
              <p className="db-panel-title">Tickets by Branch</p>
              <p className="db-panel-sub">Distribution</p>
            </div>
            <span className="db-badge-live">Live</span>
          </div>

          {/* Donut */}
          <div style={{ padding: '10px 0 0' }}>
            <ResponsiveContainer width="100%" height={170}>
              <PieChart>
                <Pie
                  data={statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={52}
                  outerRadius={78}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {statusChartData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#0f172a',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: 10,
                    color: '#e2e8f0',
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="db-donut-legend">
            {[
              { label: 'Pending', color: '#fbbf24', value: pendingCount },
              { label: 'Running', color: '#60a5fa', value: runningCount },
              { label: 'Resolved', color: '#4ade80', value: completedCount },
            ].map(item => (
              <div key={item.label} className="db-donut-row">
                <div className="db-donut-label">
                  <span className="db-donut-dot" style={{ background: item.color }} />
                  {item.label}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="db-donut-val">{item.value}</span>
                  <span className="db-donut-pct">
                    {tickets.length ? Math.round((item.value / tickets.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* ── BOTTOM ROW: Category + Activity + Top Employees ── */}
      <div className="db-bot-grid">

        {/* Tickets by Branch/Category Bars */}
        <div className="db-panel">
          <div className="db-panel-head">
            <div>
              <p className="db-panel-title">Tickets by Branch</p>
              <p className="db-panel-sub">Branch-wise breakdown</p>
            </div>
          </div>
          <div className="db-cat-list">
            {branchStatsArray.length === 0 ? (
              <p style={{ fontSize: 12, color: '#334155', textAlign: 'center', padding: '16px 0' }}>No data yet</p>
            ) : (
              branchStatsArray.map(([branch, count], i) => {
                const colors = ['#6366f1', '#4ade80', '#fbbf24', '#60a5fa', '#a78bfa', '#f472b6'];
                const icons = ['🏢', '🏬', '🏦', '🏪', '💄', '🌐'];
                const color = colors[i % colors.length];
                const icon = icons[i % icons.length];
                const pct = tickets.length ? Math.round((count / tickets.length) * 100) : 0;
                return (
                  <div key={branch} className="db-cat-row">
                    <div className="db-cat-head">
                      <div className="db-cat-name">
                        <div className="db-cat-icon" style={{ background: color + '18' }}>{icon}</div>
                        {branch}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                        <span className="db-cat-count">{count}</span>
                        <span className="db-cat-pct">({pct}%)</span>
                      </div>
                    </div>
                    <div className="db-bar-track">
                      <div className="db-bar-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="db-panel">
          <div className="db-panel-head">
            <div>
              <p className="db-panel-title">Recent Activity</p>
              <p className="db-panel-sub">Latest ticket updates</p>
            </div>
          </div>
          <div className="db-activity-list db-scroll">
            {tickets.length === 0 ? (
              <p style={{ fontSize: 12, color: '#334155', textAlign: 'center', padding: '16px 0' }}>No activity yet</p>
            ) : (
              tickets.slice(0, 8).map((ticket) => {
                const statusColors = {
                  OPEN: { bg: 'rgba(251,191,36,0.12)', color: '#fbbf24', icon: '🕐' },
                  IN_PROGRESS: { bg: 'rgba(96,165,250,0.12)', color: '#60a5fa', icon: '⚡' },
                  RESOLVED: { bg: 'rgba(74,222,128,0.12)', color: '#4ade80', icon: '✓' },
                };
                const s = statusColors[ticket.status] || statusColors.OPEN;
                return (
                  <div key={ticket.id} className="db-activity-item">
                    <div className="db-act-icon" style={{ background: s.bg, color: s.color }}>
                      {s.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="db-act-title" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {ticket.title}
                      </p>
                      <p className="db-act-sub">
                        {ticket.status === 'RESOLVED' ? 'Resolved' : ticket.status === 'IN_PROGRESS' ? 'In Progress' : 'Created'} by {ticket.createdBy?.name}
                      </p>
                    </div>
                    <span className="db-act-time">
                      {(() => {
                        const diff = Date.now() - new Date(ticket.createdAt).getTime();
                        const mins = Math.floor(diff / 60000);
                        if (mins < 60) return `${mins}m ago`;
                        const hrs = Math.floor(mins / 60);
                        if (hrs < 24) return `${hrs}h ago`;
                        return `${Math.floor(hrs / 24)}d ago`;
                      })()}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Top Employees */}
        <div className="db-panel">
          <div className="db-panel-head">
            <div>
              <p className="db-panel-title">Top Employees</p>
              <p className="db-panel-sub">By resolved tickets</p>
            </div>
            <span className="db-badge-period">Resolved ▾</span>
          </div>
          <div className="db-emp-list">
            {(() => {
              // Count resolved tickets per employee
              const empMap = {};
              tickets
                .filter(t => t.status === 'RESOLVED')
                .forEach(t => {
                  const name = t.createdBy?.name || 'Unknown';
                  empMap[name] = (empMap[name] || 0) + 1;
                });
              const sorted = Object.entries(empMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
              const maxVal = sorted[0]?.[1] || 1;
              const rankColors = ['gold', 'silver', 'bronze', '', ''];
              const barColors = ['#fbbf24', '#94a3b8', '#d97706', '#6366f1', '#a78bfa'];

              if (sorted.length === 0) {
                return <p style={{ fontSize: 12, color: '#334155', textAlign: 'center', padding: '16px 0' }}>No resolved tickets yet</p>;
              }

              return sorted.map(([name, count], i) => (
                <div key={name} className="db-emp-row">
                  <span className={`db-emp-rank ${rankColors[i]}`}>{i + 1}</span>
                  <div className="db-emp-avatar">
                    {name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p className="db-emp-name">{name}</p>
                    <p className="db-emp-tickets">{count} resolved</p>
                  </div>
                  <div className="db-emp-bar-wrap">
                    <div className="db-emp-bar">
                      <div className="db-emp-bar-fill" style={{
                        width: `${(count / maxVal) * 100}%`,
                        background: barColors[i],
                      }} />
                    </div>
                  </div>
                  <span className="db-emp-score">{count}</span>
                </div>
              ));
            })()}
          </div>
        </div>

      </div>

    </div>
  </>
)}
{activeTab === "tickets" && (
  <>
            {/* Stats */}
            <div className="adm-stats">
              <div className="adm-stat yellow">
                <div className="adm-stat-icon" style={{background:'rgba(234,179,8,0.1)'}}>
                  <ClipboardList color="#facc15" size={22} />
                </div>
                <div>
                  <p style={{fontSize:32,fontWeight:700,color:'#f1f5f9',lineHeight:1}}>{pendingCount}</p>
                  <p style={{fontSize:10,color:'#64748b',marginTop:4,textTransform:'uppercase',letterSpacing:'0.08em'}}>Pending</p>
                </div>
                <div className="adm-stat-bar" style={{background:'rgba(234,179,8,0.25)'}} />
              </div>
              <div className="adm-stat blue">
                <div className="adm-stat-icon" style={{background:'rgba(59,130,246,0.1)'}}>
                  <Loader color="#60a5fa" size={22} />
                </div>
                <div>
                  <p style={{fontSize:32,fontWeight:700,color:'#f1f5f9',lineHeight:1}}>{runningCount}</p>
                  <p style={{fontSize:10,color:'#64748b',marginTop:4,textTransform:'uppercase',letterSpacing:'0.08em'}}>Running</p>
                </div>
                <div className="adm-stat-bar" style={{background:'rgba(59,130,246,0.25)'}} />
              </div>
              <div className="adm-stat green">
                <div className="adm-stat-icon" style={{background:'rgba(74,222,128,0.1)'}}>
                  <CheckCircle color="#4ade80" size={22} />
                </div>
                <div>
                  <p style={{fontSize:32,fontWeight:700,color:'#f1f5f9',lineHeight:1}}>{completedCount}</p>
                  <p style={{fontSize:10,color:'#64748b',marginTop:4,textTransform:'uppercase',letterSpacing:'0.08em'}}>Completed</p>
                </div>
                <div className="adm-stat-bar" style={{background:'rgba(74,222,128,0.25)'}} />
              </div>
            </div>

            {/* Two col */}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,alignItems:'start'}}>

              {/* Tickets Panel */}
              <div className="adm-panel">
                <div className="adm-panel-header">
                  <Ticket size={15} color="#6366f1" />
                  <h2>All Tickets</h2>
                  <span className="adm-count-badge">{tickets.length} total</span>
                </div>

                <div className="adm-filters">
                  <div className="adm-search-wrap">
                    <svg className="adm-search-icon" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                    </svg>
                    <input
                      type="text"
                      placeholder="Search tickets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select className="adm-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="OPEN">Pending</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="RESOLVED">Resolved</option>
                  </select>
                  <select className="adm-select" value={branchFilter} onChange={(e) => setBranchFilter(e.target.value)}>
                    <option value="">All Branches</option>
                    <option value="Head Office">Head Office</option>
                    <option value="JUBILEE HILLS">JUBILEE HILLS</option>
                    <option value="ABIDS">ABIDS</option>
                    <option value="SECUNDERABAD">SECUNDERABAD</option>
                    <option value="GACHIBOWLI">GACHIBOWLI</option>
                    <option value="KS BEAUTY CENTRE">KS BEAUTY CENTRE</option>
                  </select>
                </div>

                <div className="adm-ticket-list adm-scroll">
                  {tickets.length === 0 ? (
                    <div className="adm-empty">
                      <Ticket size={30} color="#1e293b" />
                      <p>No tickets found</p>
                    </div>
                  ) : (Array.isArray(filteredTickets) && filteredTickets.length === 0 && (searchTerm || statusFilter || branchFilter)) ? (
                    <div className="adm-empty">
                      <Ticket size={30} color="#1e293b" />
                      <p>No tickets match your filters</p>
                    </div>
                  ) : (
                    (Array.isArray(filteredTickets) && filteredTickets.length > 0 ? filteredTickets : tickets).map((ticket) => {
                      const meta = statusMeta[ticket.status] || statusMeta.OPEN;
                      const ticketComments = (comments && comments[ticket.id]) ? comments[ticket.id] : [];
                      return (
                        <div
                              key={ticket.id}
                              className="adm-ticket-card"
                            >

                          {/* Status + dropdown */}
                          <div className="adm-ticket-top">
                            <span className={`adm-status-badge ${meta.badge}`}>
                              <span className={`adm-status-dot ${meta.dot}`} />
                              {meta.label}
                            </span>
                            
                            <select
                              className="adm-ticket-select"
                              value={ticket.status}
                              onChange={(e) => updateTicketStatus(ticket.id, e.target.value)}
                            >

                              <option value="OPEN">Pending</option>
                              <option value="IN_PROGRESS">Running</option>
                              <option value="RESOLVED">Completed</option>
                            </select>
                          </div>

                            
                          {/* Title */}
                          <p className="adm-ticket-title">{ticket.title}</p>
                            <button type="button"
                              className="adm-attach-btn"
                              onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedTicket(ticket);
                                      }}
                            >
                              View Details..
                            </button>
                          {/* Description */}
                          {ticket.description && (
                            <p className="adm-ticket-desc">{ticket.description}</p>
                          )}

                          {/* Meta */}
                          <div className="adm-ticket-meta">
                            <span>👤 {ticket.createdBy?.name}</span>
                            <span>🏢 {ticket.branch?.branchName}</span>
                            <span>📅 {new Date(ticket.createdAt).toLocaleString()}</span>
                          </div>

                          {/* Attachments */}
                          {ticket.attachments?.length > 0 && (
                            <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:10}}>
                              {ticket.attachments.map((attachment) => (
                                <button
                                  key={attachment.id}
                                  className="adm-attach-btn"
                                  onClick={() => openImage(attachment.id)}
                                >
                                  <Paperclip size={9} />
                                  {getFileIcon(attachment.originalFileName)}
                                  <span>{attachment.originalFileName}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          {/* Chat Box */}
                          <div className="adm-chat-box">
                            <div className="adm-chat-header">
                              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                              </svg>
                              Chat
                              <span className="adm-chat-count">{ticketComments.length}</span>
                            </div>

                            <div className="adm-chat-messages adm-scroll">
                              {ticketComments.length === 0 ? (
                                <p className="adm-chat-empty">No messages yet — start the conversation.</p>
                              ) : (
                                ticketComments.map((comment) => (
                                  <div key={comment.id} className="adm-chat-msg">
                                    <div className="adm-chat-msg-header">
                                      <span className="adm-chat-author">{comment.createdBy?.name}</span>
                                      <span className="adm-chat-time">{new Date(comment.createdAt).toLocaleString()}</span>
                                    </div>
                                    <p className="adm-chat-text">{comment.comment}</p>
                                  </div>
                                ))
                              )}
                            </div>

                            <div className="adm-chat-input-row">
                              <input
                                className="adm-chat-input"
                                type="text"
                                placeholder="Type a message..."
                                value={newComment[ticket.id] || ""}
                                onChange={(e) => setNewComment((prev) => ({ ...prev, [ticket.id]: e.target.value }))}
                                onKeyDown={(e) => { if (e.key === 'Enter') addComment(ticket.id); }}
                              />
                              <button className="adm-chat-send" onClick={() => addComment(ticket.id)}>
                                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                  <line x1="22" y1="2" x2="11" y2="13"/>
                                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                                </svg>
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Employees Panel */}
              <div className="adm-panel">
                <div className="adm-panel-header">
                  <Users size={15} color="#6366f1" />
                  <h2>Employee Management</h2>
                  <span className="adm-count-badge">{employees.length} total</span>
                </div>

                {!showAddForm ? (
  <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
    <button className="adm-add-btn" onClick={() => {
      setShowAddForm(true);
      setName("");
      setEmail("");
      setPassword("");
    }}>
      <UserPlus size={14} /> Add New Employee
    </button>
  </div>
) : (
  <div className="adm-add-form">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
      <p className="adm-form-label" style={{ margin: 0 }}>New Employee Details</p>
      <button onClick={() => setShowAddForm(false)} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>
        <X size={14} />
      </button>
    </div>
    <div className="adm-form-grid">

        <input type="email" name="fake-email" style={{ width: 0, height: 0, position: 'absolute', opacity: 0, zIndex: -1 }} tabIndex="-1" />
        <input type="password" name="fake-password" style={{ width: 0, height: 0, position: 'absolute', opacity: 0, zIndex: -1 }} tabIndex="-1" />

      <input className="adm-form-input" type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off"/>
      <select className="adm-form-input" value={role} onChange={(e) => setRole(e.target.value)}>
      <option value="EMPLOYEE">Employee</option>
      <option value="ADMIN">Admin</option> </select>
      <input className="adm-form-input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}autoComplete="off"/>
      <input className="adm-form-input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="off"/>
    </div>
    <div style={{ display: 'flex', gap: 10 }}>
      <button className="adm-add-btn" onClick={createEmployee}>Submit</button>
      <button className="adm-attach-btn" style={{ padding: '8px 18px', fontSize: 12 }} onClick={() => { setShowAddForm(false); setName(""); setEmail(""); setPassword(""); }}>
        Cancel
      </button>
    </div>
  </div>
)}

                <div className="adm-emp-list adm-scroll">
                  {employees.length === 0 ? (
                    <div className="adm-empty">
                      <Users size={30} color="#1e293b" />
                      <p>No employees found</p>
                    </div>
                  ) : (
                    employees.map((employee) => (
                      <div key={employee.id} className="adm-emp-card">
                        <div className="adm-avatar">{getInitials(employee.name)}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <p className="adm-emp-name">{employee.name}</p>

                            <p className="adm-emp-email">{employee.email}</p>

                            <span
                              style={{
                                display: "inline-block",
                                marginTop: "6px",
                                padding: "3px 8px",
                                borderRadius: "20px",
                                fontSize: "10px",
                                fontWeight: "600",
                                background:
                                  employee.role === "ADMIN"
                                    ? "rgba(74,222,128,0.12)"
                                    : "rgba(96,165,250,0.12)",
                                color:
                                  employee.role === "ADMIN"
                                    ? "#4ade80"
                                    : "#60a5fa",
                                border:
                                  employee.role === "ADMIN"
                                    ? "1px solid rgba(74,222,128,0.25)"
                                    : "1px solid rgba(96,165,250,0.25)",
                              }}
                            >
                              {employee.role}
                            </span>
                          </div>
                        {employee.role !== "ADMIN" && (
                            <button
                              className="adm-del-btn"
                              onClick={() => {
                                const confirmDelete = window.confirm(`Delete ${employee.name}?`);
                                if (confirmDelete) deleteEmployee(employee.id);
                              }}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>
            </>
            )}
          </div>
        </main>
        
      </div>
{profileOpen && (
  <div className="adm-modal-overlay">
    <div className="adm-profile-modal">
      <button
        className="adm-modal-close"
        onClick={() => setProfileOpen(false)}
      >
        <X size={14} />
      </button>

      <h2 className="adm-profile-title">My Profile</h2>

      <p className="adm-profile-email">
        {profileData?.email}
      </p>

      <input
        className="adm-form-input"
        type="text"
        placeholder="Name"
        value={profileName}
        onChange={(e) => setProfileName(e.target.value)}
      />

      <input
        className="adm-form-input"
        type="password"
        placeholder="New password"
        value={profilePassword}
        onChange={(e) => setProfilePassword(e.target.value)}
      />
      <input
        className="adm-form-input"
        type="password"
        placeholder="Re-enter new password"
        value={profileConfirmPassword}
        onChange={(e) => setProfileConfirmPassword(e.target.value)}
      />

     <button
  className="adm-add-btn"
  onClick={updateProfile}
>
        Update Profile
      </button>
    </div>
  </div>
)}

{/* Ticket Modal */}
{selectedTicket && (
  <div className="adm-modal-overlay">
    <div className="adm-profile-modal" style={{ width: "620px" }}>

      <button
        className="adm-modal-close"
        onClick={() => setSelectedTicket(null)}
      >
        <X size={14} />
      </button>

      <h2 className="adm-profile-title">
        {selectedTicket.title}
      </h2>

      <p className="adm-profile-email">
        Created by {selectedTicket.createdBy?.name} •{" "}
        {new Date(selectedTicket.createdAt).toLocaleString()}
      </p>

      <p style={{ color: "#cbd5e1", fontSize: 13, lineHeight: 1.6 }}>
        {selectedTicket.description}
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <div className="adm-form-input">
          Status: {selectedTicket.status}
        </div>

        <div className="adm-form-input">
          Branch: {selectedTicket.branch?.branchName || "N/A"}
        </div>
      </div>

      <h3 style={{ fontSize: 13, color: "#f1f5f9", marginTop: 10 }}>
        Attachments
      </h3>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {selectedTicket.attachments?.length > 0 ? (
          selectedTicket.attachments.map((attachment) => (
            <button
              key={attachment.id}
              className="adm-attach-btn"
              onClick={() => openImage(attachment.id)}
            >
              {getFileIcon(attachment.originalFileName)}
              {attachment.originalFileName}
            </button>
          ))
        ) : (
          <p style={{ color: "#64748b", fontSize: 12 }}>
            No attachments
          </p>
        )}
      </div>

      <h3 style={{ fontSize: 13, color: "#f1f5f9", marginTop: 10 }}>
        Comments
      </h3>

      <div className="adm-chat-messages adm-scroll" style={{ maxHeight: 180 }}>
        {(comments[selectedTicket.id] || []).length === 0 ? (
          <p className="adm-chat-empty">No comments yet</p>
        ) : (
          comments[selectedTicket.id].map((comment) => (
            <div key={comment.id} className="adm-chat-msg">
              <div className="adm-chat-msg-header">
                <span className="adm-chat-author">
                  {comment.createdBy?.name}
                </span>
                <span className="adm-chat-time">
                  {new Date(comment.createdAt).toLocaleString()}
                </span>
              </div>

              <p className="adm-chat-text">
                {comment.comment}
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  </div>
)}

      {/* Image Modal */}
      {previewImage && (
        <div className="adm-modal-overlay">
          <div className="adm-modal-inner">
            <button className="adm-modal-close" onClick={() => setPreviewImage(null)}>
              <X size={14} />
            </button>
            <img src={previewImage} alt="preview" className="adm-modal-img" />
          </div>
        </div>
      )}
    </>
  );
}

export default AdminDashboard;