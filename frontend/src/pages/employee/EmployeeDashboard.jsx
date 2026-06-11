import { useEffect, useState } from "react";

import {
  PlusCircle,
  History,
  LogOut,
  Paperclip,
  FileText,
  FileImage,
  FileArchive,
  FileSpreadsheet,
  X,
  User,
  Camera,
} from "lucide-react";

import axios from "axios";

function EmployeeDashboard() {


  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [branchId, setBranchId] = useState("");
  const [file, setFile] = useState(null);
  const [screenshotLoading, setScreenshotLoading] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(Date.now());
  const [profileOpen, setProfileOpen] = useState(false);
const [profileData, setProfileData] = useState(null);
const [profileName, setProfileName] = useState("");
const [profilePassword, setProfilePassword] = useState("");
const [profileConfirmPassword, setProfileConfirmPassword] = useState("");

  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const [comments, setComments] = useState({});
const [newComment, setNewComment] = useState({});
const loggedInUserName = localStorage.getItem("name") || "Employee";
  const token = localStorage.getItem("token");
const [ticketLoading, setTicketLoading] = useState(false);
const [profileLoading, setProfileLoading] = useState(false);
  // Load Tickets
  const loadTickets = async () => {

    setTicketLoading(true);

    try {

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/tickets/my`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(response.data);
      setTickets(response.data.data.content || []);

      

    } catch (error) {

      console.log(error);

      
    }
    finally {setTicketLoading(false);}
  };

  const loadProfile = async () => {

  try {

    const response = await axios.get(
       `${import.meta.env.VITE_API_URL}/api/users/me`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    setProfileData(response.data.data);

    setProfileName(response.data.data.name);

  } catch (error) {

    console.log(error);

  }
};

 useEffect(() => {

  loadTickets();
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

const captureScreenshot = async () => {
  try {
    setScreenshotLoading(true);

    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
    });

    const track = stream.getVideoTracks()[0];

    const imageCapture = new ImageCapture(track);

    const bitmap = await imageCapture.grabFrame();

    const canvas = document.createElement("canvas");

    canvas.width = bitmap.width;
    canvas.height = bitmap.height;

    const ctx = canvas.getContext("2d");

    ctx.drawImage(bitmap, 0, 0);

    canvas.toBlob((blob) => {
      const screenshotFile = new File(
        [blob],
        `screenshot-${Date.now()}.png`,
        { type: "image/png" }
      );

      setFile(screenshotFile);
    });

    track.stop();

  } catch (error) {
    console.log(error);
    alert("Screenshot capture cancelled");
  } finally {
    setScreenshotLoading(false);
  }
};

  // Create Ticket
  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      // Create Ticket
      const ticketResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/tickets`,
        {
          title,
          description,
          priority: "MEDIUM",
          branchId: branchId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const ticketId = ticketResponse.data.data.id;

      // Upload Attachment
      if (file) {

        const formData = new FormData();

        formData.append("files", file);

        await axios.post(
          `${import.meta.env.VITE_API_URL}/api/attachments/upload/${ticketId}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      alert("Ticket Created Successfully");

      setTitle("");
      setDescription("");
      setBranchId("");
      setFile(null);

      loadTickets();

      setLoading(false);

    } catch (error) {

      console.log(error);

      alert("Failed to create ticket");

      setLoading(false);
    }
  };

  // Status Color
  const getStatusColor = (status) => {

    if (status === "OPEN") {
      return "bg-yellow-500/20 text-yellow-400";
    }

    if (status === "IN_PROGRESS") {
      return "bg-blue-500/20 text-blue-400";
    }

    if (status === "RESOLVED") {
      return "bg-green-500/20 text-green-400";
    }

    return "bg-slate-500/20 text-slate-300";
  };

  //commentsfunction
  // Load Comments
const loadComments = async (ticketId) => {

  try {

    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/comments/ticket/${ticketId}`,
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

// Add Comment
const addComment = async (ticketId) => {

  if (!newComment[ticketId]?.trim()) return;

  try {

    await axios.post(
      `${import.meta.env.VITE_API_URL}/api/comments`,
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
 if (profileLoading) return;

  setProfileLoading(true);
  try {

    await axios.put(
      `${import.meta.env.VITE_API_URL}/api/users/me`,
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

    alert("Profile Updated Successfully");

    setProfilePassword("");
    setProfileConfirmPassword("");

    loadProfile();

    setProfileOpen(false);

  } catch (error) {

    console.log(error);

    alert("Failed to update profile");

  }
  finally {

    setProfileLoading(false);

  }
};

  // Download Attachment
  const downloadAttachment = async (attachmentId, fileName) => {

    try {

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/attachments/${attachmentId}/download`,
        {
          responseType: "blob",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const url = window.URL.createObjectURL(
        new Blob([response.data])
      );

      const link = document.createElement("a");

      link.href = url;

      link.setAttribute("download", fileName);

      document.body.appendChild(link);

      link.click();

      link.remove();

    } catch (error) {

      console.log(error);

      alert("Failed to download attachment");
    }
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

 //import { LogOut, PlusCircle, History, Paperclip, X } from "lucide-react";
// Baaki aapke purane imports (useState, useEffect, axios etc.) yahan rahenge...

return (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

.adm-add-btn:disabled,
.adm-chat-send:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

      .adm-root {
        font-family: 'Inter', sans-serif;
        background: #fefeff;
        min-height: 100vh;
        color: #ffffff;
        display: flex;
        flex-direction: column;
      }

      .adm-scroll::-webkit-scrollbar { width: 4px; }
      .adm-scroll::-webkit-scrollbar-track { background: transparent; }
      .adm-scroll::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 99px; }

      /* Topbar */
      .adm-topbar {
        padding: 16px 32px;
        background: rgba(7, 10, 19, 0.85); backdrop-filter: blur(12px);
        border-bottom: 1px solid rgba(255,255,255,0.05);
        display: flex; align-items: center; justify-content: space-between;
        position: sticky; top: 0; z-index: 10;
      }

      /* Buttons */
      .adm-btn-danger {
        display: inline-flex; align-items: center; gap: 8px;
        background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2);
        color: #f87171; padding: 9px 16px; border-radius: 10px;
        font-size: 13px; font-weight: 600; cursor: pointer; transition: all 0.2s; font-family: inherit;
      }
      .adm-btn-danger:hover { background: rgba(239, 68, 68, 0.15); border-color: rgba(239, 68, 68, 0.3); color: #fca5a5; transform: translateY(-1px); }
      .adm-btn-danger:active { transform: scale(0.97); }

      .adm-add-btn {
        display: inline-flex; align-items: center; justify-content: center; gap: 7px;
        background: linear-gradient(135deg, #6366f1, #4f46e5);
        border: none; color: #fff; padding: 12px 18px;
        border-radius: 10px; font-size: 13px; font-weight: 600;
        cursor: pointer; transition: all 0.2s; font-family: inherit;
        box-shadow: 0 4px 14px rgba(99,102,241,0.3);
      }
      .adm-add-btn:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.4); }
      .adm-add-btn:active:not(:disabled) { transform: scale(0.97); }
      .adm-add-btn:disabled { opacity: 0.5; cursor: not-allowed; box-shadow: none; }

      /* Panel */
      .adm-panel {
        background: rgb(215, 217, 224); border: 1px solid rgba(255,255,255,0.07);
        border-radius: 18px; overflow: hidden; display: flex; flex-direction: column;
      }
      .adm-panel-header {
        padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.05);
        display: flex; align-items: center; gap: 10px;
        background: rgba(255,255,255,0.01);
      }
      .adm-panel-header h2 { font-size: 15px; font-weight: 600; color: #000000; }

      /* Forms */
      .adm-form-input {
        background: rgb(241, 242, 250); border: 1px solid rgba(253, 245, 245, 0.56);
        color: #030303; padding: 12px 14px; border-radius: 10px;
        font-size: 13px; outline: none; width: 100%; transition: all 0.2s; font-family: inherit;
      }
      .adm-form-input:focus { border-color: rgba(99,102,241,0.5); background: rgba(99,102,241,0.05); }
      .adm-form-input::placeholder { color: #171f2b; }
      .adm-form-input option { background: #4f4e7c4b; }
      input[type="file"].adm-form-input { padding: 9px 14px; color: #ffffff; font-size: 12px; }
      input[type="file"].adm-form-input::file-selector-button {
        background: rgba(231, 216, 216, 0.84); border: 1px solid rgba(255,255,255,0.1);
        color: #5c7492; padding: 6px 12px; border-radius: 6px; margin-right: 12px;
        cursor: pointer; transition: all 0.2s; font-family: inherit; font-size: 11px;
      }

      /* Ticket Cards */
      .adm-ticket-list { overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 14px; max-height: 75vh; }
      .adm-ticket-card {
        background: #f1f1f1; border: 1px solid rgba(255,255,255,0.07);
        border-radius: 14px; padding: 18px; flex-shrink: 0;
        transition: all 0.2s; position: relative; overflow: hidden;
      }
      .adm-ticket-card::before {
        content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
        background: transparent; transition: all 0.25s;
      }
      .adm-ticket-card:hover { border-color: rgba(99,102,241,0.2); box-shadow: 0 4px 24px rgba(0,0,0,0.35); transform: translateY(-1px); }
      .adm-ticket-card:hover::before { background: linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4); }
      .adm-ticket-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 10px; margin-bottom: 8px; }
      
      /* Dynamic Badges Based on Status */
      .adm-status-badge { display: inline-flex; align-items: center; gap: 5px; font-size: 10px; font-weight: 600; padding: 4px 10px; border-radius: 20px; letter-spacing: 0.02em; text-transform: uppercase; }
      .adm-status-dot { width: 5px; height: 5px; border-radius: 50%; display: inline-block; }
      .badge-OPEN { background: rgba(234,179,8,0.1); color: #fde047; border: 1px solid rgba(234,179,8,0.3); }
      .dot-OPEN { background: #facc15; }
      .badge-IN_PROGRESS { background: rgba(59,130,246,0.1); color: #93c5fd; border: 1px solid rgba(59,130,246,0.3); }
      .dot-IN_PROGRESS { background: #000000; }
      .badge-RESOLVED { background: rgba(74,222,128,0.1); color: #86efac; border: 1px solid rgba(74,222,128,0.3); }
      .dot-RESOLVED { background: #4ade80; }

      .adm-ticket-title { font-size: 14px; font-weight: 600; color: #000000; line-height: 1.4; }
      .adm-ticket-desc { font-size: 12px; color: #000000; margin-top: 6px; line-height: 1.6; }
      .adm-ticket-meta {
        display: flex; flex-wrap: wrap; align-items: center; gap: 14px; margin-top: 12px; padding-top: 12px;
        border-top: 1px solid rgba(255,255,255,0.05); font-size: 11px; color: #000000;
      }
      
      .adm-attach-btn {
        display: inline-flex; align-items: center; gap: 6px;
        background: rgb(143, 165, 236); border: 1px solid rgb(63, 116, 216);
        color: #000000; padding: 5px 10px; border-radius: 7px;
        font-size: 11px; cursor: pointer; transition: all 0.2s; font-family: inherit;
      }
      .adm-attach-btn:hover { background: rgb(146, 182, 223); color: #000000; }

      
    `}</style>

    <div className="adm-root">


      {/* Navbar */}
      <header className="adm-topbar">
        <div>
          {/* Employee Dashboard text hata kar Logo Image lagayi hai */}
          <img 
            src="https://kathiawarstores.com/wp-content/uploads/2024/04/New_logo_selected_Final_Main-logo90yers.png" 
            alt="Kathiawar Stores Logo" 
            style={{ height: '50px', objectFit: 'contain', display: 'block' }} 
          />
          <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 6 }}>Helpdesk Ticket System</p>
          
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          {/* User Name & Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '13px', fontWeight: '500', color: '#e2e8f0' }}>
              Hi, {loggedInUserName}
            </span>
            <div style={{ 
              width: '32px', height: '32px', borderRadius: '50%', 
              background: 'rgba(99,102,241,0.15)', color: '#a5b4fc', 
              display: 'flex', alignItems: 'center', justifyContent: 'center', 
              fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(99,102,241,0.2)' 
            }}>
              {loggedInUserName.charAt(0).toUpperCase()}
            </div>
          </div>
            <button
              onClick={() => setProfileOpen(true)}
              className="adm-add-btn"
              style={{
                padding: '6px 12px',
                fontSize: '11px',
                background: 'rgba(99,102,241,0.15)',
                boxShadow: 'none',
                marginBottom: '6px'
              }}
            >
              <User size={13} />
              Profile
            </button>
          {/* Logout Button */}
          <button
            onClick={() => {
              localStorage.clear();
              window.location.href = "/";
            }}
            className="adm-btn-danger"
            style={{ padding: '6px 12px', fontSize: '11px' }}
          >
            <LogOut size={13} /> Logout
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main style={{ padding: '30px', maxWidth: '1600px', margin: '0 auto', width: '100%', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px', alignItems: 'start' }}>
        
        {/* Create Ticket */}
        <div className="adm-panel">
          <div className="adm-panel-header">
            <PlusCircle size={18} color="#6366f1" />
            <h2>Create New Ticket</h2>
          </div>
          
          <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              type="text"
              placeholder="Problem Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="adm-form-input"
            />
            
            <textarea
              rows="5"
              placeholder="Describe your issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="adm-form-input"
              style={{ resize: 'vertical' }}
            />
            
            <select
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              className="adm-form-input"
            >
              <option value="">-- Select Branch --</option>
              <option value="1">Head Office</option>
              <option value="2">JUBILEE HILLS</option>
              <option value="3">ABIDS</option>
              <option value="4">SECUNDERABAD</option>
              <option value="5">GACHIBOWLI</option>
              <option value="6">KS BEAUTY CENTRE</option>
            </select>
            
              <input
              key={fileInputKey}
              id="ticket-file-input"
              type="file"
              onChange={(e) => {
                setFile(e.target.files[0]);
                setShowAttachMenu(false);
              }}
              style={{ display: "none" }}
            />
            
            <div style={{ position: "relative" }}>

  <button
    type="button"
    className="adm-add-btn"
    onClick={() => setShowAttachMenu(!showAttachMenu)}
    style={{
      background: "rgba(111, 113, 231, 0.15)",
      boxShadow: "none",
      border: "1px solid rgba(99,102,241,0.25)",
      color: "#000000",
    }}
  >
    <Paperclip size={15} />
    Attach File
  </button>

  {showAttachMenu && (
    <div
      style={{
        position: "absolute",
        top: "110%",
        left: 0,
        width: "180px",
        background: "#0f172a",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "10px",
        overflow: "hidden",
        zIndex: 50,
      }}
    >

      <button
        type="button"
        onClick={() => {
          document
            .getElementById("ticket-file-input")
            ?.click();
        }}
        style={{
          width: "100%",
          padding: "5px",
          textAlign: "left",
          background: "transparent",
          border: "none",
          color: "#e2e8f0",
          cursor: "pointer",
        }}
      >
        📁 Choose File
      </button>

      <button
        type="button"
        onClick={() => {
          setShowAttachMenu(false);
          captureScreenshot();
        }}
        style={{
          width: "100%",
          padding: "5px",
          textAlign: "left",
          background: "transparent",
          border: "none",
          color: "#e2e8f0",
          cursor: "pointer",
          borderTop: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        📸 Take Screenshot
      </button>

    </div>
  )}

</div>
{file && (
  <div
    style={{
      background: "rgba(99,102,241,0.08)",
      border: "1px solid rgba(99,102,241,0.25)",
      borderRadius: "10px",
      padding: "10px 12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "10px",
    }}
  >
    <div>
      <p
        style={{
          fontSize: 12,
          color: "#c7d2fe",
          fontWeight: 600,
        }}
      >
        📎 1 file attached
      </p>

      <p
        style={{
          fontSize: 11,
          color: "#94a3b8",
          marginTop: 3,
        }}
      >
        {file.name}
      </p>
    </div>

    <button
      type="button"
      onClick={() => {
        setFile(null);
        setFileInputKey(Date.now());
      }}
      style={{
        background: "rgba(239,68,68,0.12)",
        border: "1px solid rgba(239,68,68,0.25)",
        color: "#f87171",
        borderRadius: "8px",
        padding: "6px 8px",
        cursor: "pointer",
        fontSize: 11,
      }}
    >
      Remove
    </button>
  </div>
)}
           
            <button
                type="submit"
                disabled={ticketLoading}
                className="adm-add-btn"
                style={{ marginTop: "8px" }}
              >
                {ticketLoading ? "Creating Ticket..." : "Submit Ticket"}
            </button>
          </form>
        </div>

        {/* Ticket History */}
        <div className="adm-panel">
          <div className="adm-panel-header">
            <History size={18} color="#4ade80" />
            <h2>My Ticket History</h2>
          </div>
          
          <div className="adm-ticket-list adm-scroll">
            {tickets.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <History size={32} color="#1e293b" style={{ margin: '0 auto', marginBottom: '12px' }} />
                <p style={{ color: '#475569', fontSize: '13px' }}>No tickets found in history</p>
              </div>
            )}

            {tickets.map((ticket) => {
              // Status Styling fallback (OPEN, IN_PROGRESS, RESOLVED)
              const statusKey = ticket.status === "Pending" ? "OPEN" : ticket.status === "Running" ? "IN_PROGRESS" : ticket.status === "Completed" ? "RESOLVED" : ticket.status || "OPEN";
              const ticketComments = comments[ticket.id] || [];

              return (
                <div key={ticket.id} className="adm-ticket-card">
                  <div className="adm-ticket-top">
                    <h3 className="adm-ticket-title">{ticket.title}</h3>
                    <span className={`adm-status-badge badge-${statusKey}`}>
                      <span className={`adm-status-dot dot-${statusKey}`} />
                      {ticket.status}
                    </span>
                  </div>
                  
                  <p className="adm-ticket-desc">{ticket.description}</p>
                  
                  <div className="adm-ticket-meta">
                    <span>🏢 Branch: {ticket.branch?.branchName || "N/A"}</span>
                    <span>⏱ Priority: {ticket.priority || "Normal"}</span>
                    <span>📅 {new Date(ticket.createdAt).toLocaleString()}</span>
                  </div>

                  {ticket.attachments?.length > 0 && (
                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                      <p style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attachments</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                        {ticket.attachments.map((attachment) => (
                          <button
                            key={attachment.id}
                            onClick={() => downloadAttachment(attachment.id, attachment.originalFileName)}
                            className="adm-attach-btn"
                          >
                            {getFileIcon(attachment.originalFileName)}
                            <span>{attachment.originalFileName}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Chat Box (Admin theme style) */}
                  <div className="adm-chat-box">
                    <div className="adm-chat-header">
                      <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                      </svg>
                      Comments
                      <span className="adm-chat-count">{ticketComments.length}</span>
                    </div>

                    <div className="adm-chat-messages adm-scroll">
                      {ticketComments.length === 0 ? (
                        <p className="adm-chat-empty">No comments yet.</p>
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

                    {/* Chat Input Row */}
                    <div className="adm-chat-input-row">
                      <input
                        className="adm-chat-input"
                        type="text"
                        placeholder="Write a comment..."
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
            })}
          </div>
        </div>
      </main>
      {profileOpen && (
  <div
    style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.65)",
      backdropFilter: "blur(6px)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    }}
  >
    <div
      style={{
        width: "380px",
        background: "#0a0f1e",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "18px",
        padding: "24px",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        gap: "14px",
      }}
    >

      <button
        onClick={() => setProfileOpen(false)}
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          width: "32px",
          height: "32px",
          borderRadius: "50%",
          border: "1px solid rgba(255,255,255,0.08)",
          background: "rgba(255,255,255,0.04)",
          color: "#cbd5e1",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <X size={14} />
      </button>

      <div>
        <h2
          style={{
            fontSize: "20px",
            fontWeight: "700",
            color: "#f8fafc",
          }}
        >
          My Profile
        </h2>

        <p
          style={{
            fontSize: "12px",
            color: "#64748b",
            marginTop: "4px",
          }}
        >
          {profileData?.email}
        </p>
      </div>

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
          disabled={profileLoading}
        >
          {profileLoading ? "Updating..." : "Update Profile"}
        </button>

    </div>
  </div>
)}
    </div>
  </>
);
}

export default EmployeeDashboard;