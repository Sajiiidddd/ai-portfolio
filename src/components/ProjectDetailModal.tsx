"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import Image from "next/image";

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: {
    year: string;
    title: string;
    description: string;
    image: string;
    inputExample?: string;
    outputExample?: string;
    technicalOverview?: string;
    video?: string;
  } | null;
}

export default function ProjectDetailModal({
  isOpen,
  onClose,
  project,
}: ProjectDetailModalProps) {
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  // Close on Esc
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  // Click outside to close
  const handleClickOutside = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === backdropRef.current) onClose();
  };

  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={backdropRef}
          onClick={handleClickOutside}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ y: 60, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 60, opacity: 0, scale: 0.95 }}
            transition={{ type: "spring", damping: 20, stiffness: 150 }}
            className="relative bg-white/5 border border-cyan-300/10 backdrop-blur-xl rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 text-white shadow-xl"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-cyan-300 hover:text-cyan-100 text-xl font-bold"
              aria-label="Close modal"
            >
              ×
            </button>

            {/* Title */}
            <div className="text-cyan-300 text-sm mb-1">{project.year}</div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-4">{project.title}</h2>

            {/* Image */}
            {project.image && (
              <Image
                src={project.image}
                alt={project.title}
                width={3840}
                height={2160}
                className="rounded-md mb-6 shadow-lg object-cover"
              />
            )}

            {/* Description */}
            <p className="text-white/80 mb-4">{project.description}</p>

            {/* Input Example */}
            {project.inputExample && (
              <div className="mb-4">
                <h3 className="text-cyan-200 font-semibold mb-1">Input Format</h3>
                <pre className="bg-white/10 p-3 rounded text-sm whitespace-pre-wrap border border-cyan-300/10">
                  {project.inputExample}
                </pre>
              </div>
            )}

            {/* Output Example */}
            {project.outputExample && (
              <div className="mb-4">
                <h3 className="text-cyan-200 font-semibold mb-1">Output Example</h3>
                <pre className="bg-white/10 p-3 rounded text-sm whitespace-pre-wrap border border-cyan-300/10">
                  {project.outputExample}
                </pre>
              </div>
            )}

            {/* Video */}
            {project.video && (
              <div className="mb-4">
                <h3 className="text-cyan-200 font-semibold mb-1">Demo Video</h3>
                <video
                  controls
                  src={project.video}
                  className="rounded shadow-lg w-full"
                />
              </div>
            )}

            {/* Technical Overview */}
            {project.technicalOverview && (
              <div className="mb-4">
                <h3 className="text-cyan-200 font-semibold mb-1">Technical Overview</h3>
                <p className="text-white/80 text-sm whitespace-pre-wrap">
                  {project.technicalOverview}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}


