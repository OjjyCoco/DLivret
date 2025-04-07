"use client";
import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { FaDiscord } from "react-icons/fa";
import { FaSquareXTwitter } from "react-icons/fa6";

const Footer: React.FC = () => {
    return (
        <footer className="bg-[#0D0D0D] text-white dark:bg-white dark:text-black px-6 py-10 mt-10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center">

                <div className="flex flex-col items-center md:items-start">
                    <Image
                        src="/LogoBlanc.svg"
                        alt="Livret+ logomark"
                        width={150}
                        height={50}
                        className="mb-4"
                    />
                    <p className="text-sm text-gray-400 dark:text-gray-600">
                        &copy; {new Date().getFullYear()} DLivret+ — Tous droits réservés.
                    </p>
                </div>

                <div className="flex flex-col items-center space-y-2">
                    <Link href="/conditions-utilisation" className="hover:underline text-gray-300 dark:text-gray-700">
                        Conditions d'utilisation
                    </Link>
                    <Link href="/politique-confidentialite" className="hover:underline text-gray-300 dark:text-gray-700">
                        Politique de confidentialité
                    </Link>
                    <Link href="/admin" className="hover:underline text-gray-300 dark:text-gray-700">
                        Espace Admin
                    </Link>
                </div>

                <div className="flex justify-center md:justify-end space-x-6">
                    <a href="https://twitter.com/toncompte" target="_blank" rel="noopener noreferrer">
                        <FaSquareXTwitter className="w-5 h-5 text-white dark:text-black hover:text-blue-500 dark:hover:text-blue-600 transition" />
                    </a>
                    <a href="mailto:contact@livretplus.fr">
                        <Mail className="w-5 h-5 text-white dark:text-black hover:text-red-500 dark:hover:text-red-600 transition" />
                    </a>
                    <a href="https://discord.gg/tonserveur" target="_blank" rel="noopener noreferrer">
                        <FaDiscord className="w-5 h-5 text-white dark:text-black hover:text-indigo-500 dark:hover:text-indigo-600 transition" />
                    </a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
