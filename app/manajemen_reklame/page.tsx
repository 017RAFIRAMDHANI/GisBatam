"use client";

import React, { useState, useEffect } from "react";
import AppShell from "../components/AppShell";
import { useRouter } from "next/navigation";
// ================= TYPE (sesuai API Django) =================
type Aset = {
  id: string;
  kode_reklame: string;
  nama_pemilik: string;
  nik_npwp: string;
  latitude: string;
  longitude: string;
  luas_m2: string;
  tinggi_m: string;
  status_reklame: string;
  tanggal_pasang: string;
  kategori: string | null;
  zona: string | null;
};

// ================= STYLE =================
const styles: { [key: string]: React.CSSProperties } = {
  page: { background: "rgba(251, 251, 250, 1)", padding: 24, fontFamily: "sans-serif" },
  card: {
    background: "rgba(251, 251, 250, 1)",
    borderRadius: 12,
    padding: 20,
  
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: { fontSize: 18, fontWeight: 600 },
  searchBox: { display: "flex", gap: 10 },
  input: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #ddd",
    width: 260,
  },
  btnPrimary: {
    background: "#1a8fe3",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "10px 16px",
    cursor: "pointer",
  },
  filterBox: {
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    padding: 16,
    marginBottom: 20,
    backgroundColor:"#fff"
  },
  filterRow: { display: "flex", gap: 10, flexWrap: "wrap" },
  select: {
    padding: "10px",
    borderRadius: 8,
    border: "1px solid #ddd",
    minWidth: 180,
  },
  tableWrap: { overflowX: "auto" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1200,
  },
  th: {
    textAlign: "left",
    fontSize: 12,
    color: "#6b7280",
    padding: 10,
    borderBottom: "2px solid #eee",
    whiteSpace: "nowrap",
  },
  td: {
    padding: 12,
    borderBottom: "1px solid #eee",
    fontSize: 13,
    verticalAlign: "top",
    backgroundColor: "#fff"
  },
  badge: {
    background: "#e6f7ee",
    color: "#16a34a",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
  },
  badgeInaktif: {
    background: "#fef2f2",
    color: "#dc2626",
    padding: "4px 10px",
    borderRadius: 20,
    fontSize: 12,
  },
  aksi: { cursor: "pointer", fontSize: 18 },
  pagination: {
    display: "flex",
    justifyContent: "space-between",
    marginTop: 16,
    alignItems: "center",
  },
  pager: { display: "flex", gap: 6 },
  pageBtn: {
    padding: "6px 10px",
    border: "1px solid #ddd",
    borderRadius: 6,
    cursor: "pointer",
    background: "#fff",
    fontSize: 13,
    minWidth: 34,
    height: 34,
},
  activePage: {
    background: "#1a8fe3",
    color: "#fff",
    border: "1px solid #1a8fe3",
  },
  loading: {
    textAlign: "center",
    padding: 40,
    color: "#888",
    fontSize: 14,
  },
  error: {
    textAlign: "center",
    padding: 40,
    color: "#dc2626",
    fontSize: 14,
  },
};

// ================= COMPONENT =================
export default function Page() {
  const [asetData, setAsetData] = useState<Aset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [checked, setChecked] = useState<{ [key: string]: boolean }>({});
  const [checkedAll, setCheckedAll] = useState(false);
  const [page, setPage] = useState(1);
  const router = useRouter();
  const PER_PAGE = 5;

  // ====== Fetch data dari Django API ======
  useEffect(() => {
    fetch("http://localhost:8000/api/reklame/")
      .then((res) => {
        if (!res.ok) throw new Error("Gagal mengambil data");
        return res.json();
      })
      .then((data) => {
        setAsetData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError("Gagal konek ke server. Pastikan Django berjalan di port 8000.");
        setLoading(false);
        console.error(err);
      });
  }, []);

 

 
  // ====== Filter berdasarkan search ======
// ====== Filter berdasarkan search ======
const filtered = asetData.filter((a) =>
  a.nama_pemilik?.toLowerCase().includes(search.toLowerCase())
);

// ====== Pagination ======
const totalPages = Math.ceil(filtered.length / PER_PAGE);
const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

const getPaginationItems = (currentPage: number, totalPages: number) => {
  const delta = 1;
  const range: (number | string)[] = [];
  const pages: number[] = [];

  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 ||
      i === totalPages ||
      (i >= currentPage - delta && i <= currentPage + delta)
    ) {
      pages.push(i);
    }
  }

  let lastPage = 0;

  pages.forEach((p) => {
    if (lastPage && p - lastPage > 1) {
      range.push(`ellipsis-${lastPage}`);
    }

    range.push(p);
    lastPage = p;
  });

  return range;
};

const paginationItems = getPaginationItems(page, totalPages);

const goToPage = (targetPage: number) => {
  if (targetPage < 1 || targetPage > totalPages) return;
  setPage(targetPage);
};
  // ====== Checkbox ======
const toggleAll = () => {
  const next = !checkedAll;
  setCheckedAll(next);
  const map: { [key: string]: boolean } = {};
  paginated.forEach((r) => (map[r.kode_reklame] = next));
  setChecked(map);
};

const toggleOne = (kode_reklame: string) => {
  setChecked((prev) => ({
    ...prev,
    [kode_reklame]: !prev[kode_reklame],
  }));
};
  return (
 <AppShell>
    <div style={styles.page}>
      <div style={styles.card}>

        {/* HEADER */}
        <div style={styles.header}>
          <div style={styles.title}>Manajemen Reklame</div>
          <div style={styles.searchBox}>
         

            <input
              placeholder="Cari Berdasarkan Nama Pemilik"
              style={styles.input}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
            <button style={styles.btnPrimary}>Download CSV</button>
          </div>
        </div>

        {/* FILTER */}
        <div style={styles.filterBox}>
          <div style={{ marginBottom: 10, fontWeight: 600 }}>Filter Data</div>
          <div style={styles.filterRow}>
            <select style={styles.select}>
              <option>Pilih Kabupaten/Kota</option>
            </select>
            <select style={styles.select}>
              <option>Pilih Pengguna</option>
            </select>
            <select style={styles.select}>
              <option>Pilih Kuasa Pengguna</option>
            </select>
            <select style={styles.select}>
              <option>Pilih Tipe Zona</option>
            </select>
            <button style={styles.btnPrimary}>Cari</button>
            <button style={styles.pageBtn}>Reset</button>
          </div>
        </div>

        {/* TABLE */}
        {loading ? (
          <div style={styles.loading}>⏳ Memuat data dari server...</div>
        ) : error ? (
          <div style={styles.error}>⚠️ {error}</div>
        ) : (
          <div style={styles.tableWrap}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>
                    <input type="checkbox" onChange={toggleAll} checked={checkedAll} />
                  </th>
                  <th style={styles.th}>Kode Reklame</th>
                  <th style={styles.th}>Nama Pemilik</th>
                  <th style={styles.th}>NIK/NPWP</th>
                  <th style={styles.th}>Koordinat</th>
                  <th style={styles.th}>Luas (m²)</th>
                  <th style={styles.th}>Tinggi (m)</th>
                  <th style={styles.th}>Status</th>
                  <th style={styles.th}>Tanggal Pasang</th>
                  <th style={styles.th}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      style={{ ...styles.td, textAlign: "center", color: "#888" }}
                    >
                      Tidak ada data ditemukan
                    </td>
                  </tr>
                ) : (
                  paginated.map((row) => (
                    <tr key={row.kode_reklame}>
                      <td style={styles.td}>
                        <input
                          type="checkbox"
                          checked={!!checked[row.kode_reklame]}
                          onChange={() => toggleOne(row.kode_reklame)}
                        />
                      </td>
                      <td style={styles.td}>{row.kode_reklame}</td>
                      <td style={styles.td}>{row.nama_pemilik}</td>
                      <td style={styles.td}>{row.nik_npwp || "-"}</td>
                      <td style={styles.td}>
                        {row.latitude}, {row.longitude}
                      </td>
                      <td style={styles.td}>{row.luas_m2 || "-"}</td>
                      <td style={styles.td}>{row.tinggi_m || "-"}</td>
                      <td style={styles.td}>
                        <span
                          style={
                            row.status_reklame === "AKTIF"
                              ? styles.badge
                              : styles.badgeInaktif
                          }
                        >
                          {row.status_reklame || "-"}
                        </span>
                      </td>
                      <td style={styles.td}>{row.tanggal_pasang || "-"}</td>
                      <td style={styles.td}>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            style={styles.pageBtn}
                            onClick={() =>
                              router.push(
                                `/manajemen_reklame/detail/${encodeURIComponent(row.kode_reklame)}`
                              )
                            }
                          >
                            Detail
                          </button>

                          <button
                            style={styles.btnPrimary}
                            onClick={() =>
                              router.push(
                                `/manajemen_reklame/edit/${encodeURIComponent(row.kode_reklame)}`
                              )
                            }
                          >
                            Edit
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* PAGINATION */}
      {/* PAGINATION */}
{!loading && !error && filtered.length > 0 && (
  <div style={styles.pagination}>
    <div>
      Menampilkan {(page - 1) * PER_PAGE + 1} sampai{" "}
      {Math.min(page * PER_PAGE, filtered.length)} dari {filtered.length} data
    </div>

    <div style={styles.pager}>
      <button
        type="button"
        style={{
          ...styles.pageBtn,
          opacity: page === 1 ? 0.5 : 1,
          cursor: page === 1 ? "not-allowed" : "pointer",
        }}
        disabled={page === 1}
        onClick={() => goToPage(page - 1)}
      >
        &lt;
      </button>

      {paginationItems.map((item, index) => {
        if (typeof item === "string") {
          return (
            <div
              key={`${item}-${index}`}
              style={{
                ...styles.pageBtn,
                cursor: "default",
                border: "none",
                background: "transparent",
              }}
            >
              ...
            </div>
          );
        }

        return (
          <button
            type="button"
            key={item}
            style={
              item === page
                ? { ...styles.pageBtn, ...styles.activePage }
                : styles.pageBtn
            }
            onClick={() => goToPage(item)}
          >
            {item}
          </button>
        );
      })}

      <button
        type="button"
        style={{
          ...styles.pageBtn,
          opacity: page === totalPages ? 0.5 : 1,
          cursor: page === totalPages ? "not-allowed" : "pointer",
        }}
        disabled={page === totalPages}
        onClick={() => goToPage(page + 1)}
      >
        &gt;
      </button>
    </div>
  </div>
)}

      </div>
    </div>
</AppShell>
  );
}