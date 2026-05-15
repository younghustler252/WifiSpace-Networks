import Link from 'next/link';

interface AuthFooterProps {
    text: string;
    linkText: string;
    linkHref: string;
}

export const AuthFooter = ({ text, linkText, linkHref }: AuthFooterProps) => (
    <div className="mt-6 text-sm text-center text-muted-foreground">
        {text}{" "}
        <Link href={linkHref} className="text-accent font-medium hover:underline">
        {linkText}
        </Link>
    </div>
);