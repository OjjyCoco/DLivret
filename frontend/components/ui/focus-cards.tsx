"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import ApproveButton from "@/components/shared/ApproveButton"
import SwapComponent from "../shared/Swap";

export const Card = React.memo(
  ({
    card,
    index,
    hovered,
    setHovered,
  }: {
    card: any;
    index: number;
    hovered: number | null;
    setHovered: React.Dispatch<React.SetStateAction<number | null>>;
  }) => (
    <div
      onMouseEnter={() => setHovered(index)}
      onMouseLeave={() => setHovered(null)}
      className={cn(
        "rounded-xl relative bg-gradient-to-br from-[#1F2937] to-[#4B5563] p-6 overflow-hidden h-[800px] md:h-[800px] w-full transition-all duration-500 ease-out transform hover:scale-105 shadow-lg hover:shadow-2xl",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >

        <div className="top-4 left-4 text-5xl md:text-6xl font-bold text-white">
        {index + 1}
      </div>
      {/* Conditionally render content only in the middle card (index 0, 1, 2) */}
      {index === 0 && (
        <div className="flex flex-col items-center text-center text-white gap-6 relative">
        <h2 className="text-4xl md:text-5xl font-extrabold mt-12">Achetez de l'USDe</h2>
        <p className="text-lg md:text-xl max-w-lg">
          Rendez-vous sur le site du stablecoin USDe ci-dessous pour en acheter.
        </p>
        <a
          href="https://app.ethena.fi/swap"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-300 hover:text-indigo-400 text-lg md:text-xl font-medium transition duration-300"
        >
          ➜ Acheter de l'USDe
        </a>
        </div>      
      )}

      {index === 1 && (
        <div className="flex flex-col items-center text-center text-white gap-6 relative">
          <h2 className="text-4xl md:text-5xl font-extrabold mt-12">
            Autorisez DLivret à utiliser vos fonds
          </h2>
          <p className="text-lg md:text-xl max-w-lg">
            Confirmez les autorisations pour permettre l'investissement sécurisé de vos fonds.
          </p>
          <ApproveButton />
        </div>      
      )}

      {index === 2 && (
        <div className="text-xl md:text-2xl font-semibold text-white space-y-4">
          <p className="text-lg font-bold">C'est le moment de convertir vos USDe en actif à rendement !</p>
          <SwapComponent/>
        </div>
        
      )}
    </div>
  )
);

Card.displayName = "Card";

type Card = {
  title: string;
  src: string;
};

export function FocusCards({ cards }: { cards: Card[] }) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 max-w-8xl mx-auto md:px-8 w-full">
      {cards.map((card, index) => (
        <Card
          key={card.title}
          card={card}
          index={index}
          hovered={hovered}
          setHovered={setHovered}
        />
      ))}
    </div>
  );
}
