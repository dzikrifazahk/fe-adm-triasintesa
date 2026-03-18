import Image from 'next/image';
import LogoImage from '@/assets/logo-no-name.svg';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

interface LogoProps {
  className?: string; 
  hSize?: string; 
}

export default function LogoNoName({ className, hSize }: LogoProps) {
  return (
    <Link href="/">
      <Image
        src={LogoImage}
        alt="Logo"
        priority={false}
        className={twMerge('w-auto', className, hSize)}
      />
    </Link>
  );
}
