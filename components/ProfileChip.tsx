import { Member } from "@/lib/current-member";

// Matches the ProfileChip.dc.html design-canvas reference: rounded-square
// photo with a lime offset shadow (never circular), bold uppercase name,
// muted mono @handle underneath. Falls back to an initial when there's no
// photo yet.
export function ProfileChip({ member, size = "sm" }: { member: Member; size?: "sm" | "md" }) {
  const name = member.displayName || member.email.split("@")[0];
  const initial = name.charAt(0).toUpperCase();
  const dims = size === "md" ? "w-16 h-16 text-2xl" : "w-9 h-9 text-sm";
  const shadow = size === "md" ? "shadow-[6px_6px_0_var(--acid)]" : "shadow-[3px_3px_0_var(--acid)]";

  return (
    <div className="flex items-center gap-3">
      {member.photoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={member.photoUrl}
          alt={name}
          className={`${dims} ${shadow} rounded-[10px] border-[1.5px] border-ink object-cover`}
        />
      ) : (
        <div
          className={`${dims} ${shadow} grid place-items-center rounded-[10px] border-[1.5px] border-ink bg-ink font-extrabold text-paper`}
        >
          {initial}
        </div>
      )}
      <div className="flex flex-col leading-tight">
        <span className={`font-extrabold uppercase ${size === "md" ? "text-lg" : "text-sm"}`}>
          {name}
        </span>
        {member.instagramHandle && (
          <span className="mono-label text-[0.65rem] text-muted">@{member.instagramHandle}</span>
        )}
      </div>
    </div>
  );
}
