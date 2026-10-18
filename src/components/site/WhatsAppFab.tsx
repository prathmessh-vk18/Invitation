"use client";

import { motion } from "framer-motion";
import { site, whatsappLink } from "@/config/site";
import { WaIcon } from "@/invites/shared";

export function WhatsAppFab() {
  return (
    <motion.a
      href={whatsappLink(`Hi ${site.name}! I'd like to know more about your wedding invitations.`)}
      target="_blank"
      rel="noreferrer"
      initial={{ opacity: 0, y: 30, scale: 0.8 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay: 1.5, type: "spring", stiffness: 200, damping: 18 }}
      className="group fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-[#25d366] py-3 pr-5 pl-3.5 text-sm font-semibold text-white shadow-[0_14px_40px_-10px_#25d366] sm:right-6 sm:bottom-6"
    >
      <span className="relative grid size-7 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-white/40 [animation-duration:2.5s]" />
        <span className="relative text-lg">
          <WaIcon />
        </span>
      </span>
      Let&rsquo;s talk
    </motion.a>
  );
}
