import Image from "next/image";

const Footer: React.FC = () => {
    return (
        <footer className="footer">
            <Image
                src="/LogoBlanc.svg"
                alt="Livret+ logomark"
                width={300}
                height={1} // Necessary but not used
            />
            <p>-- All rights reserved &copy; DLivret+ {new Date().getFullYear()} --</p>
        </footer>
    );
};

export default Footer;