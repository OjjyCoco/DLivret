"use client"

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { ModeToggle } from "./ModeToggle";
import { ConnectButton } from '@rainbow-me/rainbowkit'

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import {
    navigationMenuTriggerStyle,
    NavigationMenu,
    NavigationMenuList,
    NavigationMenuItem,
    NavigationMenuContent,
    NavigationMenuTrigger,
    NavigationMenuLink,
    NavigationMenuIndicator,
    NavigationMenuViewport,
} from "@/components/ui/navigation-menu"

const Header: React.FC = () => {
    const [menuOpen, setMenuOpen] = useState<string>("");

    return (
        <nav className="navbar">
            <Link href="/">
                <Image
                    className="dark:invert cursor-pointer"
                    src="/LogoNoir.svg"
                    alt="Livret+ logomark"
                    width={200}
                    height={1} // useless
                />
            </Link>
            <NavigationMenu value={menuOpen} onValueChange={setMenuOpen}>
                <NavigationMenuList className="space-x-4">
                    <NavigationMenuItem>
                        <Link href="/" legacyBehavior passHref>
                            <NavigationMenuLink
                                className={cn(navigationMenuTriggerStyle(), "px-6 py-3 text-lg font-semibold transition hover:bg-primary/10 hover:text-primary focus:ring focus:ring-primary/50")}
                            >
                                Comment investir
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>

                    <NavigationMenuItem value="livrets">
                        <NavigationMenuTrigger className="px-6 py-3 text-lg font-semibold transition hover:bg-primary/10 hover:text-primary focus:ring focus:ring-primary/50">
                            Livrets
                        </NavigationMenuTrigger>
                        <NavigationMenuContent>
                            <div className="grid gap-5 p-6 md:w-[450px] lg:w-[550px] lg:grid-cols-[1fr_1.5fr] bg-white shadow-xl rounded-xl">
                                <div className="flex flex-col justify-between row-span-full">
                                    <NavigationMenuLink asChild>
                                        <div className="flex h-full w-full flex-col justify-end rounded-lg bg-gradient-to-b from-gray-100 to-gray-50 p-6 transition focus:shadow-lg">
                                            <div className="mb-2 mt-4 text-lg font-semibold text-gray-900">DLivret</div>
                                            <p className="text-sm text-gray-600 leading-tight">
                                                Découvez les différentes stratégies de placement disponibles sur DLivret.
                                            </p>
                                        </div>
                                    </NavigationMenuLink>
                                </div>

                                <div className="flex flex-col space-y-3">
                                    {[
                                        { href: "/", title: "Livret Alpha", description: "Pour tester DLivret sans investir." },
                                        { href: "/", title: "Livret B", description: "Pour s'exposer au Bitcoin." },
                                        { href: "/", title: "Livret C", description: "Cryptos : Pour s'exposer à un panier de Cryptos." },
                                        { href: "/LivretD", title: "Livret D", description: "DeFi : Pour bénéficier des rendements supérieurs de la finance décentralisée." },
                                        { href: "/", title: "Livret E", description: "Euro : Pour obtenir des rendements supérieurs sur l'Euro." },
                                    ].map(({ href, title, description }) => (
                                        <Link
                                            key={title}
                                            href={href}
                                            className="block p-3 transition hover:bg-gray-100 rounded-lg"
                                            onClick={() => setMenuOpen("")}
                                        >
                                            <strong className="text-gray-900">{title}</strong>
                                            <p className="text-gray-600 text-sm">{description}</p>
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </NavigationMenuContent>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <Link href="/Uni" legacyBehavior passHref>
                            <NavigationMenuLink
                                className={cn(navigationMenuTriggerStyle(), "px-6 py-3 text-lg font-semibold transition hover:bg-primary/10 hover:text-primary focus:ring focus:ring-primary/50")}
                            >
                                Université
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>

                    <NavigationMenuItem>
                        <Link href="/#about" legacyBehavior passHref>
                            <NavigationMenuLink
                                className={cn(navigationMenuTriggerStyle(), "px-6 py-3 text-lg font-semibold transition hover:bg-primary/10 hover:text-primary focus:ring focus:ring-primary/50")}
                            >
                                Qui sommes-nous
                            </NavigationMenuLink>
                        </Link>
                    </NavigationMenuItem>
                </NavigationMenuList>
            </NavigationMenu>

            <div className="flex items-center space-x-4">
                <ConnectButton chainStatus="full" showBalance={false} />
                <ModeToggle />
            </div>
        </nav>
    );
};

export default Header;
