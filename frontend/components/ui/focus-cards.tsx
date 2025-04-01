"use client";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

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
        "rounded-xl relative bg-gradient-to-br from-[#1F2937] to-[#4B5563] p-6 overflow-hidden h-[800px] md:h-[700px] w-full transition-all duration-500 ease-out transform hover:scale-105 shadow-lg hover:shadow-2xl",
        hovered !== null && hovered !== index && "blur-sm scale-[0.98]"
      )}
    >

        <div className="top-4 left-4 text-5xl md:text-6xl font-bold text-white">
        {index + 1}
      </div>
      {/* Conditionally render content only in the middle card (index 0, 1, 2) */}
      {index === 0 && (
        <div className="text-xl md:text-2xl font-semibold text-white space-y-4">
          <h2 className="text-3xl font-bold">Commencez par acheter de l'USDe</h2>
          <p className="text-lg">Rendez-vous sur le site du stable coin USDe ci-dessous pour en acheter</p>
          <a
            href="https://app.ethena.fi/swap"
            className="text-indigo-200 hover:underline text-lg"
          >
            Lien USDe
          </a>
        </div>
      )}

      {index === 1 && (
        <div className="text-xl md:text-2xl font-semibold text-white space-y-4">
          <h2 className="text-3xl font-bold">Autorisez DLivret à utiliser vos fonds pour investissement</h2>
          <Button variant="outline" className="text-indigo-700 border-white">
            approveDLivretPT
          </Button>
        </div>
      )}

      {index === 2 && (
        <div className="text-xl md:text-2xl font-semibold text-white space-y-4">
          <h2 className="text-3xl font-bold">Choisissez le montant à investir et swappez vos USDe pour vos PT USDe !</h2>
          <Button variant="outline" className="text-indigo-700 border-white">
            Acheter des PT USDe
          </Button>
          <h2 className="text-3xl font-bold">Quand vous serez prêt pour vendre vos PT, revenez sur cette carte pour demander vos USDe</h2>
          <Button variant="outline" className="text-indigo-700 border-white">
            Vendre mes PT USDe
          </Button>
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
