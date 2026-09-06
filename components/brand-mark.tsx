import Image from "next/image";
import Link from "next/link";

type BrandMarkProps = {
  href?: string;
  size?: "sm" | "md" | "lg";
};

const SIZES = {
  sm: { width: 112, height: 28 },
  md: { width: 148, height: 36 },
  lg: { width: 196, height: 48 },
};

export function BrandMark({ href = "/", size = "md" }: BrandMarkProps) {
  const { width, height } = SIZES[size];
  const image = (
    <Image
      src="/brand/logo.svg"
      alt="DRIF"
      width={width}
      height={height}
      priority
    />
  );

  if (!href) return image;

  return (
    <Link href={href} className="inline-flex items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
      {image}
    </Link>
  );
}
