from rest_framework import serializers
from .models import ReklameKategori, ZonaTataRuang, Users, Reklame, Perizinan, DokumenReklame, FotoReklame

class ReklameKategoriSerializer(serializers.ModelSerializer):
    class Meta:
        model = ReklameKategori
        fields = '__all__'

class ZonaTataRuangSerializer(serializers.ModelSerializer):
    class Meta:
        model = ZonaTataRuang
        fields = '__all__'

class UsersSerializer(serializers.ModelSerializer):
    class Meta:
        model = Users
        fields = ['id', 'nama_lengkap', 'email', 'no_telepon', 'is_active', 'created_at']

class ReklameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reklame
        fields = '__all__'

class PerizinanSerializer(serializers.ModelSerializer):
    class Meta:
        model = Perizinan
        fields = '__all__'

class DokumenReklameSerializer(serializers.ModelSerializer):
    class Meta:
        model = DokumenReklame
        fields = '__all__'

class FotoReklameSerializer(serializers.ModelSerializer):
    class Meta:
        model = FotoReklame
        fields = '__all__'