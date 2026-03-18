import Image from 'next/image';
import LogoImage from '@/assets/logo.svg';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

interface LogoProps {
  className?: string; 
  hSize?: string; 
}

export default function Logo({ className, hSize }: LogoProps) {
  return (
    <Link href="/">
      <Image
        src={LogoImage}
        alt="Logo"
        priority={true}
        className={twMerge('w-auto', className, hSize)}
      />
    </Link>
  );
}
