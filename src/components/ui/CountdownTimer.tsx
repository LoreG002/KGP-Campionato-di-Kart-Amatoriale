import { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownTimerProps {
  targetDate: string; // ISO date string
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeLeft(targetDate: string): TimeLeft {
  
  let safeDate = targetDate;
  if (!safeDate.includes('T')) {
    safeDate += 'T00:00:00';
  }

  const diff = new Date(safeDate).getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds };
}

function Digit({ value, label }: { value: number; label: string }) {
  const formatted = String(value).padStart(2, '0');
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <div className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 sm:px-5 sm:py-3 min-w-[52px] sm:min-w-[70px] text-center shadow-inner">
          <span className="font-rajdhani font-bold text-3xl sm:text-5xl text-lime-400 tabular-nums tracking-tight leading-none">
            {formatted}
          </span>
        </div>
        {/* Neon glow */}
        <div className="absolute inset-0 rounded-lg bg-lime-400/5 pointer-events-none" />
      </div>
      <span className="text-zinc-500 text-[10px] sm:text-xs font-rajdhani tracking-[0.2em] uppercase">
        {label}
      </span>
    </div>
  );
}

export function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft(targetDate));
  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;

  useEffect(() => {
    setTimeLeft(getTimeLeft(targetDate));
    const id = setInterval(() => {
      setTimeLeft(getTimeLeft(targetDate));
    }, 1000);
    return () => clearInterval(id);
  }, [targetDate]);

  if (isExpired) {
    return (
      <div className="flex items-center gap-2 text-red-400 font-rajdhani font-bold text-xl tracking-widest">
        <Clock className="w-5 h-5 animate-pulse" />
        GARA IN CORSO
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 sm:gap-4">
      <Digit value={timeLeft.days} label="Giorni" />
      <span className="font-rajdhani font-bold text-3xl sm:text-5xl text-zinc-600 pb-5 select-none">:</span>
      <Digit value={timeLeft.hours} label="Ore" />
      <span className="font-rajdhani font-bold text-3xl sm:text-5xl text-zinc-600 pb-5 select-none">:</span>
      <Digit value={timeLeft.minutes} label="Minuti" />
      <span className="font-rajdhani font-bold text-3xl sm:text-5xl text-zinc-600 pb-5 select-none">:</span>
      <Digit value={timeLeft.seconds} label="Secondi" />
    </div>
  );
}
