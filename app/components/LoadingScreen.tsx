'use client'

import Image from 'next/image'

export default function LoadingScreen() {
	return (
		<div className="min-h-screen flex items-center justify-center bg-white">
			<div className="flex flex-col items-center">
				<Image src="/loader.svg" alt="Loading" width={80} height={80} priority />
				<p className="mt-4 text-gray-600">Loading...</p>
			</div>
		</div>
	)
}


