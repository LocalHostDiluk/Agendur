"use client";

import { IconCloud } from "@/components/ui/icon-cloud";
import { useAuthBrand } from "./AuthBrandContext";
import { motion, AnimatePresence } from "motion/react";

const slugs = [
  "whatsapp",
  "googlecalendar",
  "gmail",
  "googlemeet",
  "zoom",
  "microsoftoutlook",
  "microsoftteams",
  "calendly",
  "stripe",
  "paypal",
  "mercadopago",
  "square",
  "applepay",
  "instagram",
  "facebook",
  "messenger",
  "telegram",
  "slack",
  "notion",
  "airtable",
  "hubspot",
  "salesforce",
  "mailchimp",
  "twilio",
  "intercom",
  "zendesk",
  "zapier",
  "make",
  "shopify",
  "google",
];

const images = slugs.map(
  (slug) => `https://cdn.simpleicons.org/${slug}/${slug}`,
);

export function AuthBentoGrid() {
  const { copy } = useAuthBrand();

  const headline = copy.headline || "Todo tu negocio en un solo lugar";
  const subheadline =
    copy.subheadline ||
    "Únete a la plataforma líder para gestionar citas, clientes y servicios de forma automática y sin complicaciones.";

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-8 lg:p-12">
      <div className="flex flex-col items-center justify-center space-y-8 max-w-[500px]">
        <div className="text-center space-y-3 min-h-[110px] flex flex-col justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={headline}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="space-y-2"
            >
              <h2 className="text-3xl font-bricolage font-bold text-white tracking-tight">
                {headline}
              </h2>
              <p className="text-sm text-text-secondary">
                {subheadline}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="relative flex h-full w-full max-w-[32rem] items-center justify-center overflow-hidden rounded-lg">
          <IconCloud images={images} />
        </div>
      </div>
    </div>
  );
}
