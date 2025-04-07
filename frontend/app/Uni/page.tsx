"use client";
import Image from "next/image";

export default function Uni() {
  return (
    <div className="w-full">
      <h1 className="text-4xl font-bold text-center my-10">Université</h1>

      <div className="flex flex-col gap-4">
        <div className="relative w-full h-screen">
          <Image
            src="/image1.jpg"
            alt="Image 1"
            fill
            className="object-cover"
            priority
          />
        </div>
        <div className="relative w-full h-screen">
          <Image
            src="/image2.jpg"
            alt="Image 2"
            fill
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}
