'use client';

import { useState } from 'react';
import Navbar from '../components/Navbar';
import NavDrawer from '../components/Navdrawer';
import '../styles/infografis.css';
import AppShell from '../components/AppShell';

export default function InfografisPage() {
 

  return (
    <AppShell>
    
        <div className="ig-container">
          
          {/* 1. Header Area */}
          <div className="ig-row">
            <div className="ig-header-card">
              <div className="ig-title-area">
                <svg className="ig-title-icon" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                <h1 className="ig-page-title">Monitoring</h1>
              </div>
              <button className="ig-btn-download" onClick={() => window.print()}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Export ke PDF (Frontend)
              </button>
            </div>
          </div>

          {/* 2. Top 4 Cards Grid */}
          <div className="ig-row ig-cards-grid">
            <div className="ig-card">
              <div className="ig-card-icon-box">
                <svg viewBox="0 0 24 24"><path d="M3 21h18M5 21V9l7-6 7 6v12M9 21v-6h6v6"/></svg>
              </div>
              <div className="ig-card-content">
                <div className="ig-card-title">Jumlah Reklame</div>
                <div className="ig-card-val-big">38</div>
              </div>
            </div>

            <div className="ig-card">
              <div className="ig-card-icon-box">
                <svg viewBox="0 0 24 24"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div className="ig-card-content">
                <div className="ig-card-title">Status Reklame</div>
                <div className="ig-sub-stats">
                  <div className="ig-sub-item">
                    <span className="ig-sub-label">Aktif</span>
                    <span className="ig-sub-val">1292</span>
                  </div>
                  <div className="ig-sub-item">
                    <span className="ig-sub-label">Tidak Aktif</span>
                    <span className="ig-sub-val">236</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ig-card">
              <div className="ig-card-icon-box">
                <svg viewBox="0 0 24 24"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>
              </div>
              <div className="ig-card-content">
                <div className="ig-card-title">Pelanggaran</div>
                <div className="ig-sub-stats">
                  <div className="ig-sub-item">
                    <span className="ig-sub-label">Tanpa Izin</span>
                    <span className="ig-sub-val">1292</span>
                  </div>
                  <div className="ig-sub-item">
                    <span className="ig-sub-label">Zona Larangan</span>
                    <span className="ig-sub-val">236</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="ig-card">
              <div className="ig-card-icon-box">
                <svg viewBox="0 0 24 24"><circle cx="8" cy="8" r="4"/><circle cx="16" cy="16" r="4"/><path d="M10.5 13.5l3-3"/></svg>
              </div>
              <div className="ig-card-content">
                <div className="ig-card-title">Jumlah Sanksi</div>
                <div className="ig-sub-stats">
                  <div className="ig-sub-item">
                    <span className="ig-sub-label">Aktif</span>
                    <span className="ig-sub-val">1292</span>
                  </div>
                  <div className="ig-sub-item">
                    <span className="ig-sub-label">Selesai</span>
                    <span className="ig-sub-val">236</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Filter Section */}
          <div className="ig-row ig-filter-card">
            <div className="ig-filter-hd">
              <div className="ig-filter-title">
                <svg viewBox="0 0 24 24"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filter Data
              </div>
              <div className="ig-filter-actions">
                <button className="ig-btn-apply">Apply</button>
                <button className="ig-btn-reset">Reset</button>
              </div>
            </div>
            <div className="ig-filter-grid">
              {/* Item 1 */}
              <div className="ig-filter-input">
                <label className="ig-filter-lbl">Kabupaten/Kota</label>
                <div className="ig-filter-display">
                  Pilih Kabupaten/Kota
                  <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <select className="ig-filter-select">
                  <option>Pilih Kabupaten/Kota</option>
                  {['Bandung', 'Bekasi', 'Bogor', 'Depok', 'Cirebon'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>

              {/* Item 2 */}
              <div className="ig-filter-input">
                <label className="ig-filter-lbl">Kategori</label>
                <div className="ig-filter-display">
                  Pilih Kategori
                  <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <select className="ig-filter-select">
                  <option>Pilih Kategori</option>
                  {['Billboard', 'Neon Box', 'Megatron', 'Videotron'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>

              {/* Item 3 */}
              <div className="ig-filter-input">
                <label className="ig-filter-lbl">Status Perizinan</label>
                <div className="ig-filter-display">
                  Pilih Status Perizinan
                  <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <select className="ig-filter-select">
                  <option>Pilih Status Perizinan</option>
                  {['Aktif / Berizin', 'Menunggu Validasi', 'Belum Berizin', 'Kadaluarsa'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>

              {/* Item 4 */}
              <div className="ig-filter-input">
                <label className="ig-filter-lbl">Pelanggaran</label>
                <div className="ig-filter-display">
                  Pilih Pelanggaran
                  <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <select className="ig-filter-select">
                  <option>Pilih Pelanggaran</option>
                  {['Tanpa Pelanggaran', 'Tanpa Izin', 'Zona Larangan'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>

              {/* Item 5 */}
              <div className="ig-filter-input">
                <label className="ig-filter-lbl">Status Sanksi</label>
                <div className="ig-filter-display">
                  Pilih Status Sanksi
                  <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <select className="ig-filter-select">
                  <option>Pilih Status Sanksi</option>
                  {['Tanpa Sanksi', 'Sanksi Aktif', 'Selesai'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>

              {/* Item 6 */}
              <div className="ig-filter-input">
                <label className="ig-filter-lbl">Tahun Data</label>
                <div className="ig-filter-display">
                  2026
                  <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9"/></svg>
                </div>
                <select className="ig-filter-select" defaultValue="2026">
                  {['2024', '2025', '2026', '2027'].map(v => <option key={v}>{v}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* 4. Wide Row Cards */}
          <div className="ig-row ig-wide-grid">
            <div className="ig-box-card">
              <div className="ig-box-title">Luas Aset Dan Nilai Perolehan</div>
              <div className="ig-luas-grid">
                <div className="ig-inner-card">
                  <div className="ig-inner-hd">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    Reklame Tersewa
                  </div>
                  <div className="ig-inner-lbl">Total Lokasi</div>
                  <div className="ig-inner-val">1879</div>
                </div>
                <div className="ig-inner-card">
                  <div className="ig-inner-hd">
                     <svg viewBox="0 0 24 24"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    Nilai Perolehan
                  </div>
                  <div className="ig-inner-lbl">Total Nilai Perolehan</div>
                  <div className="ig-inner-val">Rp 123.800.000.000,-</div>
                </div>
              </div>
            </div>

            <div className="ig-box-card">
              <div className="ig-box-title">Grafik Status Pelanggaran</div>
              <div className="ig-chart-flex">
                <div className="ig-legend-grid">
                  
                  <div className="ig-leg-item">
                    <div className="ig-leg-top"><div className="ig-dot ig-c1"></div> Tanpa Izin</div>
                    <div className="ig-leg-val">
                      <span className="ig-leg-val-num" style={{ color: '#0ea5e9'}}>1180</span>
                      <span className="ig-leg-val-unit">Aset(s)</span>
                    </div>
                  </div>
                  
                  <div className="ig-leg-item">
                    <div className="ig-leg-top"><div className="ig-dot ig-c2"></div> Zona Larangan</div>
                    <div className="ig-leg-val">
                      <span className="ig-leg-val-num" style={{ color: '#22c55e'}}>521</span>
                      <span className="ig-leg-val-unit">Aset(s)</span>
                    </div>
                  </div>
                  
                  <div className="ig-leg-item">
                    <div className="ig-leg-top"><div className="ig-dot ig-c3"></div> Kadalurasa</div>
                    <div className="ig-leg-val">
                      <span className="ig-leg-val-num" style={{ color: '#eab308'}}>433</span>
                      <span className="ig-leg-val-unit">Aset(s)</span>
                    </div>
                  </div>
                  
                  <div className="ig-leg-item">
                    <div className="ig-leg-top"><div className="ig-dot ig-c4"></div> Sengketa</div>
                    <div className="ig-leg-val">
                      <span className="ig-leg-val-num" style={{ color: '#f97316'}}>215</span>
                      <span className="ig-leg-val-unit">Aset(s)</span>
                    </div>
                  </div>

                </div>

                <div className="ig-donut-chart">
                   <span className="ig-donut-pct">75%</span>
                </div>
              </div>
            </div>
          </div>

          {/* 5. Bottom Card */}
          <div className="ig-row ig-box-card">
            <div className="ig-box-title" style={{ marginBottom: '0' }}>Jumlah Titik Reklame Tersewa</div>
            <div className="ig-bottom-content">
              <div className="ig-bot-hd">
                <div className="ig-bot-val">585</div>
                <div className="ig-bot-pct">65%</div>
              </div>
              <div className="ig-progress-bg">
                <div className="ig-progress-fill" style={{ width: '65%' }}></div>
              </div>
              <div className="ig-bot-legend">
                <div className="ig-bot-leg-item">
                  <div className="ig-dot ig-c2"></div> Tersewa
                </div>
                <div className="ig-bot-leg-item">
                  <div className="ig-dot" style={{ background: '#cbd5e1'}}></div> Belum Tersewa
                </div>
              </div>
            </div>
          </div>

          {/* 6. New Section: Jumlah Aset Per Kota (Grouped Bar Chart) */}
          <div className="ig-row ig-box-card">
            <div className="ig-box-title">Jumlah Aset Per Kota</div>
            
            <div className="ig-chart-container">
              <div className="ig-chart-main">
                {/* Y-Axis Label */}
                <div className="ig-y-axis-label">Jumlah Aset</div>
                {/* Y-Axis */}
                <div className="ig-y-axis">
                  {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200].map(val => (
                    <span key={val}>{val}</span>
                  ))}
                </div>

                {/* Grid Lines */}
                <div className="ig-grid-lines">
                  {[0, 20, 40, 60, 80, 100, 120, 140, 160, 180, 200].map(val => (
                    <div key={val} className="ig-grid-line"></div>
                  ))}
                </div>

                {/* Bars Area */}
                <div className="ig-bars-area">
                  {[
                    { name: 'Simpang Nagoya', data: [125, 102, 88] },
                    { name: 'Simpang Empat', data: [163, 133, 115] },
                    { name: 'Simpang Lima', data: [102, 83, 72] },
                    { name: 'Simpang Tiga', data: [188, 155, 133] },
                    { name: 'Simpang Batam', data: [139, 114, 98] },
                    { name: 'Ruas Jalan', data: [170, 140, 121] },
                    { name: 'Simpang Batam', data: [88, 72, 63] },
                    { name: 'Simpang Lima', data: [139, 114, 98] },
                    { name: 'Simpang Empat', data: [163, 133, 115] },
                    { name: 'Kab. K', data: [139, null, null] } // Data dummy untuk mensimulasikan missing data di Kab K
                  ].map((group, idx) => (
                    <div key={idx} className="ig-group-wrap">
                      <div className="ig-bars-group">
                        {group.data[0] !== null && <div className="ig-bar-item ig-b-blue" style={{ height: `${(group.data[0] / 200) * 100}%` }}></div>}
                        {group.data[1] !== null && <div className="ig-bar-item ig-b-green" style={{ height: `${(group.data[1] / 200) * 100}%` }}></div>}
                        {group.data[2] !== null && <div className="ig-bar-item ig-b-yellow" style={{ height: `${(group.data[2] / 200) * 100}%` }}></div>}
                      </div>
                      <span className="ig-group-label">{group.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="ig-chart-legend">
                <div className="ig-leg-item-simple">
                  <div className="ig-dot-s ig-b-blue"></div> Jumlah Aset
                </div>
                <div className="ig-leg-item-simple">
                  <div className="ig-dot-s ig-b-green"></div> Bersertifikat
                </div>
                <div className="ig-leg-item-simple">
                  <div className="ig-dot-s ig-b-yellow"></div> Diproses
                </div>
              </div>
            </div>
          </div>

        </div>
      
    </AppShell>
  );
}
