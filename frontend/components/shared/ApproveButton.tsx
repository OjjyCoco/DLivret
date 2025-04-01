'use client'
import { Button } from "@/components/ui/button"

// approve function
import { approveDLivretPT } from "./ApproveDLivretPT";

const ApproveButton: React.FC = () => {

    return (
        <Button variant="outline" className="text-indigo-700 border-white dark:bg-white dark:text-black dark:hover:bg-gray-200" onClick={approveDLivretPT}>Autoriser</Button>
    );
};

export default ApproveButton;