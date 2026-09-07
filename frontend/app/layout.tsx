import "./globals.css";
import { ReactNode } from "react";
import Sidebar from "../components/Sidebar";
export const metadata={title:"PRISM — Developer Intelligence",description:"Project intelligence for developers"};
export default function RootLayout({children}:{children:ReactNode}){return <div className="min-h-screen"><Sidebar/><main className="ml-[250px] min-h-screen px-10 py-8">{children}</main></div>}
