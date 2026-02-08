"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Github, ExternalLink, Globe } from "lucide-react"; // Or your preferred icon library

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
    githubUrl?: string; // Added
    huggingFaceUrl?: string; // Added
    deploymentUrl?: string; // Added
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
              className="absolute top-4 right-4 text-cyan-300 hover:text-cyan-100 text-xl font-bold z-10"
              aria-label="Close modal"
            >
              ×
            </button>

            {/* Title */}
            <div className="text-cyan-300 text-sm mb-1">{project.year}</div>
            <h2 className="text-2xl md:text-3xl font-extrabold mb-4">{project.title}</h2>

            {/* Project Links - Added Section */}
            <div className="flex flex-wrap gap-3 mb-6">
              {project.githubUrl && (
                <Link
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-full text-sm font-medium transition-colors"
                >
                  <Github size={16} />
                  <span>GitHub</span>
                </Link>
              )}
              {project.huggingFaceUrl && (
                <Link
                  href={project.huggingFaceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-200 rounded-full text-sm font-medium transition-colors"
                >
                  <span>🤗</span> {/* Using emoji for Hugging Face or import an icon */}
                  <span>Hugging Face Space</span>
                </Link>
              )}
              {project.deploymentUrl && (
                <Link
                  href={project.deploymentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/20 text-cyan-200 rounded-full text-sm font-medium transition-colors"
                >
                  <Globe size={16} />
                  <span>Live Demo</span>
                </Link>
              )}
            </div>


            {/* Image */}
            {project.image && (
              <Image
                src={project.image}
                alt={project.title}
                width={3840}
                height={2160}
                className="rounded-md mb-6 shadow-lg object-cover w-full h-auto"
              />
            )}

            {/* Description */}
            <div className="mb-6">
               <h3 className="text-cyan-200 font-semibold mb-2">About Project</h3>
               <p className="text-white/80 leading-relaxed">{project.description}</p>
            </div>


            {/* Input Example */}
            {project.inputExample && (
              <div className="mb-6">
                <h3 className="text-cyan-200 font-semibold mb-2">Input Format</h3>
                <div className="bg-black/30 p-4 rounded-lg border border-white/10 font-mono text-sm text-gray-300 overflow-x-auto">
                  {project.inputExample}
                </div>
              </div>
            )}

            {/* Output Example */}
            {project.outputExample && (
              <div className="mb-6">
                <h3 className="text-cyan-200 font-semibold mb-2">Output Example</h3>
                 <div className="bg-black/30 p-4 rounded-lg border border-white/10 font-mono text-sm text-gray-300 overflow-x-auto">
                  {project.outputExample}
                </div>
              </div>
            )}

            {/* Video */}
            {project.video && (
              <div className="mb-6">
                <h3 className="text-cyan-200 font-semibold mb-2">Demo Video</h3>
                <div className="relative pt-[56.25%] bg-black/50 rounded-lg overflow-hidden border border-white/10">
                   <video
                    controls
                    src={project.video}
                    className="absolute top-0 left-0 w-full h-full object-contain"
                  />
                </div>
              </div>
            )}

            {/* Technical Overview */}
            {project.technicalOverview && (
              <div className="mb-4">
                <h3 className="text-cyan-200 font-semibold mb-2">Technical Overview</h3>
                <p className="text-white/80 text-sm whitespace-pre-wrap leading-relaxed">
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