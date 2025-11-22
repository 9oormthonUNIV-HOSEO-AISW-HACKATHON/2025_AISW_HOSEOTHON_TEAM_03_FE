import { useProfile } from "../hooks/user";
import { getGenerationKorean } from "../utils/instance";

function Header() {
  const profile = useProfile();
  const generationRole = profile?.generationRole;
  const nickname = profile?.nickname;

  // const ranking = useRanking();
  // console.log(ranking);
  return (
    <header className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">GenOn</h1>
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-[#333333]">
              {nickname} 님
            </span>
            <span className="text-sm text-[#999999]">
              {getGenerationKorean(generationRole)}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
