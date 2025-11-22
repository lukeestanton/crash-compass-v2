import Image from "next/image";
import Link from "next/link";
import Logo from "@/public/CrashCompassTransparent.svg";

export default function Header() {
  return (
    <nav className="flex items-center justify-center px-6 py-2 bg-white shadow-md">
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
    </nav>
  );
}
