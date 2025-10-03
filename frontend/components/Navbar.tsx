import React from "react";

type Props = {
  title?: string;
};

export default function Navbar({ title }: Props) {
  return (
    <header className="navbar">
      <div className="left">
        <button className="hamburger" aria-label="Open Menu">☰</button>
        <div className="title">{title || "Cocoinbox"}</div>
      </div>
      <div className="right">
        <button>🔔</button>
        <button>Profile</button>
      </div>
      <style jsx>{`
        .navbar {
          height: 64px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0 16px;
          background: #fff;
          border-bottom: 1px solid #e5e7eb;
          position: sticky;
          top: 0;
          z-index: 40;
        }
        .left { display: flex; align-items: center; gap: 12px; }
        .hamburger { display: none; }
        @media (max-width: 900px) {
          .hamburger { display: inline-block; }
        }
      `}</style>
    </header>
  );
}