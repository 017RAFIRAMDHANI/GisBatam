'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface NavDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NavDrawer({ isOpen, onClose }: NavDrawerProps) {
  const [asetOpen, setAsetOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`nav-overlay${isOpen ? ' show' : ''}`}
        style={{ display: isOpen ? 'block' : 'none' }}
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`nav-drawer${isOpen ? ' show' : ''}`}>
        {/* Header */}
        <div className="drawer-header">
          <div className="drawer-brand">
            <svg width="26" height="26" viewBox="0 0 30 30" fill="none">
              <g transform="translate(15,15) rotate(45) translate(-9,-9)">
                <rect x="0" y="0" width="8" height="8" rx="1.2" fill="#27ae60" />
                <rect x="10" y="0" width="8" height="8" rx="1.2" fill="#f39c12" />
                <rect x="0" y="10" width="8" height="8" rx="1.2" fill="#3498db" />
                <rect x="10" y="10" width="8" height="8" rx="1.2" fill="#2ecc71" />
              </g>
            </svg>
            <span>SingSet</span>
          </div>
          <div className="drawer-close" onClick={onClose}>
            <svg viewBox="0 0 24 24">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </div>
        </div>

        <div className="drawer-section-label">Menu</div>

        {/* Peta Sebaran */}
        <Link className="drawer-item active" href="/" onClick={onClose}>
          <svg viewBox="0 0 24 24">
            <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
          </svg>
          Peta Sebaran
        </Link>

        {/* Pengelola Aset accordion */}
        <div
          className={`drawer-item${asetOpen ? ' open' : ''}`}
          onClick={() => setAsetOpen(prev => !prev)}
        >
          <svg viewBox="0 0 24 24">
            <rect x="2" y="3" width="20" height="14" rx="2" />
            <path d="M8 21h8M12 17v4" />
          </svg>
          Pengelola Aset
          <svg className="di-caret" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>

        <div className={`drawer-sub${asetOpen ? ' open' : ''}`}>
          <Link className="drawer-sub-item" href="/daftar_aset" onClick={onClose}>
            <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="2" /><line x1="3" y1="9" x2="21" y2="9" /><line x1="9" y1="21" x2="9" y2="9" /></svg>
            Daftar Aset
          </Link>
          <Link className="drawer-sub-item" href="/dokumen_aset" onClick={onClose}>
            <svg viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
            Dokumen Aset
          </Link>
          <Link className="drawer-sub-item" href="/detail_aset" onClick={onClose}>
            <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
            Detail Aset
          </Link>
          <Link className="drawer-sub-item" href="/tambah_aset" onClick={onClose}>
            <svg viewBox="0 0 24 24"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            Tambah Aset Baru
          </Link>
          <Link className="drawer-sub-item" href="/validasi_data" onClick={onClose}>
            <svg viewBox="0 0 24 24"><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></svg>
            Validasi Data
          </Link>
        </div>

        {/* Infografis */}
        <Link className="drawer-item" href="/infografis" onClick={onClose}>
          <svg viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4l3 3" />
          </svg>
          Infografis
        </Link>

        {/* Laporan Aset */}
        <Link className="drawer-item" href="/laporan_aset" onClick={onClose}>
          <svg viewBox="0 0 24 24">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
          </svg>
          Laporan Aset
        </Link>

        <div className="drawer-divider" />

        {/* Minimize */}
        <div className="drawer-minimize" onClick={onClose}>
          <svg viewBox="0 0 24 24">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Minimize
        </div>

        {/* User */}
        <div className="drawer-user">
          <div className="du-icon">
            <svg viewBox="0 0 24 24">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
          <div className="drawer-user-info">
            <div className="drawer-user-name">Admin BPKAD</div>
            <div className="drawer-user-role">Administrator</div>
          </div>
          <svg className="du-arr" viewBox="0 0 24 24">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </div>
      </div>
    </>
  );
}