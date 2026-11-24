import type { Metadata } from "next";
import AdmissionGuide from "@/components/AdmissionGuide";

export const metadata: Metadata = { title: "Admission Guide" };

export default function Page() {
  return <AdmissionGuide />;
}
