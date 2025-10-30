import Navigation from '@/components/navigation';
import MostRead from '@/components/MostRead';
import Stories from '@/components/Stories';
import Footer from '@/components/Footer';
import HomePage from '@/components/Homepage';

export const metadata = {
  title: 'GCUTV - La Chaîne de la Culture Urbaine Gabonaise',
  description: 'Découvrez le meilleur de la culture urbaine gabonaise avec GCUTV',
};

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navigation />
      {/* Ajouter un padding-top pour compenser la navbar fixe */}
      <div className="pt-[160px] md:pt-[140px]">
        <HomePage />
        <MostRead />
        <Stories />
        <Footer />
      </div>
    </main>
  );
}