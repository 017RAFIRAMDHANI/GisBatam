"use client";

import { useEffect, useRef, useState } from "react";
import type { Map as LeafletMap } from "leaflet";

export default function MapArea() {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<LeafletMap | null>(null);
    const [ready, setReady] = useState(false);

    const JABAR_BOUNDS: [[number, number], [number, number]] = [
        [-7.83, 106.20],
        [-5.85, 108.90],
    ];

    useEffect(() => {
        if (typeof window === "undefined" || !mapRef.current) return;
        if (mapInstanceRef.current) return;

        let mounted = true;

        const initMap = async () => {
            const L = (await import("leaflet")).default;

            // Inject Leaflet CSS sekali saja
            if (!document.querySelector('link[href*="leaflet@1.9.4"]')) {
                const link = document.createElement("link");
                link.rel = "stylesheet";
                link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
                document.head.appendChild(link);
            }

            if (!mounted || !mapRef.current) return;

            // Fix icon default di Next.js
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            delete (L.Icon.Default.prototype as any)._getIconUrl;
            L.Icon.Default.mergeOptions({
                iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
                iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
                shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
            });

            const map = L.map(mapRef.current, {
                center: [-6.90389, 107.61861],
                zoom: 8,
                minZoom: 7,
                maxZoom: 18,
                zoomControl: false,
                attributionControl: true,
            });

            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap contributors",
                maxZoom: 19,
            }).addTo(map);

            map.fitBounds(JABAR_BOUNDS);
            mapInstanceRef.current = map;

            if (mounted) setReady(true);
        };

        initMap();

        return () => {
            mounted = false;
            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Handlers ────────────────────────────────────────────────────

    const handleZoomIn = () => {
        const map = mapInstanceRef.current;
        if (!map) return;
        map.setZoom(map.getZoom() + 1);
    };

    const handleZoomOut = () => {
        const map = mapInstanceRef.current;
        if (!map) return;
        map.setZoom(map.getZoom() - 1);
    };

    const handleResetView = () => {
        mapInstanceRef.current?.fitBounds(JABAR_BOUNDS);
    };

    const handleMyLocation = async () => {
        const map = mapInstanceRef.current;
        if (!map || !navigator.geolocation) return;
        const L = (await import("leaflet")).default;
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude: lat, longitude: lng } = pos.coords;
                map.setView([lat, lng], 14);
                L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup("Lokasi Anda")
                    .openPopup();
            },
            () => alert("Lokasi tidak dapat diakses.")
        );
    };

    const handleFullscreen = () => {
        const el = mapRef.current?.parentElement;
        if (!el) return;
        if (!document.fullscreenElement) {
            el.requestFullscreen?.();
        } else {
            document.exitFullscreen?.();
        }
    };

    const handlePan = async (dir: "up" | "down" | "left" | "right") => {
    const map = mapInstanceRef.current;
    if (!map) return;
    const L = (await import("leaflet")).default; // tambah import L
    const amount = 150;
    const center = map.getCenter();
    const point = map.latLngToContainerPoint(center);
    const newPoint = L.point(  // ← pakai L.point() bukan plain object
        point.x + (dir === "right" ? amount : dir === "left" ? -amount : 0),
        point.y + (dir === "down" ? amount : dir === "up" ? -amount : 0),
    );
    map.panTo(map.containerPointToLatLng(newPoint), { animate: true });
};

    // ── Render ───────────────────────────────────────────────────────

    return (
        <main className="map-area" style={{ position: "relative", overflow: "hidden" }}>

            {/* Map mount point */}
            <div ref={mapRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />

            {/* Loading overlay */}
            {!ready && (
                <div style={{
                    position: "absolute", inset: 0, zIndex: 10,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: "#e8edf3",
                }}>
                    <span style={{ fontSize: 14, color: "#a0aec0" }}>Memuat peta...</span>
                </div>
            )}

            {/* Tombol kanan — semua 7 button */}
            <div
                className="map-controls-right"
                style={{ zIndex: 1000, pointerEvents: "none" }}
            >
                <button className="map-btn" style={{ pointerEvents: "all" }} onClick={handleFullscreen} title="Fullscreen" type="button">
                    <svg viewBox="0 0 24 24">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                </button>

                <button className="map-btn" style={{ pointerEvents: "all" }} onClick={handleResetView} title="Reset View" type="button">
                    <svg viewBox="0 0 24 24">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                </button>

                <button className="map-btn" style={{ pointerEvents: "all" }} onClick={handleZoomIn} title="Zoom In" type="button">+</button>

                <button className="map-btn" style={{ pointerEvents: "all" }} onClick={handleZoomOut} title="Zoom Out" type="button">−</button>

                <button className="map-btn" style={{ pointerEvents: "all" }} onClick={handleMyLocation} title="Lokasi Saya" type="button">
                    <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3" />
                        <line x1="12" y1="2" x2="12" y2="7" />
                        <line x1="12" y1="17" x2="12" y2="22" />
                        <line x1="2" y1="12" x2="7" y2="12" />
                        <line x1="17" y1="12" x2="22" y2="12" />
                    </svg>
                </button>

                <button className="map-btn" style={{ pointerEvents: "all" }} title="Layer" type="button">
                    <svg viewBox="0 0 24 24">
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="8" y1="7" x2="8" y2="9" />
                        <line x1="12" y1="5" x2="12" y2="8" />
                        <line x1="16" y1="7" x2="16" y2="9" />
                    </svg>
                </button>

                <button className="map-btn" style={{ pointerEvents: "all" }} title="Checklist" type="button">
                    <svg viewBox="0 0 24 24">
                        <polyline points="9 11 12 14 22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                </button>

                <button className="map-btn" style={{ pointerEvents: "all" }} title="Riwayat" type="button">
                    <svg viewBox="0 0 24 24">
                        <polyline points="12 6 12 12 16 14" />
                        <circle cx="12" cy="12" r="9" />
                    </svg>
                </button>
            </div>

            {/* Navigation Pad — pojok kanan bawah */}
            <div style={{
                position: "absolute",
                bottom: 40,
                right: 14,
                zIndex: 1000,
                display: "grid",
                gridTemplateColumns: "repeat(3, 34px)",
                gridTemplateRows: "repeat(3, 34px)",
                gap: 3,
            }}>
                {/* Row 1 */}
                <div />
                <button className="map-btn" onClick={() => handlePan("up")} title="Pan Up" type="button">
                    <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15" /></svg>
                </button>
                <div />

                {/* Row 2 */}
                <button className="map-btn" onClick={() => handlePan("left")} title="Pan Left" type="button">
                    <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
                </button>
                <button className="map-btn" onClick={handleResetView} title="Reset" type="button">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="#555" /></svg>
                </button>
                <button className="map-btn" onClick={() => handlePan("right")} title="Pan Right" type="button">
                    <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                </button>

                {/* Row 3 */}
                <div />
                <button className="map-btn" onClick={() => handlePan("down")} title="Pan Down" type="button">
                    <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                <div />
            </div>

            {/* Scale */}
            <div className="map-scale" style={{ zIndex: 1000 }}>
                <span>400 km</span>
                <div className="scale-bar" />
            </div>

            {/* Credit */}
            <div className="map-credit" style={{ zIndex: 1000 }}>
                ©2021 Developed by Braga Technologies
            </div>

        </main>
    );
}