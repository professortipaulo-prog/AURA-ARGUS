export function AvatarOrb({ name, role, variant = 'aura' }: { name: string; role: string; variant?: 'aura' | 'argus' }) {
  const isAura = variant === 'aura';
  return (
    <div className={`avatar-card ${isAura ? 'avatar-aura' : 'avatar-argus'}`}>
      <div className="avatar-orbit">
        <span className="orbit-ring ring-one" />
        <span className="orbit-ring ring-two" />
        <div className="avatar-core">
          <div className="avatar-face">
            <span className="eye left" />
            <span className="eye right" />
            <span className="voice-line" />
          </div>
        </div>
      </div>
      <div className="mt-5 text-center">
        <p className="text-xl font-black tracking-[.22em] text-white">{name}</p>
        <p className="mt-2 text-xs uppercase tracking-[.2em] text-slate-500">{role}</p>
      </div>
    </div>
  );
}
