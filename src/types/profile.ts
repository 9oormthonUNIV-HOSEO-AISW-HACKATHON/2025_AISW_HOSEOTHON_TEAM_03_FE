export interface Profile {
  data: {
    nickname: string;
    generationRole: string;
    points: number;
    grade: string;
  };
}

export interface Ranking {
  responses: {
    nickname: string;
    totalPoints: number;
    grade: string;
    generationRole: string;
  }[];
}
