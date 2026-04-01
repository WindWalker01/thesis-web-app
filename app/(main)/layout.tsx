import Footer from "@/components/blocks/footer";
import NavBar from "@/components/blocks/navbar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>
    <NavBar />
    {children}
    <Footer />
  </>;
}
