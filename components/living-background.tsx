export function LivingBackground({ mode = 'argus' }: { mode?: 'aura' | 'argus' | 'auth' }) {
  return (
    <div className={`living-bg living-bg-${mode}`} aria-hidden="true">
      <div className="living-orb living-orb-a" />
      <div className="living-orb living-orb-b" />
      <div className="living-binaries" />
      <div className="living-grid" />
    </div>
  );
}
