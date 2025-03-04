import { Card } from "../ui/card"; 
import { FileText, Github, Youtube } from "lucide-react";

const FOOTER_LINKS = [
  {
    icon: FileText,
    title: "Documentation",
    description: "Explore our developer docs.",
    link:"https://www.openfort.xyz/docs/guides/ecosystem"
  },
  {
    icon: Github,
    title: "GitHub Source Code",
    description: "View our example repos on GitHub.",
    link: "https://github.com/openfort-xyz/ecosystem-sample"
  },
  {
    icon: Youtube,
    title: "YouTube Channel",
    description: "Watch our tutorials on YouTube.",
    link: "https://www.youtube.com/@openfort"
  },
] as const;

export function Footer() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mt-8 md:mt-12">
      {FOOTER_LINKS.map((link) => (
      <a 
        key={link.title} 
        href={link.link} 
        target="_blank" 
        rel="noopener noreferrer"
        className="no-underline"
      >
        <Card 
        className="p-4 md:p-6 bg-[#1A1A1A]/80 backdrop-blur-md border-gray-800 text-center hover:bg-[#222222]/90 transition-colors cursor-pointer"
        >
        <link.icon className="w-5 h-5 md:w-6 md:h-6 mx-auto mb-2" />
        <h3 className="font-semibold mb-1 md:mb-2 text-sm md:text-base">{link.title}</h3>
        <p className="text-xs md:text-sm text-gray-400">{link.description}</p>
        </Card>
      </a>
      ))}
    </div>
  );
}