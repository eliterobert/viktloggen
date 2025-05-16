'use client'

import Image from 'next/image'

export default function Header() {
  return (
    <div className="flex items-center justify-center">
      <Image
        src="/viktloggen.png"
        alt="Viktloggen logga"
        width={250}
        height={150}
        className="mb-1"
        priority
      />
    </div>
  )
}