"use client";

import { Suspense } from "react";
import SuccessPageContent from "../components/SuccessPageContent";

export default function SuccessPage() {
  return (
    <Suspense fallback={<div>Cargando...</div>}>
      <SuccessPageContent />
    </Suspense>
  );
}
