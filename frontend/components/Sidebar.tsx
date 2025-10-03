import React from "react";
import Link from "next/link";
export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="brand">Cocoinbox</div>
      <nav>
        <ul>
          <li><Link href="/dashboard">Dashboard</Link></li>
          <li><Link href="/messages">Messages</Link></li>
          <li><Link href="/files">Files</Link></li>
          <li><Link href="/settings">Settings</Link></li>
        </ul>
      </nav>
      <style jsx>{`
        .sidebar {
          width: 240px;
          background: #111827;
          color: white;
          padding: 16px;
          min-height: calc(100vh - 64px);
        }
        .brand { font-weight: bold; margin-bottom: 16px; }
        nav ul { list-style: none; padding: 0; margin: 0; }
        nav li { margin: 8px 0; }
        nav a { color: #d1d5db; text-decoration: none; }
        @media (max-width: 900px) {
          .sidebar { display: none; }
        }
      `}</style>
    </aside>
  );
}