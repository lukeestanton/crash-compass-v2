import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/CrashCompassTransparent.svg";
import { apiGet } from "@/lib/api";
import { slugify } from "@/lib/slug";

function toDisplayName(key) {
  if (!key) return "";
  return key.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

export default async function Header() {
  let categories = {};
  try {
    categories = await apiGet("/api/v1/fred/categories");
  } catch {
    categories = {};
  }
  const categoryKeys = Object.keys(categories);

  return (
    <nav className="flex items-center justify-between px-6 py-2 bg-white shadow-md">
      <div className="flex items-center">
        <Link href="/" passHref>
          <Image
            src={Logo.src}
            width={400}
            height={200}
            alt="Crash Compass Logo"
            priority
            className="cursor-pointer"
          />
        </Link>
      </div>
      <div className="hidden md:flex gap-6">
        {categoryKeys.map((key) => (
          <Link
            key={key}
            href={`/${slugify(key)}`}
            className="text-base font-semibold text-gray-700 hover:text-[#c8bcab] transition-colors capitalize"
          >
            {toDisplayName(key)}
          </Link>
        ))}
      </div>
    </nav>
  );
}
