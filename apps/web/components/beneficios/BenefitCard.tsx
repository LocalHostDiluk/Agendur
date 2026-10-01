//DJ say: Beneficios carts de componente para usar
//como no jala copiar las atiquetas <></>
import { Icon, type LucideIcon } from "lucide-react";


export interface BenefitItem{
    id: string,
    title: string,
    desc: string,
    badge: string,
}

export function BenefitCard({
        item,
        icon: Icon,
        index,
        shape = "",
    }: {
        item: BenefitItem;
        icon: LucideIcon;
        index: number;
        shape?: string;
    }) {
        return (
            <article className='flex min-h-[260px] flex-col justify-between bg-ink p-7 text-paper sm:p-8 ${shape}'>
                <div className="flex items-start justify-between gap-4">
                    <span className="grid size-11 place-items-center rounded-full border-2 border-paper/60">
                    <Icon className="size-5" aria-hidden="true" />
                    </span>
                    <span className="font-mono text-xs text-paper/50">0{index + 1}</span>
                </div>

                <div className="mt-10">
                    <span className="inline-flex bg-flame px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-[0.12em] text-ink">
                    {item.badge}
                    </span>
                    <h3 className="mt-4 font-bricolage text-2xl font-semibold leading-tight">
                    {item.title}
                    </h3>
                    <div className="my-5 border-t-2 border-dashed border-paper/35" />
                    <p className="leading-relaxed text-paper/70">{item.desc}</p>
                </div>
            </article>
        );
    }