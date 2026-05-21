"use client";

import { useEffect, useRef } from "react";

declare global {
    interface Window {
        google: typeof google;
    }
}

type LatLng = {
    lat: number;
    lng: number;
};

type KecamatanGroup = {
    kecamatan: string;
    center: LatLng;
    kelurahan: string[];
};

type KelurahanSeed = {
    kecamatan: string;
    kelurahan: string;
    lat: number;
    lng: number;
};

type RwArea = {
    id: string;
    kecamatan: string;
    kelurahan: string;
    rw: string;
    paths: LatLng[];
    labelPosition: LatLng;
};

type RtArea = {
    id: string;
    kecamatan: string;
    kelurahan: string;
    rw: string;
    rt: string;
    paths: LatLng[];
    labelPosition: LatLng;
};

const KECAMATAN_BATAM: KecamatanGroup[] = [
    {
        kecamatan: "Belakang Padang",
        center: { lat: 1.152, lng: 103.895 },
        kelurahan: [
            "Pulau Terong",
            "Pecong",
            "Kasu",
            "Pemping",
            "Tanjung Sari",
            "Sekanak Raya",
        ],
    },
    {
        kecamatan: "Bulang",
        center: { lat: 0.985, lng: 103.835 },
        kelurahan: [
            "Pantai Gelam",
            "Temoyong",
            "Pulau Setokok",
            "Batu Legong",
            "Bulang Lintang",
            "Pulau Buluh",
        ],
    },
    {
        kecamatan: "Galang",
        center: { lat: 0.89, lng: 104.18 },
        kelurahan: [
            "Pulau Abang",
            "Karas",
            "Sijantung",
            "Sembulang",
            "Rempang Cate",
            "Subang Mas",
            "Galang Baru",
            "Air Raja",
        ],
    },
    {
        kecamatan: "Sei Beduk",
        center: { lat: 1.044, lng: 104.05 },
        kelurahan: [
            "Tanjung Piayu",
            "Duriangkang",
            "Mangsang",
            "Mukakuning",
        ],
    },
    {
        kecamatan: "Nongsa",
        center: { lat: 1.191, lng: 104.095 },
        kelurahan: [
            "Ngenang",
            "Kabil",
            "Batu Besar",
            "Sambau",
        ],
    },
    {
        kecamatan: "Sekupang",
        center: { lat: 1.115, lng: 103.94 },
        kelurahan: [
            "Tanjung Riau",
            "Tiban Baru",
            "Tiban Lama",
            "Tiban Indah",
            "Patam Lestari",
            "Sungai Harapan",
            "Tanjung Pinggir",
        ],
    },
    {
        kecamatan: "Lubuk Baja",
        center: { lat: 1.135, lng: 104.006 },
        kelurahan: [
            "Batu Selicin",
            "Lubuk Baja Kota",
            "Kampung Pelita",
            "Baloi Indah",
            "Tanjung Uma",
        ],
    },
    {
        kecamatan: "Batu Ampar",
        center: { lat: 1.163, lng: 104.0 },
        kelurahan: [
            "Tanjung Sengkuang",
            "Sungai Jodoh",
            "Batu Merah",
            "Kampung Seraya",
        ],
    },
    {
        kecamatan: "Batam Kota",
        center: { lat: 1.1185, lng: 104.053 },
        kelurahan: [
            "Teluk Tering",
            "Taman Baloi",
            "Sukajadi",
            "Belian",
            "Sungai Panas",
            "Baloi Permai",
        ],
    },
    {
        kecamatan: "Sagulung",
        center: { lat: 1.025, lng: 103.994 },
        kelurahan: [
            "Tembesi",
            "Sungai Binti",
            "Sungai Lekop",
            "Sagulung Kota",
            "Sungai Langkai",
            "Sungai Pelunggut",
        ],
    },
    {
        kecamatan: "Batu Aji",
        center: { lat: 1.041, lng: 103.969 },
        kelurahan: [
            "Bukit Tempayan",
            "Buliang",
            "Kibing",
            "Tanjung Uncang",
        ],
    },
    {
        kecamatan: "Bengkong",
        center: { lat: 1.143, lng: 104.032 },
        kelurahan: [
            "Bengkong Laut",
            "Bengkong Indah",
            "Sadai",
            "Tanjung Buntung",
        ],
    },
];

function createKelurahanSeeds(): KelurahanSeed[] {
    const result: KelurahanSeed[] = [];

    KECAMATAN_BATAM.forEach((group) => {
        const total = group.kelurahan.length;

        group.kelurahan.forEach((kelurahan, index) => {
            const angle = (Math.PI * 2 * index) / total;
            const radius = 0.012 + (index % 3) * 0.003;

            result.push({
                kecamatan: group.kecamatan,
                kelurahan,
                lat: group.center.lat + Math.sin(angle) * radius,
                lng: group.center.lng + Math.cos(angle) * radius,
            });
        });
    });

    return result;
}

const KELURAHAN_BATAM_SEEDS = createKelurahanSeeds();

function createRect(center: LatLng, halfLat: number, halfLng: number): LatLng[] {
    return [
        { lat: center.lat - halfLat, lng: center.lng - halfLng },
        { lat: center.lat - halfLat, lng: center.lng + halfLng },
        { lat: center.lat + halfLat, lng: center.lng + halfLng },
        { lat: center.lat + halfLat, lng: center.lng - halfLng },
    ];
}

function createInsetRect(
    south: number,
    west: number,
    north: number,
    east: number,
    insetRatio = 0.06
): LatLng[] {
    const latInset = (north - south) * insetRatio;
    const lngInset = (east - west) * insetRatio;

    return [
        { lat: south + latInset, lng: west + lngInset },
        { lat: south + latInset, lng: east - lngInset },
        { lat: north - latInset, lng: east - lngInset },
        { lat: north - latInset, lng: west + lngInset },
    ];
}

function getRectCenter(paths: LatLng[]): LatLng {
    const lat = paths.reduce((sum, point) => sum + point.lat, 0) / paths.length;
    const lng = paths.reduce((sum, point) => sum + point.lng, 0) / paths.length;

    return { lat, lng };
}

function generateDummyRTRW() {
    const rwAreas: RwArea[] = [];
    const rtAreas: RtArea[] = [];

    KELURAHAN_BATAM_SEEDS.forEach((seed) => {
        const rwHalfLat = 0.003;
        const rwHalfLng = 0.0038;

        const rwCenters = [
            {
                lat: seed.lat + 0.0032,
                lng: seed.lng,
            },
            {
                lat: seed.lat - 0.0032,
                lng: seed.lng,
            },
        ];

        rwCenters.forEach((rwCenter, rwIndex) => {
            const rw = `RW ${String(rwIndex + 1).padStart(2, "0")}`;
            const rwPaths = createRect(rwCenter, rwHalfLat, rwHalfLng);

            rwAreas.push({
                id: `${seed.kecamatan}-${seed.kelurahan}-${rw}`,
                kecamatan: seed.kecamatan,
                kelurahan: seed.kelurahan,
                rw,
                paths: rwPaths,
                labelPosition: rwCenter,
            });

            const south = rwCenter.lat - rwHalfLat;
            const north = rwCenter.lat + rwHalfLat;
            const west = rwCenter.lng - rwHalfLng;
            const east = rwCenter.lng + rwHalfLng;

            const midLat = (south + north) / 2;
            const midLng = (west + east) / 2;

            const rtBoxes = [
                {
                    rt: "RT 01",
                    south: midLat,
                    west,
                    north,
                    east: midLng,
                },
                {
                    rt: "RT 02",
                    south: midLat,
                    west: midLng,
                    north,
                    east,
                },
                {
                    rt: "RT 03",
                    south,
                    west,
                    north: midLat,
                    east: midLng,
                },
                {
                    rt: "RT 04",
                    south,
                    west: midLng,
                    north: midLat,
                    east,
                },
            ];

            rtBoxes.forEach((box) => {
                const rtPaths = createInsetRect(
                    box.south,
                    box.west,
                    box.north,
                    box.east,
                    0.06
                );

                rtAreas.push({
                    id: `${seed.kecamatan}-${seed.kelurahan}-${rw}-${box.rt}`,
                    kecamatan: seed.kecamatan,
                    kelurahan: seed.kelurahan,
                    rw,
                    rt: box.rt,
                    paths: rtPaths,
                    labelPosition: getRectCenter(rtPaths),
                });
            });
        });
    });

    return { rwAreas, rtAreas };
}

const { rwAreas, rtAreas } = generateDummyRTRW();

export default function MapArea() {
    const mapRef = useRef<HTMLDivElement | null>(null);
    const mapInstanceRef = useRef<google.maps.Map | null>(null);

    const rwPolygonsRef = useRef<google.maps.Polygon[]>([]);
    const rtPolygonsRef = useRef<google.maps.Polygon[]>([]);
    const rwLabelsRef = useRef<google.maps.Marker[]>([]);
    const rtLabelsRef = useRef<google.maps.Marker[]>([]);
    const kelurahanLabelsRef = useRef<google.maps.Marker[]>([]);

    const rtrwVisibleRef = useRef(false);
    const requestedRtrwVisibleRef = useRef(false);
    const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

    const clearRTRWLayer = () => {
        rwPolygonsRef.current.forEach((polygon) => polygon.setMap(null));
        rtPolygonsRef.current.forEach((polygon) => polygon.setMap(null));
        rwLabelsRef.current.forEach((marker) => marker.setMap(null));
        rtLabelsRef.current.forEach((marker) => marker.setMap(null));
        kelurahanLabelsRef.current.forEach((marker) => marker.setMap(null));

        rwPolygonsRef.current = [];
        rtPolygonsRef.current = [];
        rwLabelsRef.current = [];
        rtLabelsRef.current = [];
        kelurahanLabelsRef.current = [];

        rtrwVisibleRef.current = false;
    };

    const applyLabelVisibility = () => {
        const map = mapInstanceRef.current;
        if (!map || !rtrwVisibleRef.current) return;

        const zoom = map.getZoom() ?? 10;

        kelurahanLabelsRef.current.forEach((marker) => {
            marker.setMap(zoom >= 10 ? map : null);
        });

        rwLabelsRef.current.forEach((marker) => {
            marker.setMap(zoom >= 12 ? map : null);
        });

        rtLabelsRef.current.forEach((marker) => {
            marker.setMap(zoom >= 14 ? map : null);
        });
    };

    const fitToKotaBatamDummy = () => {
        const map = mapInstanceRef.current;
        if (!map || !window.google?.maps) return;

        const bounds = new window.google.maps.LatLngBounds();

        rwAreas.forEach((area) => {
            area.paths.forEach((point) => bounds.extend(point));
        });

        map.fitBounds(bounds);
    };

    const showRTRWLayer = () => {
        const map = mapInstanceRef.current;
        if (!map || !window.google?.maps) return;

        clearRTRWLayer();

        const infoWindow = infoWindowRef.current ?? new window.google.maps.InfoWindow();
        infoWindowRef.current = infoWindow;

        KELURAHAN_BATAM_SEEDS.forEach((area) => {
            const label = new window.google.maps.Marker({
                position: { lat: area.lat, lng: area.lng },
                map: null,
                clickable: false,
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 0,
                },
                label: {
                    text: area.kelurahan,
                    color: "#111827",
                    fontSize: "12px",
                    fontWeight: "800",
                },
                zIndex: 80,
            });

            kelurahanLabelsRef.current.push(label);
        });

        rwAreas.forEach((area) => {
            const polygon = new window.google.maps.Polygon({
                paths: area.paths,
                strokeColor: "#8b3dff",
                strokeOpacity: 1,
                strokeWeight: 4,
                fillColor: "#8b3dff",
                fillOpacity: 0.10,
                clickable: true,
                zIndex: 20,
                map,
            });

            polygon.addListener("click", (event: google.maps.MapMouseEvent) => {
                infoWindow.setContent(`
                    <div style="font-family: Arial, sans-serif; font-size: 13px; max-width: 280px;">
                        <strong>Batas RW Dummy</strong><br/>
                        Provinsi: Kepulauan Riau<br/>
                        Kota: Batam<br/>
                        Kecamatan: ${area.kecamatan}<br/>
                        Kelurahan: ${area.kelurahan}<br/>
                        RW: ${area.rw}
                    </div>
                `);

                if (event.latLng) {
                    infoWindow.setPosition(event.latLng);
                    infoWindow.open(map);
                }
            });

            const label = new window.google.maps.Marker({
                position: area.labelPosition,
                map: null,
                clickable: false,
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 0,
                },
                label: {
                    text: area.rw,
                    color: "#6d28d9",
                    fontSize: "12px",
                    fontWeight: "800",
                },
                zIndex: 60,
            });

            rwPolygonsRef.current.push(polygon);
            rwLabelsRef.current.push(label);
        });

        rtAreas.forEach((area) => {
            const polygon = new window.google.maps.Polygon({
                paths: area.paths,
                strokeColor: "#fbc02d",
                strokeOpacity: 1,
                strokeWeight: 2,
                fillColor: "#fbc02d",
                fillOpacity: 0.16,
                clickable: true,
                zIndex: 30,
                map,
            });

            polygon.addListener("click", (event: google.maps.MapMouseEvent) => {
                infoWindow.setContent(`
                    <div style="font-family: Arial, sans-serif; font-size: 13px; max-width: 280px;">
                        <strong>Batas RT Dummy</strong><br/>
                        Provinsi: Kepulauan Riau<br/>
                        Kota: Batam<br/>
                        Kecamatan: ${area.kecamatan}<br/>
                        Kelurahan: ${area.kelurahan}<br/>
                        RW: ${area.rw}<br/>
                        RT: ${area.rt}
                    </div>
                `);

                if (event.latLng) {
                    infoWindow.setPosition(event.latLng);
                    infoWindow.open(map);
                }
            });

            const label = new window.google.maps.Marker({
                position: area.labelPosition,
                map: null,
                clickable: false,
                icon: {
                    path: window.google.maps.SymbolPath.CIRCLE,
                    scale: 0,
                },
                label: {
                    text: area.rt,
                    color: "#92400e",
                    fontSize: "12px",
                    fontWeight: "900",
                },
                zIndex: 70,
            });

            rtPolygonsRef.current.push(polygon);
            rtLabelsRef.current.push(label);
        });

        rtrwVisibleRef.current = true;
        fitToKotaBatamDummy();
        applyLabelVisibility();
    };

    useEffect(() => {
        const initMap = () => {
            if (!window.google || !mapRef.current) return;

            const kotaBatamBounds = new window.google.maps.LatLngBounds(
                { lat: 0.82, lng: 103.78 },
                { lat: 1.25, lng: 104.28 }
            );

            const map = new window.google.maps.Map(mapRef.current, {
                center: { lat: 1.1185, lng: 104.053 },
                zoom: 11,
                minZoom: 7,
                maxZoom: 20,
                mapTypeId: "roadmap",
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: false,
                zoomControl: false,
                gestureHandling: "greedy",
                clickableIcons: true,
            });

            map.fitBounds(kotaBatamBounds);
            mapInstanceRef.current = map;

            infoWindowRef.current = new window.google.maps.InfoWindow();

            map.addListener("zoom_changed", applyLabelVisibility);

            if (requestedRtrwVisibleRef.current) {
                showRTRWLayer();
            }
        };

        const loadGoogleMaps = () => {
            if (window.google?.maps) {
                initMap();
                return;
            }

            const existingScript = document.getElementById(
                "google-maps-script"
            ) as HTMLScriptElement | null;

            if (existingScript) {
                existingScript.addEventListener("load", initMap);
                return;
            }

            const script = document.createElement("script");
            script.id = "google-maps-script";
            script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}`;
            script.async = true;
            script.defer = true;
            script.addEventListener("load", initMap);
            document.body.appendChild(script);
        };

        const handleLayerToggle = (event: Event) => {
            const customEvent = event as CustomEvent<{
                layer: string;
                visible: boolean;
            }>;

            if (customEvent.detail.layer !== "rtrw") return;

            requestedRtrwVisibleRef.current = customEvent.detail.visible;

            if (customEvent.detail.visible) {
                showRTRWLayer();
            } else {
                clearRTRWLayer();
            }
        };

        window.addEventListener("layer-toggle", handleLayerToggle);
        loadGoogleMaps();

        return () => {
            window.removeEventListener("layer-toggle", handleLayerToggle);

            const existingScript = document.getElementById("google-maps-script");
            if (existingScript) {
                existingScript.removeEventListener("load", initMap);
            }

            clearRTRWLayer();
        };
    }, []);

    const handleZoomIn = () => {
        const map = mapInstanceRef.current;
        if (!map) return;
        map.setZoom((map.getZoom() || 11) + 1);
    };

    const handleZoomOut = () => {
        const map = mapInstanceRef.current;
        if (!map) return;
        map.setZoom((map.getZoom() || 11) - 1);
    };

    const handleResetView = () => {
        const map = mapInstanceRef.current;
        if (!map) return;

        const kotaBatamBounds = new window.google.maps.LatLngBounds(
            { lat: 0.82, lng: 103.78 },
            { lat: 1.25, lng: 104.28 }
        );

        map.fitBounds(kotaBatamBounds);
    };

    const handleMyLocation = () => {
        const map = mapInstanceRef.current;
        if (!map || !navigator.geolocation) return;

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const currentPos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };

                map.panTo(currentPos);
                map.setZoom(16);

                new window.google.maps.Marker({
                    position: currentPos,
                    map,
                    title: "Lokasi Anda",
                });
            },
            (error) => {
                console.error("Gagal mengambil lokasi:", error);
                alert("Lokasi tidak dapat diakses.");
            }
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

    return (
        <main className="map-area">
            <div ref={mapRef} className="map-ph" />

            <div className="map-controls-right">
                <button className="map-btn" onClick={handleFullscreen} title="Fullscreen" type="button">
                    <svg viewBox="0 0 24 24">
                        <polyline points="15 3 21 3 21 9" />
                        <polyline points="9 21 3 21 3 15" />
                        <line x1="21" y1="3" x2="14" y2="10" />
                        <line x1="3" y1="21" x2="10" y2="14" />
                    </svg>
                </button>

                <button className="map-btn" onClick={handleResetView} title="Reset View" type="button">
                    <svg viewBox="0 0 24 24">
                        <rect x="3" y="3" width="7" height="7" rx="1" />
                        <rect x="14" y="3" width="7" height="7" rx="1" />
                        <rect x="3" y="14" width="7" height="7" rx="1" />
                        <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                </button>

                <button className="map-btn" onClick={handleZoomIn} title="Zoom In" type="button">
                    +
                </button>

                <button className="map-btn" onClick={handleZoomOut} title="Zoom Out" type="button">
                    −
                </button>

                <button className="map-btn" onClick={handleMyLocation} title="Lokasi Saya" type="button">
                    <svg viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="3" />
                        <line x1="12" y1="2" x2="12" y2="7" />
                        <line x1="12" y1="17" x2="12" y2="22" />
                        <line x1="2" y1="12" x2="7" y2="12" />
                        <line x1="17" y1="12" x2="22" y2="12" />
                    </svg>
                </button>

                <button className="map-btn" title="Layer" type="button">
                    <svg viewBox="0 0 24 24">
                        <line x1="4" y1="12" x2="20" y2="12" />
                        <line x1="8" y1="7" x2="8" y2="9" />
                        <line x1="12" y1="5" x2="12" y2="8" />
                        <line x1="16" y1="7" x2="16" y2="9" />
                    </svg>
                </button>

                <button className="map-btn" title="Checklist" type="button">
                    <svg viewBox="0 0 24 24">
                        <polyline points="9 11 12 14 22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                    </svg>
                </button>

                <button className="map-btn" title="Riwayat" type="button">
                    <svg viewBox="0 0 24 24">
                        <polyline points="12 6 12 12 16 14" />
                        <circle cx="12" cy="12" r="9" />
                    </svg>
                </button>
            </div>

            <div className="map-scale">
                <span>400 km</span>
                <div className="scale-bar" />
            </div>

            <div className="map-credit">©2021 Developed by Braga Technologies</div>
        </main>
    );
}