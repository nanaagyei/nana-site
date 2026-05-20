import { Hero } from "@/components/sections/hero";
import { About } from "@/components/sections/about";
import { Work } from "@/components/sections/work";
import { Experience } from "@/components/sections/experience";
import { WritingPreview } from "@/components/sections/writing-preview";
import { Currently } from "@/components/sections/currently";
import { Connect } from "@/components/sections/connect";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Experience />
      <Work />
      <WritingPreview />
      <Currently />
      <Connect />
    </>
  );
}
