"use client";

import React, { useState, useRef, useEffect } from "react";
import emojisData from "@/lib/emojis.json";
import { Smiley } from "@phosphor-icons/react";

interface EmojiPickerProps {
  onSelect: (emojiId: string) => void;
  color?: string;
}

export function EmojiPicker({ onSelect, color = "#000" }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);
  
  const emojis = Object.values(emojisData);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={pickerRef}>
      <button 
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className="hover:scale-110 transition-transform flex gap-1 items-center"
      >
        <Smiley weight="fill" color={color} size={16} />
      </button>

      {isOpen && (
        <div 
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 max-h-64 overflow-y-auto bg-black/90 border border-neutral-800 rounded-lg shadow-xl z-50 p-2 grid grid-cols-6 gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          {emojis.map((emoji) => (
            <button
              key={emoji.id}
              onClick={() => {
                onSelect(emoji.id);
                setIsOpen(false);
              }}
              className="hover:scale-110 transition-transform flex justify-center items-center w-8 h-8 rounded hover:bg-neutral-800"
              title={emoji.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={emoji.path} alt={emoji.name} className="w-6 h-6 object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
