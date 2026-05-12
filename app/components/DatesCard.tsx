"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const MS_PER_DAY = 86_400_000;

function ageStats(birth: Date, now = new Date()) {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const dob = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate());

  let years = today.getFullYear() - dob.getFullYear();
  const hadBirthdayThisYear =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());
  if (!hadBirthdayThisYear) years--;

  const daysLived = Math.floor((today.getTime() - dob.getTime()) / MS_PER_DAY);

  const nextBday = new Date(today.getFullYear(), dob.getMonth(), dob.getDate());
  if (nextBday.getTime() < today.getTime()) nextBday.setFullYear(today.getFullYear() + 1);
  const daysToNext = Math.round((nextBday.getTime() - today.getTime()) / MS_PER_DAY);

  return { years, daysLived, daysToNext };
}

export function DatesCard({ birthDate }: { birthDate: Date }) {
  const { years, daysLived, daysToNext } = ageStats(birthDate);
  return (
    <Card className="polaroid -rotate-1">
      <CardHeader>
        <CardTitle className="font-serif text-3xl">A Few Numbers</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          <Stat value={years.toLocaleString()} label="years old" />
          <Stat value={daysLived.toLocaleString()} label="days lived" />
          <Stat
            value={daysToNext === 0 ? "today!" : daysToNext.toLocaleString()}
            label={daysToNext === 0 ? "🎂" : "days to next birthday"}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export function DatesSkeletonCard() {
  return (
    <Card className="polaroid -rotate-1">
      <CardHeader>
        <Skeleton className="h-7 w-32" />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 text-center">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <Skeleton className="h-14 w-20" />
              <Skeleton className="h-3 w-16" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-serif text-6xl text-stone-900">{value}</div>
      <div className="text-xs text-stone-500 mt-1">{label}</div>
    </div>
  );
}
