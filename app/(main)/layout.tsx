import Navbar from "../components/Navbar";

export default function MainLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <>
            <Navbar />
            <main className="min-h-screen pt-20">
                {children}
            </main>
        </>
    );
}
