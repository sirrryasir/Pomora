import { ReactNode } from "react";

export default function BotLayout({ children }: { children: ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen relative">
            {children}
        </div>
    );
}
