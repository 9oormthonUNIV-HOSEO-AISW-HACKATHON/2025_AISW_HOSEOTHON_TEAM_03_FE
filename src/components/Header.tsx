interface HeaderProps {
  nickname?: string;
  role?: string;
}

function Header({ nickname, role }: HeaderProps) {
  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">GenOn</h1>
          {(nickname || role) && (
            <div className="flex items-center gap-4">
              {nickname && (
                <span className="text-lg font-bold text-[#333333]">
                  {nickname}
                </span>
              )}
              {role && (
                <span className="text-sm text-[#999999]">{role}</span>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;

