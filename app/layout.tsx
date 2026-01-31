import "./../styles/globals.css";
import Nav from "../components/Nav";

export const metadata = {
  title: "Elope Prototype",
  description: "Digital nomad dating prototype"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main className="max-w-xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
