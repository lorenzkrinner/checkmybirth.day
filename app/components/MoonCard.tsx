"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MoonPhase } from "./MoonPhase";

export function MoonCard({ birthDate }: { birthDate: Date }) {
  return (
    <Card className="polaroid -rotate-1">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">Moon That Night</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center py-2">
        <MoonPhase date={birthDate} size={120} />
      </CardContent>
    </Card>
  );
}
