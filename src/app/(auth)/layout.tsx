import Image from 'next/image';

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="mb-6">
        <Image
          src="/logo.png"
          alt="NodeIDs Logo"
          width={180}
          height={72}
          className="h-14 w-auto dark:invert"
          priority
        />
      </div>
      <div className="w-full max-w-sm">{children}</div>
    </div>
  );
}
