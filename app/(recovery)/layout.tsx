import "@/app/globals.css";
import Footer from "@/components/blocks/footer";

export default function RecoveryLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <main className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
                <div className="w-full max-w-sm md:max-w-md">{children}</div>
            </main>
            <Footer />
        </>
    );
}