# ============================================================
# FILE: backend/aset/views.py
# GANTI SELURUH ISI FILE INI
# ============================================================

from rest_framework import viewsets, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Count, Sum, Q
from django.utils import timezone
from .models import ReklameKategori, ZonaTataRuang, Users, Reklame, Perizinan, DokumenReklame, FotoReklame
from .serializers import (
    ReklameKategoriSerializer,
    ZonaTataRuangSerializer,
    UsersSerializer,
    ReklameSerializer,
    PerizinanSerializer,
    DokumenReklameSerializer,
    FotoReklameSerializer
)


# ─── Existing ViewSets (tidak diubah) ──────────────────────

class ReklameKategoriViewSet(viewsets.ModelViewSet):
    queryset = ReklameKategori.objects.all()
    serializer_class = ReklameKategoriSerializer
    permission_classes = [permissions.AllowAny]

class ZonaTataRuangViewSet(viewsets.ModelViewSet):
    queryset = ZonaTataRuang.objects.all()
    serializer_class = ZonaTataRuangSerializer
    permission_classes = [permissions.AllowAny]

class UsersViewSet(viewsets.ModelViewSet):
    queryset = Users.objects.all()
    serializer_class = UsersSerializer
    permission_classes = [permissions.IsAuthenticated]

class ReklameViewSet(viewsets.ModelViewSet):
    queryset = Reklame.objects.all().order_by("-created_at")
    serializer_class = ReklameSerializer
    permission_classes = [permissions.AllowAny]
    lookup_field = "kode_reklame"

class PerizinanViewSet(viewsets.ModelViewSet):
    queryset = Perizinan.objects.all()
    serializer_class = PerizinanSerializer
    permission_classes = [permissions.AllowAny]

class DokumenReklameViewSet(viewsets.ModelViewSet):
    queryset = DokumenReklame.objects.all()
    serializer_class = DokumenReklameSerializer
    permission_classes = [permissions.AllowAny]

class FotoReklameViewSet(viewsets.ModelViewSet):
    queryset = FotoReklame.objects.all()
    serializer_class = FotoReklameSerializer
    permission_classes = [permissions.AllowAny]


# ─── NEW: Infografis Statistics Endpoint ───────────────────

@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def infografis_stats(request):
    """
    GET /api/infografis/
    Query params (semua optional):
      - kabupaten  : filter by zona nama_zona contains
      - kategori   : filter by kategori nama_kategori
      - status_perizinan : APPROVED / PENDING / REJECTED / EXPIRED
      - pelanggaran      : TANPA_IZIN / ZONA_LARANGAN
      - status_sanksi    : AKTIF / SELESAI
      - tahun            : filter by tanggal_pasang year (default: tahun sekarang)
    """

    tahun = request.GET.get('tahun', str(timezone.now().year))
    kabupaten = request.GET.get('kabupaten', '')
    kategori_filter = request.GET.get('kategori', '')
    status_perizinan_filter = request.GET.get('status_perizinan', '')
    pelanggaran_filter = request.GET.get('pelanggaran', '')
    status_sanksi_filter = request.GET.get('status_sanksi', '')

    # Base queryset reklame
    reklame_qs = Reklame.objects.all()

    # Filter tahun
    if tahun:
        reklame_qs = reklame_qs.filter(tanggal_pasang__year=tahun)

    # Filter kategori
    if kategori_filter:
        reklame_qs = reklame_qs.filter(kategori__nama_kategori__icontains=kategori_filter)

    # Filter kabupaten/kota (via zona)
    if kabupaten:
        reklame_qs = reklame_qs.filter(zona__nama_zona__icontains=kabupaten)

    # IDs reklame yang sudah difilter
    reklame_ids = reklame_qs.values_list('id', flat=True)

    # Base perizinan queryset
    perizinan_qs = Perizinan.objects.filter(reklame_id__in=reklame_ids)

    if status_perizinan_filter:
        perizinan_qs = perizinan_qs.filter(status_perizinan__iexact=status_perizinan_filter)

    # ── 1. Summary Cards ─────────────────────────────────
    jumlah_reklame = reklame_qs.count()

    # Status Reklame (field status_reklame di model Reklame)
    status_aktif = reklame_qs.filter(status_reklame__iexact='AKTIF').count()
    status_tidak_aktif = reklame_qs.filter(
        Q(status_reklame__iexact='TIDAK_AKTIF') | Q(status_reklame__isnull=True)
    ).exclude(status_reklame__iexact='AKTIF').count()

    # Pelanggaran — dari perizinan
    tanpa_izin = perizinan_qs.filter(
        Q(status_perizinan__iexact='PENDING') | Q(status_perizinan__iexact='REJECTED')
    ).count()
    zona_larangan_count = reklame_qs.filter(zona__tipe_zona__iexact='LARANGAN').count()

    # Sanksi — aktif/selesai (perizinan EXPIRED = kadaluarsa/sanksi)
    sanksi_aktif = perizinan_qs.filter(status_perizinan__iexact='EXPIRED').count()
    sanksi_selesai = perizinan_qs.filter(status_perizinan__iexact='APPROVED').count()

    # ── 2. Luas Aset & Nilai Perolehan ───────────────────
    total_lokasi = reklame_qs.count()
    # Hitung nilai perolehan: luas_m2 * retribusi_per_m2 per kategori
    total_nilai = 0
    for r in reklame_qs.select_related('kategori').filter(
        luas_m2__isnull=False,
        kategori__retribusi_per_m2__isnull=False
    ):
        total_nilai += float(r.luas_m2) * float(r.kategori.retribusi_per_m2)

    # ── 3. Reklame Tersewa ────────────────────────────────
    tersewa = reklame_qs.filter(status_reklame__iexact='TERSEWA').count()
    belum_tersewa = total_lokasi - tersewa
    pct_tersewa = round((tersewa / total_lokasi * 100), 1) if total_lokasi > 0 else 0

    # ── 4. Grafik Status Pelanggaran (donut) ─────────────
    # Pakai status_perizinan sebagai proxy pelanggaran
    pelanggaran_tanpa_izin = perizinan_qs.filter(
        Q(status_perizinan__iexact='PENDING') | Q(status_perizinan__iexact='REJECTED')
    ).count()
    pelanggaran_zona_larangan = reklame_qs.filter(zona__tipe_zona__iexact='LARANGAN').count()
    pelanggaran_kadaluarsa = perizinan_qs.filter(status_perizinan__iexact='EXPIRED').count()
    pelanggaran_sengketa = perizinan_qs.filter(status_perizinan__iexact='DISPUTE').count()

    total_pelanggaran = (
        pelanggaran_tanpa_izin + pelanggaran_zona_larangan +
        pelanggaran_kadaluarsa + pelanggaran_sengketa
    )
    pct_pelanggaran = round((pelanggaran_tanpa_izin / total_pelanggaran * 100), 1) if total_pelanggaran > 0 else 0

    # ── 5. Jumlah Aset Per Kota (bar chart) ──────────────
    # Group by zona nama_zona
    per_zona = (
        reklame_qs
        .values('zona__nama_zona')
        .annotate(
            jumlah_aset=Count('id'),
            bersertifikat=Count('id', filter=Q(
                id__in=Perizinan.objects.filter(
                    status_perizinan__iexact='APPROVED'
                ).values('reklame_id')
            )),
        )
        .order_by('-jumlah_aset')[:10]
    )

    chart_per_kota = []
    for z in per_zona:
        nama = z['zona__nama_zona'] or 'Tidak Diketahui'
        jumlah = z['jumlah_aset']
        bersertifikat = z['bersertifikat']
        # "Diproses" = pending
        diproses = Perizinan.objects.filter(
            reklame__zona__nama_zona=nama,
            status_perizinan__iexact='PENDING',
            reklame_id__in=reklame_ids
        ).count()
        chart_per_kota.append({
            'nama': nama,
            'jumlah_aset': jumlah,
            'bersertifikat': bersertifikat,
            'diproses': diproses,
        })

    # ── 6. Filter Options (untuk dropdown) ───────────────
    kabupaten_options = list(
        ZonaTataRuang.objects.values_list('nama_zona', flat=True).distinct().order_by('nama_zona')
    )
    kategori_options = list(
        ReklameKategori.objects.values_list('nama_kategori', flat=True).distinct().order_by('nama_kategori')
    )

    return Response({
        # Summary cards
        'jumlah_reklame': jumlah_reklame,
        'status_reklame': {
            'aktif': status_aktif,
            'tidak_aktif': status_tidak_aktif,
        },
        'pelanggaran': {
            'tanpa_izin': tanpa_izin,
            'zona_larangan': zona_larangan_count,
        },
        'jumlah_sanksi': {
            'aktif': sanksi_aktif,
            'selesai': sanksi_selesai,
        },
        # Luas & nilai
        'luas_aset': {
            'total_lokasi': total_lokasi,
            'total_nilai_perolehan': total_nilai,
        },
        # Tersewa
        'reklame_tersewa': {
            'tersewa': tersewa,
            'belum_tersewa': belum_tersewa,
            'persen': pct_tersewa,
            'total': total_lokasi,
        },
        # Donut chart
        'grafik_pelanggaran': {
            'tanpa_izin': pelanggaran_tanpa_izin,
            'zona_larangan': pelanggaran_zona_larangan,
            'kadaluarsa': pelanggaran_kadaluarsa,
            'sengketa': pelanggaran_sengketa,
            'persen_tanpa_izin': pct_pelanggaran,
        },
        # Bar chart
        'chart_per_kota': chart_per_kota,
        # Filter options
        'filter_options': {
            'kabupaten': kabupaten_options,
            'kategori': kategori_options,
            'status_perizinan': ['APPROVED', 'PENDING', 'REJECTED', 'EXPIRED', 'DISPUTE'],
            'pelanggaran': ['TANPA_IZIN', 'ZONA_LARANGAN'],
            'status_sanksi': ['AKTIF', 'SELESAI'],
            'tahun': [str(y) for y in range(2020, timezone.now().year + 2)],
        }
    })