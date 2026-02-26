interface AudioBarsProps {
  active: boolean;
}

const bars = [
  { h: 6, delay: 0 },
  { h: 14, delay: 0.05 },
  { h: 22, delay: 0.1 },
  { h: 28, delay: 0.15 },
  { h: 18, delay: 0.08 },
  { h: 24, delay: 0.12 },
  { h: 10, delay: 0.03 },
];

const AudioBars = ({ active }: AudioBarsProps) => {
  return (
    <div className="flex items-end gap-[3px] h-[28px]">
      {bars.map((b, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full block transition-all duration-500"
          style={{
            height: active ? b.h : 3,
            background: active
              ? `linear-gradient(to top, hsl(var(--primary)), hsl(var(--secondary)))`
              : 'hsl(var(--muted-foreground) / 0.2)',
            animation: active ? `audio-bar 0.5s cubic-bezier(0.4, 0, 0.2, 1) infinite alternate` : 'none',
            animationDelay: active ? `${b.delay}s` : '0s',
            transformOrigin: 'bottom',
            boxShadow: active ? '0 0 6px hsl(var(--primary) / 0.3)' : 'none',
          }}
        />
      ))}
    </div>
  );
};

export default AudioBars;
