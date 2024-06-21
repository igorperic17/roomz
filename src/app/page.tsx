// src/app/page.tsx
import Floorplan from "../components/Floorplan";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <h1 className="text-center text-4xl font-bold my-4 text-white">Roomz</h1>
      <Floorplan />
    </div>
  );
}
