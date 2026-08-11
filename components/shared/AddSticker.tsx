"use client"

import { PlusIcon } from "@phosphor-icons/react";
import { motion } from "framer-motion"

export const AddSticker = (props: { onClick: (color: string) => void }) => {
  const colors = [
    { id: "amber", hex: "#FAC66B" },
    { id: "rose", hex: "#FC9583" },
    { id: "sky", hex: "#93C2EA" },
    { id: "mint", hex: "#95DBAB" },
    { id: "lilac", hex: "#C6ADEC" },
    { id: "blush", hex: "#F2C6DB" }
  ];

  return (
    <div className="absolute bottom-4 md:bottom-8 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-fit">
      <div className="flex flex-wrap sm:flex-nowrap justify-center items-center gap-2 sm:gap-3 md:gap-4 backdrop-blur-md p-2 sm:p-3 md:p-4 rounded-3xl shadow-xl border border-black/10">
        {colors.map((c) => (
          <motion.button
            key={c.id}
            onClick={() => props.onClick(c.id)}
            whileHover={{ scale: 1.15, rotate: 90, y: -4 }}
            whileTap={{ scale: 0.85, y: 2 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl flex justify-center items-center shadow-sm border border-black/20"
            style={{ backgroundColor: c.hex }}
          >
            <PlusIcon className="w-5 h-5 md:w-6 md:h-6" color="bg-transparent" />
          </motion.button>
        ))}
      </div>
    </div>
  )
}
