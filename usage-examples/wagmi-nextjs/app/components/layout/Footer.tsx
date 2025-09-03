import { FileText, Github, Youtube } from "lucide-react";

const FOOTER_LINKS = [
  {
    icon: FileText,
    title: "Documentation",
    link:"https://www.openfort.io/docs/products/cross-app-wallet"
  },
  {
    icon: Github,
    title: "GitHub",
    link: "https://github.com/openfort-xyz/ecosystem-sample"
  },
  {
    icon: Youtube,
    title: "YouTube",
    link: "https://www.youtube.com/@openfort"
  },
] as const;

export function Footer() {
  return (
    <div className="mt-6 border-t border-border pt-4">
      <div className="flex flex-wrap gap-4 items-center justify-start">
        {FOOTER_LINKS.map((link) => (
          <a 
            key={link.title} 
            href={link.link} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
          >
            <link.icon className="w-4 h-4" />
            <span>{link.title}</span>
          </a>
        ))}
      </div>
    </div>
  );
}