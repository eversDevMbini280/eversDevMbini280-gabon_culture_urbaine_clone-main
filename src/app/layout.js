// import { Inter } from 'next/font/google';
// import './globals.css';

// const inter = Inter({ subsets: ['latin'] });

// export const metadata = {
//   title: 'GCUTV - La Chaîne de la Culture Urbaine Gabonaise',
//   description: 'Découvrez le meilleur de la culture urbaine gabonaise avec GCUTV',
// };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="fr">
//       <body className={inter.className}>{children}</body>
//     </html>
//   );
// }



import { Inter } from 'next/font/google';
import './globals.css';
import FetchFallbackGuard from '@/components/FetchFallbackGuard';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: false, 
  adjustFontFallback: false 
});

export const metadata = {
  title: 'GcuTV - La Chaîne de la Culture Urbaine Gabonaise',
  description: 'Découvrez le meilleur de la culture urbaine gabonaise avec GCUTV',
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <FetchFallbackGuard />
        {children}
      </body>
    </html>
  );
}
