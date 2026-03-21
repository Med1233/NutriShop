import './globals.css';
import { LanguageProvider } from './i18n/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import ChatWidget from './components/ChatWidget';

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
      <body className="m-0 p-0 font-[Inter,-apple-system,BlinkMacSystemFont,'Segoe_UI',sans-serif] text-gray-900">
        <LanguageProvider>
          <AuthProvider>
            <CartProvider>
              <Navbar />
              <main className="mx-auto max-w-[1100px] px-6 pb-8">
                {children}
              </main>
              <ChatWidget />
            </CartProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
