"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import CodeBootScreen from "@/components/CodeBootScreen";
import ProjectsBackground from "@/components/ProjectsBackground";
import InteractiveBackground from "@/components/InteractiveBackground";
import FooterNav from "@/components/FooterNav";
import ProjectsCommitStackBg from "@/components/ProjectsCommitStackBg";
import ProjectDetailModal from "@/components/ProjectDetailModal";

// --- No changes to this section ---
const altPairs = [
  ["BUILD", "CREATE"],
  ["IDEA", "REALITY"],
  ["CODE", "SHIP"],
  ["VISION", "LAUNCH"],
  ["DEBUG", "DEPLOY"],
  ["HACK", "SOLVE"],
  ["LOOP", "BREAK"],
  ["STACK", "QUEUE"],
];

const projects = [
    {
    year: "May 2025",
    title: "Picasso: Your Inner Echoes",
    description: "Picasso is a multi-modal AI system that translates human emotions into personalized generative art, integrating advanced techniques in NLP, computer vision, and generative modeling. It captures the essence of human feelings and translates them into stunning visual representations.",
    image: "/images/image2.jpg",
    inputExample: "Just provide a text description of your emotions or feelings. Be as raw and expressive as you like!",
    outputExample: "Predicts your emotions, calculates the VAD scores, and generates a unique piece of art that reflects your emotional state along with a description of the generated art.",
    technicalOverview:
      "Picasso is built in Python and runs on Google Colab with GPU acceleration. It uses a fine-tuned Sentence-BERT model (all-MiniLM-L6-v2) for multi-label emotion classification, trained on a combination of GoEmotions, EmpatheticDialogues, and DailyDialog datasets, enriched with the NRC-VAD Lexicon. After detecting emotions, it generates emotion-based prompts which are passed to Stable Diffusion XL (base model) via Hugging Face's diffusers to produce high-resolution abstract art. Finally, the Gemini 1.5 Pro API generates an interpretive caption based on the detected emotions and generated prompt.",
    video: "/videos/Picasso.mp4",
  },
  {
    year: "June 2025",
    title: "Fashion Visual Search Engine",
    description: "A content-based fashion image similarity search system that helps users find visually similar products (e.g., dresses, jeans) based on uploaded images or image URLs.",
    image: "/images/fashion_visual_upscaled.jpg",
    inputExample: "Upload an image of a dress or simply provide an image URL.",
    outputExample: "Provides a list of visually similar fashion products with images and details.",
    technicalOverview:
      "This project uses a combination of deep learning for feature extraction, PCA for dimensionality reduction, and FAISS for efficient similarity search. The system is designed to handle large-scale fashion datasets and provide real-time search capabilities.",
    video: "/videos/fashion_visual.mp4",
  },
  {
    year: "July 2024",
    title: "Sentiment Analysis using BeautifulSoup and NLTK",
    description: "This project analyzes the sentiment of web articles by scraping content using BeautifulSoup and processing it with NLTK and TextBlob. It computes scores like polarity, subjectivity, readability (Fog Index), and word complexity. The output is compiled into a structured Excel sheet, making it useful for analyzing tone and complexity in editorial or financial content.",
    image: "/images/sentimental_analysis.jpg",
    inputExample: "An Excel file filled with article URLs and optional word lists for customizing sentiment scoring—ideal for batch processing web content.",
    outputExample: "An Excel report filled with polarity, subjectivity, word counts, Fog Index, complex word ratios, and a glimpse into how emotionally charged or readable each article is.",
    technicalOverview:"Built in Python using BeautifulSoup for scraping, NLTK for tokenization and text processing, TextBlob for sentiment analysis, and openpyxl for Excel handling. The core logic resides in Text Analysis.py, with support files for positive/negative words and stopword filtering.",
    video: "/videos/sent_analysis.mp4",
  },
  {
    year: "June 2024",
    title: "LipNet: Deep Learning-Based Lip Reading Model",
    description: "This project replicates and enhances the LipNet architecture, an end-to-end deep learning model for sentence-level lip reading. It uses spatiotemporal convolutions, Bi-LSTM layers, and CTC loss to translate sequences of lip movements from videos into complete textual sentences, eliminating the need for manual alignment or word-level segmentation.",
    image: "/images/lipnet_upscaled.jpg",
    inputExample: "Sequences of grayscale lip-region video frames (100x50 pixels), preprocessed and augmented using techniques like horizontal flipping, frame deletion, and word segmentation from the GRID Corpus dataset.",
    outputExample: "Predicted sentences from lip movement videos, along with saliency maps and confusion matrices that show which phonemes or visemes were most frequently confused during prediction.",
    technicalOverview:"Built using Python, TensorFlow, and OpenCV. The model consists of Conv3D layers for spatial-temporal feature extraction, Bi-directional LSTMs for sequence modeling, and a Connectionist Temporal Classification (CTC) loss layer for decoding unaligned sequence data. The system includes data augmentation, dropout regularization, saliency visualization, and viseme clustering for deeper error analysis.",
    video: "/videos/lipnet.mp4",
  },
  {
    year: "May 2024",
    title: "Stock Analysis using ARIMA and XGBoost",
    description: "This project focuses on forecasting stock prices using ARIMA and XGBoost models. It analyzes historical data of major Indian stocks to compare the effectiveness of traditional time series modeling with advanced machine learning for short-term price prediction.",
    image: "/images/stock.jpg",
    inputExample: "Historical stock data (OHLC and volume) collected via Yahoo Finance API. Users can specify stock symbols and time range for analysis, and update the dataset as needed for retraining.",
    outputExample: "Performance metrics (RMSE, MAE, MAPE) and predictive plots for each stock, saved in the results/ folder. The output clearly shows XGBoost outperforming ARIMA in forecasting accuracy across all stocks.",
    technicalOverview:"Developed in Python using libraries like yfinance, pandas, Dask, statsmodels, xgboost, and scikit-learn. ARIMA models were implemented using ACF/PACF tuning, and XGBoost models used engineered features such as lagged returns and rolling averages. All modeling and evaluation were performed in Jupyter notebooks, with outputs saved and visualized in the results/ directory.",
    video: "/videos/stock_market.mp4",
  }, 
  {
    year: "Jan 2024",
    title: "HMS: Hospital Management System",
    description: "MedLink is a centralized Hospital Management System (HMS) built to digitize and simplify healthcare workflows. It connects patients, doctors, and departments through a secure platform, enabling seamless management of medical records, appointments, and reports—all in one place. The system reduces dependency on manual processes and enhances the overall quality of patient care.",
    workflow: "The HMS begins with secure user login and role-based access for doctors, staff, and admins. Patients are registered with their complete medical details, after which appointments and diagnostics can be managed. Data flows through a structured pipeline for storage and analysis, while reports are auto-generated and made available in real-time. Admins can monitor operations, while doctors and staff access relevant patient data as needed.",
    inputExample:"Includes patient information, appointment schedules, diagnostic details, and staff entries.",
    outputExample:"Provides  dynamically generated medical reports (PDF), patient history views, appointment tracking, departmental analytics, and system notifications. The platform ensures every output is role-specific and securely handled.",
    AchievedGoals: "Reduced medical record retrieval time by 40%, Lowered data handling errors by 30%. Improved diagnostic speed with auto-generated PDF reports.Enhanced health trend analysis accuracy by 25% Provided real-time data access and centralized control across departments.",
    technicalOverview: "MedLink was developed using PHP 8 for backend logic and HTML/CSS for responsive frontend design. MySQL serves as the primary database for structured medical data storage. DOMPDF was used to generate real-time PDF reports, while Canva supported UI/UX design elements. The project was built using VS Code in a modular architecture with secure, role-based access control, ensuring scalability and patient data privacy.",
    image: "/images/hms.png",
    video: "/videos/hms.mp4",
  },
  {
    year: "Jan 2023",
    title: "Space Invaders Game (First Project)",
    description: "This was my first-ever project that sparked my passion for programming. Built using Python and Pygame, the game is a simple Space Invaders clone where players control a spaceship, shoot enemies, and avoid incoming fire. It helped me understand core game development concepts like object movement, collision detection, event handling, and sprite rendering.",
    inputExample:"Inputs include furious arrow key presses to move the spaceship and aggressive spacebar hits to fire lasers—basically, stress relief in keyboard form.",
    outputExample:"PThe result? Exploding enemy ships, flashing lasers, rising scores, and the occasional “Game Over” reminding you space is tough. It’s chaos—and it’s fun.",
    technicalOverview: "Developed in Python using Pygame, the game runs through a structured main.py file. It uses OOP for player, enemy, and laser classes, handles real-time rendering, keyboard events, and basic collision detection. All assets (ships, lasers, background) are loaded from a dedicated assets/ folder",
    image: "/images/space_invaders.jpg",
    video: "/videos/space_invaders.mp4",
  },
];

type ProjectType = typeof projects[number];

// --- No changes to ProjectsOverlay component ---
function ProjectsOverlay({ activeIdx }: { activeIdx: number }) {
  const [pair, setPair] = useState(altPairs[0]);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    setPair(altPairs[Math.floor(Math.random() * altPairs.length)]);
  }, [activeIdx]);

  return (
    <div
      className="fixed bottom-20 left-0 right-0 z-40 flex justify-center pointer-events-auto w-screen max-w-full"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.5 }}
        className="relative flex flex-col items-center justify-center w-full max-w-full"
      >
        <motion.div
          className="transition-opacity duration-500"
          animate={{ opacity: hovered ? 0 : 1 }}
        >
          <h1 className="text-cyan-300 text-[10vw] font-extrabold tracking-tighter leading-none text-center">
            PROJECTS
          </h1>
        </motion.div>
        <motion.div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-row items-center justify-center w-full max-w-full pointer-events-none"
          animate={{ opacity: hovered ? 1 : 0 }}
        >
          <motion.div
            className="flex flex-row items-center justify-center"
            animate={{ gap: hovered ? "6vw" : "0vw" }}
            transition={{ type: "spring", stiffness: 80, damping: 15 }}
          >
            <motion.span
              className="text-cyan-300 text-[7vw] font-extrabold tracking-tighter leading-none whitespace-nowrap"
              animate={{ x: hovered ? "-3vw" : 0 }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
            >
              {pair[0]}
            </motion.span>
            <motion.span
              className="text-cyan-300 text-[7vw] font-extrabold tracking-tighter leading-none whitespace-nowrap"
              animate={{ x: hovered ? "3vw" : 0 }}
              transition={{ type: "spring", stiffness: 80, damping: 15 }}
            >
              {pair[1]}
            </motion.span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}


export default function ProjectsPage() {
  // --- CHANGE 1: Modified useState for `booting` ---
  // We now use an initializer function that runs only once on component mount.
  const [booting, setBooting] = useState(() => {
    // sessionStorage is a browser-only API, so we check if `window` is defined.
    if (typeof window !== "undefined") {
      // Check if our flag 'hasBooted' is already in sessionStorage.
      const hasBootedInSession = sessionStorage.getItem("hasBooted");
      // If the flag exists, it means the user has seen the animation in this session.
      // So, we start with `booting` as false.
      if (hasBootedInSession) {
        return false;
      }
    }
    // If it's the first visit in the session (or we're on the server),
    // we should show the boot screen.
    return true;
  });

  const [activeIdx, setActiveIdx] = useState(0);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const projRefs = useRef<(HTMLDivElement | null)[]>([]);
  const observer = useRef<IntersectionObserver | null>(null);

  // --- CHANGE 2: New `useEffect` to set the session flag ---
  useEffect(() => {
    // This effect runs if the `booting` state is `true`.
    if (booting) {
      // We set a flag in sessionStorage to remember that the boot animation
      // has started for this session.
      sessionStorage.setItem("hasBooted", "true");
    }
  }, [booting]); // The dependency array ensures this runs only when `booting` changes.

  // --- No changes to the observer logic ---
  const observe = useCallback((elements: HTMLDivElement[]) => {
    if (observer.current) {
      observer.current.disconnect();
    }
    observer.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const idx = elements.findIndex((el) => el === entry.target);
          if (entry.isIntersecting) {
            setActiveIdx(idx);
          }
        });
      },
      {
        root: null,
        rootMargin: "-40% 0px -40% 0px",
        threshold: 0.3,
      }
    );
    elements.forEach((el) => {
      if (el) {
        observer.current?.observe(el);
      }
    });
  }, []);

  useEffect(() => {
    const elements = projRefs.current.filter((ref): ref is HTMLDivElement => ref !== null);
    observe(elements);
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [observe]);


  return (
    <main className="relative w-full min-h-screen bg-black text-white overflow-x-hidden">
      <InteractiveBackground />
      <ProjectsBackground />
      <ProjectsCommitStackBg />
      
      {/* --- This rendering logic remains the same and works perfectly with our changes --- */}
      {booting && <CodeBootScreen onFinish={() => setBooting(false)} />}
      
      <ProjectsOverlay activeIdx={activeIdx} />

      {/* Vertical timeline bar - No changes */}
      <div className="fixed left-10 top-1/2 transform -translate-y-1/2 flex flex-col items-center w-12 z-50 pointer-events-auto">
        {projects.map((proj, idx) => (
          <motion.div
            key={proj.year}
            className="h-6 w-6 rounded-full border-2 border-cyan-300 mb-8 cursor-pointer"
            initial={{ scale: 0.8, opacity: 0.5 }}
            animate={idx === activeIdx ? { scale: 1.2, opacity: 1 } : { scale: 0.8, opacity: 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            onClick={() => {
              setActiveIdx(idx);
              const element = projRefs.current[idx];
              if (element) {
                element.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                  inline: 'start'
                });
              }
            }}
          />
        ))}
      </div>

      {/* FooterNav - No changes */}
      <div className="fixed bottom-0 left-0 right-0 z-30 pointer-events-auto">
        <FooterNav />
      </div>

      {/* Projects List - No changes */}
      <div className="relative w-full max-w-6xl mx-auto pt-32 pb-40 flex">
        <div className="flex-1 flex flex-col gap-32 ml-20">
          {projects.map((proj, idx) => (
            <motion.div
              key={proj.year}
              ref={(el) => {
                projRefs.current[idx] = el;
              }}
              initial={{ opacity: 0, y: 60, scale: 0.98 }}
              animate={idx === activeIdx ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.5 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 60, damping: 18 }}
              className="flex flex-col md:flex-row items-center gap-10 cursor-pointer"
              onClick={() => {
                setSelectedProject(proj);
                setModalOpen(true);
              }}
            >
              <Image
                src={proj.image}
                alt={proj.title}
                width={400}
                height={300}
                className="object-cover shadow-lg"
              />
              <div className="flex-1 text-left">
                <div className="text-cyan-300 font-semibold text-lg mb-1">{proj.year}</div>
                <div className="text-2xl font-bold mb-2">{proj.title}</div>
                <div className="text-base text-white/80">{proj.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* ProjectDetailModal - No changes */}
      <ProjectDetailModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        project={selectedProject}
      />
    </main>
  );
}







