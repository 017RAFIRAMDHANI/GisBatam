from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'kategori', views.ReklameKategoriViewSet)
router.register(r'zona', views.ZonaTataRuangViewSet)
router.register(r'users', views.UsersViewSet)
router.register(r'reklame', views.ReklameViewSet)
router.register(r'perizinan', views.PerizinanViewSet)
router.register(r'dokumen', views.DokumenReklameViewSet)
router.register(r'foto', views.FotoReklameViewSet)

urlpatterns = [
    path('', include(router.urls)),
]