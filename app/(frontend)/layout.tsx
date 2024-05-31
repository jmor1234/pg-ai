import { AI } from "../actions";
import Navbar from "./_components/navbar";
import SideBar from "./_components/sidebar";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full">
      <Navbar />
      <div className="hidden md:flex mt-16 w-20 flex-col fixed inset-y-0">
        <SideBar />
      </div>
      <main className="md:pl-20 pt-16 h-full">
        <AI>{children}</AI>
      </main>
    </div>
  );
}
