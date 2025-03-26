import Image from "next/image";

// dark mode button
import { ModeToggle } from "./ModeToggle";

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
                <p>Connect Wallet Button</p>
                <ModeToggle/>
            </div>
        </nav>
    );
};

export default Header;