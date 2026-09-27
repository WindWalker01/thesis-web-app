import Link from "next/link";
import { Upload } from "lucide-react";

export function FloatingUploadButton() {
  return (
    <Link
      href="/upload-artwork"
      aria-label="Upload artwork"
      className="fixed right-8 bottom-8 z-50 hidden h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white shadow-[0_4px_24px_rgba(249,115,22,0.45)] transition-all duration-300 hover:scale-110 hover:bg-orange-600 hover:shadow-[0_8px_32px_rgba(249,115,22,0.6)] sm:flex"
    >
      <Upload className="h-6 w-6" />
    </Link>
  );
}
