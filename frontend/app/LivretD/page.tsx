"use client";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { FocusCards } from "@/components/ui/focus-cards";
import { ConnectButton } from '@rainbow-me/rainbowkit'

export default function LivretD() {

    const cards = [
        {
          title: "Step 1",
          src: "",
        },
        {
          title: "Step 2",
          src: "",
        },
        {
          title: "Step 3",
          src: "",
        },
      ];

  return (
    <>
        <div className="relative flex flex-col items-center justify-center h-[70vh]">
        <TextHoverEffect text="Livret DeFi"/>
        <TextGenerateEffect
            words="La DeFi n'a jamais été aussi simple"
            className="text-4xl md:text-6xl absolute top-16 md:top-20 z-0"
        />
        </div>
        
        <div className="mx-auto my-12 max-w-2xl rounded-2xl bg-gradient-to-br from-[#1F2937] to-[#4B5563] p-6 text-center shadow-xl dark:from-zinc-800 dark:to-zinc-900">
          <h2 className="mb-4 text-2xl font-bold text-white dark:text-white">
            Avez-vous pensé à créer un portefeuille crypto ?
          </h2>
          <p className="mb-6 text-white dark:text-gray-300">
            Avant d’utiliser ce livret DeFi, assurez-vous d’avoir connecté votre wallet pour interagir.
          </p>
          <div className="flex justify-center">
            <ConnectButton chainStatus="full" showBalance={false} />
          </div>
        </div>

        <div>
            <FocusCards cards={cards} />
        </div>
        <div className="relative flex flex-col items-center justify-center h-[80vh]">
        <TextGenerateEffect
            words="En savoir plus sur le Livret DeFi"
            className="text-4xl md:text-6xl top-16 md:top-20 z-0"
        />
        <h1>Des explications ici</h1>
        </div>
    </>
  );
}
