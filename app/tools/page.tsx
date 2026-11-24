import type { Metadata } from "next";
import AdmissionTools from "@/components/AdmissionTools";

export const metadata: Metadata = { title: "Admission Tools" };

export default function Page() {
  return <AdmissionTools />;
}
