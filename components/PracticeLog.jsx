import dynamic from "next/dynamic";

const PracticeLog = dynamic(() => import("../components/PracticeLog"), { ssr: false });

export default function PracticePage() {
  return <PracticeLog />;
}
