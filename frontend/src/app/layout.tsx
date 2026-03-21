import './globals.css';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';

export const metadata = {
  title: 'NutriShop — Nutrition Products',
  description: 'Premium nutrition products for athletes and health enthusiasts',
  icons: { icon: '/icon.svg' },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] m-0 p-0 text-gray-900">
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main className="max-w-[1100px] mx-auto px-6 pb-8">
                {children}
              </main>
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
