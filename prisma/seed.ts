import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper to create URL-friendly slugs
const slugify = (text: string) =>
  text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

async function main() {
  // Clear existing data (optional during dev reseeds)
  await prisma.vote.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.blog.deleteMany();

  const colabBlog = await prisma.blog.create({
    data: {
      title: "The Google Colab Survival Guide",
      slug: slugify("The Google Colab Survival Guide"),
      description: "How to avoid your Colab session crashing halfway into your model training.",
      image: "/images/checkpoint.png",
      content: `So here’s the thing — being an AIML enthusiast sounds super cool until your PC starts heating up like it’s about to launch into orbit.\n\nAnd let’s be real — running those big, juicy deep learning models that make your resume pop and give you that "I’m doing something impactful" high comes at a literal cost.\n\nExpensive machines, complicated setup rituals (yes, I’m looking at you, system paths), and those pesky CUDA errors that haunt you at night.\n\nWhen I first stepped into this space, like any other rookie, I turned to my savior — Google Colab. Free GPUs? Easy notebook sharing? One-click pip installs? Say less.\n\nBut (and there’s always a but)...\nColab isn't perfect. While it’s a dream for quick experiments and training runs, it’s not production-friendly. You can’t really deploy stuff on it. And let’s not even talk about the free tier GPU limits — 4-hour runtime, and boom, session gone. Your model? Half-trained. Your dreams? Slightly crushed.\n\nThe Colab Pain Hits Hard\n\nWhile working on two of my fav projects — one being LIPNET (a CNN-RNN-based lipreading model) and the other my passion baby PICASSO (emotion-to-art AI, still in progress!) — I hit the 4-hour wall every single time.\nJust training my own CNN for LIPNET took 6 hours on a T4 GPU, and Colab was like:\n“Yeah nah, time’s up buddy.”\n\nSo I did what every noob does — I got Colab Pro.\nPaid real money. Burnt through my compute units in three training runs. Facepalm.\n\n## Enter: The Model Checkpoint Hack\n\nThat’s when I discovered a real game-changer — model checkpoints.\n\nHere’s the deal:\n\nInstead of training your model for 40 full epochs in one go (and watching Colab kill your session halfway),\nwhy not break it up?\n\n- Train for 20 epochs\n- Save the checkpoint (best model state)\n- Download it\n- Next time, re-upload your checkpoint\n- Resume training for the next 20 epochs\n\nBoom.\nSame result.\nLess GPU pain.\nMore budget-friendly.\nColab doesn’t hate you.\nYou still get your model trained like a boss.\n\nSure, it’s a bit tedious (uploading files, re-initializing architecture, etc.), but it WORKS. Especially when you’re broke and your laptop wheezes every time it hears “TensorFlow.”\n\n## Okay, But What About Deployment?\n\nThat’s still a puzzle I’m trying to solve.\nColab ain’t meant for real-world deployment, so I talked to some of my ML buddies and got a solid tip —\ncreate an API and host it on Hugging Face.\n\nSounds simple on paper, right?\nStill figuring it out in real-time. But hey, the journey's what matters.\n\nIf you're someone who's also cooking models on a budget, definitely try out this checkpoint workaround.\nAnd if you’ve found better ways to deploy models without needing a cloud subscription that costs a kidney, drop your ideas in the comments — I’d genuinely love to learn from y’all.\n\nUntil then, keep building, keep failing, keep checkpointing.\n\nPeace,\nSajid`,
    },
  });

  console.log("✅ Seeded your blog:", colabBlog.slug);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());







