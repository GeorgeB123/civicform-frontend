import Image from 'next/image'

export default function Header() {
  return (
    <div className="bg-[#1e3a5f] text-white">
      <div className="bg-[#172b42] px-6 py-4">
        <div className="container mx-auto max-w-6xl flex items-center gap-4">
          <Image
            src="/logo--desktop.svg"
            alt="Logo"
            width={180}
            height={60}
            className="text-white fill-white"
          />
        </div>
      </div>
      <div className="px-6 py-12">
        <h1 className="text-4xl font-bold container mx-auto max-w-6xl">Stolen Property</h1>
      </div>
    </div>
  )
}