from rest_framework import viewsets, permissions
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