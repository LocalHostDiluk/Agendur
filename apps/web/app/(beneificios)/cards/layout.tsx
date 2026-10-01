// archivo de cards como referencia base de dj, mañana le continuo
// cards/layout.tsx

export default function BeneficiosCardsLayout({
    children,
    }: LayoutProps<"/">){
        return <div className="flex flex-col">{children}</div>;
    }