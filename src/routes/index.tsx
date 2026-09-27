import { createFileRoute } from "@tanstack/react-router";
import { AquariumApp } from "@/components/aquarium-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <AquariumApp />;
}
