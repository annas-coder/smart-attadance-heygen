interface AudioBarsProps {
  active: boolean;
}

const bars = [
  { h: 7, delay: 0 },
  { h: 15, delay: 0.06 },
  { h: 22, delay: 0.12 },
  { h: 11, delay: 0.18 },
  { h: 18, delay: 0.09 },
];

const AudioBars = ({ active }: AudioBarsProps) => {
  return (
    <div className="flex items-end gap-[3px] h-[22px]">
      {bars.map((b, i) => (
        <span
          key={i}
          className="w-[3px] rounded-full block transition-all duration-300"
          style={{
            height: active ? b.h : 3,
            background: active
              ? `linear-gradient(to top, hsl(var(--primary)), hsl(var(--accent)))`
              : 'hsl(var(--muted-foreground) / 0.25)',
            animation: active ? `audio-bar 0.45s ease-in-out infinite alternate` : 'none',
            animationDelay: active ? `${b.delay}s` : '0s',
            transformOrigin: 'bottom',
          }}
        />
      ))}
    </div>
  );
};

export default AudioBars;
