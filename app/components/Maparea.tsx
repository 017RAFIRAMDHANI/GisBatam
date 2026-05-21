"use client";

import { useEffect, useRef, useState } from "react";
import type { LayerGroup, Map as LeafletMap, Marker } from "leaflet";

export default function MapArea() {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<LeafletMap | null>(null);
    const poiLayerRef = useRef<LayerGroup | null>(null);
    const userMarkerRef = useRef<Marker | null>(null);
    const [ready, setReady] = useState(false);

    const JABAR_BOUNDS: [[number, number], [number, number]] = [
        [-7.83, 106.20],
        [-5.85, 108.90],
    ];

    useEffect(() => {
        if (typeof window === "undefined" || !mapRef.current) return;
        if (mapInstanceRef.current) return;

        let mounted = true;
        let poiTimer: ReturnType<typeof setTimeout> | null = null;

        const initMap = async () => {
            const L = (await import("leaflet")).default;

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
                maxZoom: 19,
                zoomControl: false,
                attributionControl: true,
            });

            // Tampilan map lama tetap dipakai
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap contributors",
                maxZoom: 19,
            }).addTo(map);

            map.fitBounds(JABAR_BOUNDS);
            mapInstanceRef.current = map;

            const poiLayer = L.layerGroup().addTo(map);
            poiLayerRef.current = poiLayer;

            const escapeHtml = (value: string) => {
                return value
                    .replaceAll("&", "&amp;")
                    .replaceAll("<", "&lt;")
                    .replaceAll(">", "&gt;")
                    .replaceAll('"', "&quot;")
                    .replaceAll("'", "&#039;");
            };

            const getCategoryName = (categories: string[] = []) => {
                const joined = categories.join(" ");

                if (joined.includes("religion.place_of_worship.islam")) return "Masjid / Musala";
                if (joined.includes("religion.place_of_worship")) return "Tempat Ibadah";
                if (joined.includes("building.place_of_worship")) return "Tempat Ibadah";
                if (joined.includes("religion")) return "Tempat Ibadah";

                if (joined.includes("commercial")) return "Toko / Komersial";
                if (joined.includes("catering")) return "Makanan / Minuman";
                if (joined.includes("service")) return "Jasa / Layanan";
                if (joined.includes("healthcare")) return "Kesehatan";
                if (joined.includes("education")) return "Pendidikan";
                if (joined.includes("tourism")) return "Wisata";
                if (joined.includes("entertainment")) return "Hiburan";
                if (joined.includes("office")) return "Kantor";
                if (joined.includes("leisure")) return "Area Publik";
                if (joined.includes("public_transport")) return "Transportasi";
                if (joined.includes("amenity")) return "Fasilitas Umum";

                return "Tempat";
            };

            const getMarkerColor = (categories: string[] = []) => {
                const joined = categories.join(" ");

                if (joined.includes("religion")) return "#6d4c41";
                if (joined.includes("building.place_of_worship")) return "#6d4c41";
                if (joined.includes("commercial")) return "#e53935";
                if (joined.includes("catering")) return "#fb8c00";
                if (joined.includes("service")) return "#8e24aa";
                if (joined.includes("healthcare")) return "#d81b60";
                if (joined.includes("education")) return "#3949ab";
                if (joined.includes("tourism")) return "#43a047";
                if (joined.includes("entertainment")) return "#00acc1";
                if (joined.includes("office")) return "#546e7a";
                if (joined.includes("public_transport")) return "#00897b";

                return "#1976d2";
            };

            const loadGeoapifyPlaces = async () => {
                if (!mapInstanceRef.current || !poiLayerRef.current) return;

                const zoom = map.getZoom();

                // Jangan load saat level provinsi/kabupaten, terlalu luas dan boros.
                if (zoom < 15) {
                    poiLayer.clearLayers();
                    return;
                }

                const bounds = map.getBounds();

                const south = bounds.getSouth();
                const west = bounds.getWest();
                const north = bounds.getNorth();
                const east = bounds.getEast();

                const midLat = (south + north) / 2;
                const midLng = (west + east) / 2;

                // Bagi layar menjadi 4 kotak supaya data lebih merata, bukan cuma dekat tengah.
                const cells = [
                    { south: midLat, west, north, east: midLng },
                    { south: midLat, west: midLng, north, east },
                    { south, west, north: midLat, east: midLng },
                    { south, west: midLng, north: midLat, east },
                ];

                try {
                    const results = await Promise.all(
                        cells.map((cell) =>
                            fetch(
                                `/api/geoapify-places?south=${cell.south}&west=${cell.west}&north=${cell.north}&east=${cell.east}`
                            )
                                .then((res) => {
                                    if (!res.ok) return null;
                                    return res.json();
                                })
                                .catch(() => null)
                        )
                    );

                    const seen = new Set<string>();
                    const features: any[] = [];

                    results.forEach((data) => {
                        if (!data?.features) return;

                        data.features.forEach((feature: any) => {
                            const id =
                                feature.properties?.place_id ??
                                `${feature.geometry?.coordinates?.[0]}-${feature.geometry?.coordinates?.[1]}`;

                            if (!seen.has(id)) {
                                seen.add(id);
                                features.push(feature);
                            }
                        });
                    });

                    console.log("Jumlah tempat dari Geoapify:", features.length);

                    poiLayer.clearLayers();

                    features.forEach((feature: any) => {
                        const coordinates = feature.geometry?.coordinates;
                        const properties = feature.properties ?? {};

                        if (!coordinates || coordinates.length < 2) return;

                        const lng = coordinates[0];
                        const lat = coordinates[1];

                        const categories: string[] = properties.categories ?? [];

                        const name =
                            properties.name ??
                            properties.address_line1 ??
                            properties.formatted ??
                            "Tempat";

                        const categoryName = getCategoryName(categories);
                        const color = getMarkerColor(categories);

                        const address =
                            properties.formatted ??
                            [properties.street, properties.housenumber, properties.city]
                                .filter(Boolean)
                                .join(" ");

                        const markerHtml = `
                <div class="geoapify-poi-marker" style="--poi-color:${color}">
                    <div class="geoapify-poi-dot"></div>
                    ${zoom >= 16
                                ? `<div class="geoapify-poi-name">${escapeHtml(String(name))}</div>`
                                : ""
                            }
                </div>
            `;

                        const icon = L.divIcon({
                            className: "geoapify-poi-wrapper",
                            html: markerHtml,
                            iconSize: [150, 32],
                            iconAnchor: [10, 16],
                            popupAnchor: [0, -14],
                        });

                        L.marker([lat, lng], { icon })
                            .addTo(poiLayer)
                            .bindPopup(`
                    <div style="font-family: Arial, sans-serif; font-size: 13px; max-width: 260px;">
                        <strong>${escapeHtml(String(name))}</strong><br/>
                        <span>${escapeHtml(String(categoryName))}</span><br/>
                        ${address ? `<span>${escapeHtml(String(address))}</span><br/>` : ""}
                    </div>
                `);
                    });
                } catch (error) {
                    console.warn("Gagal memuat tempat dari Geoapify:", error);
                }
            };

            const scheduleLoadPlaces = () => {
                if (poiTimer) clearTimeout(poiTimer);
                poiTimer = setTimeout(loadGeoapifyPlaces, 800);
            };

            map.on("moveend", scheduleLoadPlaces);
            map.on("zoomend", scheduleLoadPlaces);

            setTimeout(() => {
                map.invalidateSize();
                loadGeoapifyPlaces();
            }, 300);

            if (mounted) setReady(true);
        };

        initMap();

        return () => {
            mounted = false;

            if (poiTimer) clearTimeout(poiTimer);

            if (mapInstanceRef.current) {
                mapInstanceRef.current.remove();
                mapInstanceRef.current = null;
            }

            poiLayerRef.current = null;
            userMarkerRef.current = null;
        };
    }, []);

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

                map.setView([lat, lng], 17);

                if (userMarkerRef.current) {
                    map.removeLayer(userMarkerRef.current);
                    userMarkerRef.current = null;
                }

                const marker = L.marker([lat, lng])
                    .addTo(map)
                    .bindPopup("Lokasi Anda")
                    .openPopup();

                userMarkerRef.current = marker;
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

        const L = (await import("leaflet")).default;
        const amount = 150;
        const center = map.getCenter();
        const point = map.latLngToContainerPoint(center);

        const newPoint = L.point(
            point.x + (dir === "right" ? amount : dir === "left" ? -amount : 0),
            point.y + (dir === "down" ? amount : dir === "up" ? -amount : 0),
        );

        map.panTo(map.containerPointToLatLng(newPoint), { animate: true });
    };

    return (
        <main className="map-area" style={{ position: "relative", overflow: "hidden" }}>
            <style jsx global>{`
    .geoapify-poi-wrapper {
        background: transparent;
        border: none;
    }

    .geoapify-poi-marker {
        display: flex;
        align-items: center;
        gap: 5px;
        pointer-events: auto;
    }

    .geoapify-poi-dot {
        width: 13px;
        height: 13px;
        min-width: 13px;
        border-radius: 50%;
        background: var(--poi-color);
        border: 2px solid #ffffff;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.35);
    }

    .geoapify-poi-name {
        max-width: 110px;
        padding: 3px 6px;
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.96);
        color: #222;
        font-size: 11px;
        font-weight: 600;
        line-height: 1.2;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        border: 1px solid rgba(0, 0, 0, 0.12);
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
    }
`}</style>

            <div ref={mapRef} style={{ position: "absolute", inset: 0, zIndex: 0 }} />

            {!ready && (
                <div style={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 10,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "#e8edf3",
                }}>
                    <span style={{ fontSize: 14, color: "#a0aec0" }}>
                        Memuat peta...
                    </span>
                </div>
            )}

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
                <div />
                <button className="map-btn" onClick={() => handlePan("up")} title="Pan Up" type="button">
                    <svg viewBox="0 0 24 24"><polyline points="18 15 12 9 6 15" /></svg>
                </button>
                <div />

                <button className="map-btn" onClick={() => handlePan("left")} title="Pan Left" type="button">
                    <svg viewBox="0 0 24 24"><polyline points="15 18 9 12 15 6" /></svg>
                </button>

                <button className="map-btn" onClick={handleResetView} title="Reset" type="button">
                    <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4" fill="#555" /></svg>
                </button>

                <button className="map-btn" onClick={() => handlePan("right")} title="Pan Right" type="button">
                    <svg viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                </button>

                <div />
                <button className="map-btn" onClick={() => handlePan("down")} title="Pan Down" type="button">
                    <svg viewBox="0 0 24 24"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                <div />
            </div>

            <div className="map-scale" style={{ zIndex: 1000 }}>
                <span>400 km</span>
                <div className="scale-bar" />
            </div>

            <div className="map-credit" style={{ zIndex: 1000 }}>
                ©2021 Developed by Braga Technologies
            </div>
        </main>
    );
}