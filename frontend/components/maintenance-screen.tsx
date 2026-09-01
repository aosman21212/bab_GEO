import Image from '@/components/app-image'

export function MaintenanceScreen({ locale }: { locale: string }) {
  const isAr = locale === 'ar'
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-6 py-20 text-center">
      <Image
        src="/images/logo-bab.png"
        alt="BAB"
        width={160}
        height={56}
        className="h-12 w-auto"
        unoptimized
      />
      <h1 className="mt-8 text-3xl font-extrabold text-navy md:text-4xl">
        {isAr ? 'الموقع قيد الصيانة' : 'We will be back soon'}
      </h1>
      <p className="mt-4 max-w-md text-muted-foreground">
        {isAr
          ? 'نقوم حالياً بأعمال صيانة. يرجى المحاولة لاحقاً.'
          : 'The site is temporarily under maintenance. Please check back shortly.'}
      </p>
    </div>
  )
}
