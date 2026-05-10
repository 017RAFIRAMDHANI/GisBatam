import AppShell from './components/AppShell';
import MapArea from './components/Maparea';

// Halaman peta pakai fullBleed agar map mengisi penuh tanpa padding
export default function Home() {
  return (
    <AppShell fullBleed>
      <MapArea />
    </AppShell>
  );
}