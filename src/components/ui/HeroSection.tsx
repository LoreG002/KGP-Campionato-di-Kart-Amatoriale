import type { Event, WeatherCondition } from '../../types';
import { CountdownTimer } from './CountdownTimer';
import { MapPin, Ruler, Cloud, Sun, CloudRain, Droplets, Calendar, Image as ImageIcon } from 'lucide-react';

const WeatherIcon = ({ condition }: { condition: WeatherCondition }) => {
  switch (condition) {
    case 'sunny': return <Sun className="w-4 h-4 text-yellow-400" />;
    case 'cloudy': return <Cloud className="w-4 h-4 text-zinc-400" />;
    case 'rain': return <CloudRain className="w-4 h-4 text-blue-400" />;
    case 'wet': return <Droplets className="w-4 h-4 text-cyan-400" />;
    default: return <Sun className="w-4 h-4 text-yellow-400" />;
  }
};

const weatherLabel: Record<WeatherCondition, string> = {
  sunny: 'Sereno',
  cloudy: 'Nuvoloso',
  rain: 'Pioggia',
  wet: 'Pista Bagnata',
};

const weatherBg: Record<WeatherCondition, string> = {
  sunny: 'bg-yellow-400/10 border-yellow-400/30 text-yellow-400',
  cloudy: 'bg-zinc-700/30 border-zinc-600/30 text-zinc-400',
  rain: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
  wet: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400',
};

interface HeroSectionProps {
  nextEvent: Event | null;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('it-IT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function HeroSection({ nextEvent }: HeroSectionProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden bg-zinc-950">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            linear-gradient(rgba(163,230,53,0.15) 1px, transparent 1px),
            linear-gradient(90deg, rgba(163,230,53,0.15) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 via-transparent to-zinc-950 pointer-events-none" />
      <div className="absolute top-0 left-0 w-1/2 h-full bg-gradient-to-r from-zinc-950 to-transparent pointer-events-none" />

      {/* Lime accent line */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-lime-400 via-lime-400/50 to-transparent" />

      <div className="relative z-10 page-container w-full pt-24 pb-20">
        
        {nextEvent ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* TEXT COLUMN (Bottom on Mobile, Left on Desktop) */}
            <div className="flex flex-col order-2 lg:order-1">
              {/* Label */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
                <span className="font-rajdhani font-semibold text-xs tracking-[0.3em] text-lime-400 uppercase">
                  Prossima Gara
                </span>
              </div>

              {/* Event name */}
              <h1 className="font-rajdhani font-bold text-4xl sm:text-6xl lg:text-7xl text-white uppercase leading-none mb-2">
                {nextEvent.name}
              </h1>
              <div className="hero-stripe mb-8" />

              {/* Event metadata */}
              <div className="flex flex-wrap gap-4 mb-10">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Calendar className="w-4 h-4 text-lime-400" />
                  <span className="font-rajdhani text-sm capitalize">{formatDate(nextEvent.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <MapPin className="w-4 h-4 text-lime-400" />
                  <span className="font-rajdhani text-sm">{nextEvent.circuitName}</span>
                </div>
                <div className="flex items-center gap-2 text-zinc-400">
                  <Ruler className="w-4 h-4 text-lime-400" />
                  <span className="font-rajdhani text-sm">{nextEvent.trackLength.toLocaleString('it-IT')} m</span>
                </div>
                <span className={`weather-badge ${weatherBg[nextEvent.weather]}`}>
                  <WeatherIcon condition={nextEvent.weather} />
                  {weatherLabel[nextEvent.weather]}
                </span>
              </div>

              {/* Countdown */}
              <div className="mb-4">
                <p className="font-rajdhani text-xs tracking-[0.25em] text-zinc-500 uppercase mb-4">
                  Conto alla rovescia
                </p>
                <CountdownTimer targetDate={nextEvent.date} />
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-3 mt-10">
                <a href="/classifica" className="btn-primary">
                  Vedi Classifica
                </a>
                <a href="/gare" className="btn-ghost">
                  Storico Gare
                </a>
              </div>
            </div>

            {/* IMAGE COLUMN (Top on Mobile, Right on Desktop) */}
            <div className="order-1 lg:order-2 w-full">
              {nextEvent.imageUrl ? (
                <div className="relative group w-full">
                  {/* Glowing effect behind image */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-lime-400 to-emerald-600 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                  <img
                    src={nextEvent.imageUrl}
                    alt={`Circuito ${nextEvent.circuitName}`}
                    className="relative w-full aspect-video object-cover rounded-2xl border border-zinc-800 shadow-2xl"
                  />
                </div>
              ) : (
                /* Fallback if no image URL is provided */
                <div className="w-full aspect-video rounded-2xl border border-zinc-800/50 bg-zinc-900/50 flex flex-col items-center justify-center text-zinc-600 shadow-xl">
                  <ImageIcon className="w-12 h-12 mb-4 opacity-50" />
                  <span className="font-rajdhani uppercase tracking-widest text-sm">Mappa Circuito non inserita</span>
                </div>
              )}
            </div>

          </div>
        ) : (
          <div className="max-w-2xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              <span className="font-rajdhani font-semibold text-xs tracking-[0.3em] text-lime-400 uppercase">
                Stagione Conclusa
              </span>
            </div>
            <h1 className="font-rajdhani font-bold text-5xl sm:text-7xl text-white uppercase leading-none mb-2">
              K<span className="text-lime-400">-GP</span>
            </h1>
            <div className="hero-stripe mb-8" />
            <p className="text-zinc-400 font-rajdhani text-xl mb-8">
              Nessun appuntamento programmato. Torna presto!
            </p>
            <div className="flex flex-wrap gap-3 mt-10">
              <a href="/classifica" className="btn-primary">
                Classifica Finale
              </a>
            </div>
          </div>
        )}

      </div>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />
    </section>
  );
}