import Header from "./Header";
import Footer from "./Footer";

type Props = {
  children: React.ReactNode;
};

export default function Layout({ children }: Props) {
  return (
    <div>
      <Header />

      <main className="flex min-h-full overflow-hidden pt-8 sm:py-14">
        {children}
      </main>
      <Footer />
    </div>
  );
}
