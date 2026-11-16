interface PersonalAvatarProps { nombre: string; apellido?: string; className: string }
export function PersonalAvatar({ nombre, apellido, className }: PersonalAvatarProps) {
  return <div className={className}>{nombre[0]}{(apellido || "")[0] || ""}</div>;
}
