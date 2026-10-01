//DJ say: Beneficios grids de componente para usar 
//como no jala copiar las atiquetas <></>

"use client";

import React from "react";
import {
    CalendarRange,
    ClipboardList,
    History,
    UserCog,
    Users,
} from "lucide-react";
import { useLandingLanguage } from "@/components/landing/LandingLanguageContext";
import { BenefitCard } from "./BenefitCard";

const icons = [CalendarRange, ClipboardList, Users, UserCog, History];

const shapes = [
    "[clip-path:polygon(0_0,100%_0,100%_calc(100%_-_28px),calc(100%_-_28px)_100%,0_100%)]",
    "[clip-path:polygon(28px_0,100%_0,100%_100%,0_100%,0_28px)]",
    "[clip-path:polygon(0_0,calc(100%_-_28px)_0,100%_28px,100%_100%,0_100%)]",
];

export function BenefitsGrid() {
    const { t } = useLandingLanguage();
    const cards = t.benefits.cards;

    return (
        <div className="grid gap-5 md:grid-cols-2 lg:gap-6">
        {cards.map((item, index) => (
            <BenefitCard
            key={item.id}
            item={item}
            index={index}
            icon={icons[index % icons.length]}
            shape={`${shapes[index % shapes.length]} ${
                index === cards.length - 1 ? "md:col-span-2" : ""
            }`}
            />
        ))}
        </div>
    );
}