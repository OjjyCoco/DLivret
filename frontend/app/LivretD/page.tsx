"use client";
import ContractTest from "@/components/shared/ContractTest";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import { TextGenerateEffect } from "@/components/ui/text-generate-effect";
import { FocusCards } from "@/components/ui/focus-cards";

export default function LivretD() {

    const cards = [
        {
          title: "Forest Adventure",
          src: "",
        },
        {
          title: "Valley of life",
          src: "",
        },
        {
          title: "Sala behta hi jayega",
          src: "",
        },
      ];

  return (
    <>
        <div className="relative flex flex-col items-center justify-center h-[80vh]">
        <TextHoverEffect text="Livret DeFi"/>
        <TextGenerateEffect
            words="La DeFi n'a jamais été aussi simple"
            className="text-4xl md:text-6xl absolute top-16 md:top-20 z-0"
        />
        </div>
        <div>
            <FocusCards cards={cards} />
        </div>
        <div className="relative flex flex-col items-center justify-center h-[80vh]">
        <TextGenerateEffect
            words="En savoir plus sur le Livret DeFi"
            className="text-4xl md:text-6xl top-16 md:top-20 z-0"
        />
        <h1>Des Explications ici</h1>
        </div>
    </>
  );
}
