import Image from "next/image";

// dark mode button
import { ModeToggle } from "./ModeToggle";
// wallet button
import { ConnectButton } from '@rainbow-me/rainbowkit'

const Header: React.FC = () => {
    return (
        <nav className="navbar">
            <Image
            className="dark:invert"
            src="/LogoNoir.svg"
            alt="Livret+ logomark"
            width={200}
            // height is useless but necessary
            height={1}
            />
            <p>Navbar</p>
            <div className="flex items-center space-x-4">
                <ConnectButton chainStatus="full" showBalance={false}/>
                <ModeToggle/>
            </div>
        </nav>
    );
};

export default Header;