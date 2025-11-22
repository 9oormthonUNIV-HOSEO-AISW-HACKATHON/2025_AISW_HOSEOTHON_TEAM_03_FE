export interface RankingUser {
  rank: number;
  nickname: string;
  role: "시니어" | "MZ";
  score: number;
}

export const RANKING_DATA: RankingUser[] = [
  {
    rank: 1,
    nickname: "김철수",
    role: "시니어",
    score: 450,
  },
  {
    rank: 2,
    nickname: "이영희",
    role: "MZ",
    score: 420,
  },
  {
    rank: 3,
    nickname: "박민수",
    role: "시니어",
    score: 380,
  },
  {
    rank: 4,
    nickname: "최지은",
    role: "MZ",
    score: 350,
  },
  {
    rank: 5,
    nickname: "정수진",
    role: "시니어",
    score: 320,
  },
];

