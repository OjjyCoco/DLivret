import React from "react";
import { AnimatedTestimonials } from "@/components/ui/animated-testimonials";

export default function Home() {
  const testimonials = [
    {
      quote:
        "This solution has significantly improved our team's productivity. The intuitive interface makes complex tasks simple.",
      name: "Jean-Michel Radulesco",
      designation: "Cadre dans la finance",
      src: "/JMphoto.png",
    },
    {
      quote:
        "Implementation was seamless and the results exceeded our expectations. The platform's flexibility is remarkable.",
      name: "Nathan Heckmann",
      designation: "Développeur Web3",
      src: "/NATHANphoto.jpg",
    },
    {
      quote:
        "Outstanding support and robust features. It's rare to find a product that delivers on all its promises.",
      name: "Jean-François Madeline",
      designation: "Informaticien en profession libérale",
      src: "/JEFFphoto.png",
    },
    {
      quote:
        "The attention to detail and innovative features have completely transformed our workflow. This is exactly what we've been looking for.",
      name: "Eric Gendron",
      designation: "Auditeur & Consultant",
      src: "/ERICphoto.jpg",
    },
  ];

  return (
    <div className="scroll-smooth bg-[#FDFDFC] dark:bg-[#020817] transition-colors duration-300">
      <section className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="leading-normal md:leading-relaxed text-4xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-gray-800 to-gray-600 dark:from-gray-200 dark:to-gray-400 mb-10">
          L'investissement en crypto rendu simple
        </h1>
        <h2 className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8">
          Faites vos premiers pas dans la finance des crypto-actifs
        </h2>
        <button className="bg-gray-800 text-white px-6 py-3 rounded-full text-lg shadow-md hover:bg-gray-700 transition duration-300 dark:bg-gray-200 dark:text-gray-900 dark:hover:bg-white">
          Comment investir ?
        </button>
      </section>

      <section
        id="about"
        className="relative py-20 px-4 bg-gray-50 dark:bg-gray-800 rounded-full flex flex-col items-center text-center before:absolute before:top-0 before:left-0 before:w-full before:h-1 before:bg-gradient-to-r"
      >
        <h3 className="text-3xl font-semibold text-gray-800 dark:text-white mb-6">
          Qui sommes-nous ?
        </h3>
        <p className="max-w-2xl text-gray-600 dark:text-gray-300 text-lg">
          Une équipe de passionnés de finance décentralisée qui souhaite démocratiser
          l'accès à l'investissement crypto à travers une plateforme simple, ludique
          et éducative.
        </p>
        <div className="mt-12 w-full">
          <AnimatedTestimonials testimonials={testimonials} />
        </div>
      </section>
    </div>
  );
}
