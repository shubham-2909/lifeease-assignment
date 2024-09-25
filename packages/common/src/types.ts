import z from "zod";
export const backendUrl = "https://lifease.webdevka14.in";
export interface CurrentStats {
  teamStats: {
    battingTeamStats: {
      name: string;
      runs: number;
      wickets: number;
      extras: {
        noBallRuns: number;
        byeRuns: number;
        legByeRuns: number;
        wideRuns: number;
      };
    };
    bowlingTeamStats: {
      name: string;
      runs: number;
      wickets: number;
    };
  };
  playerStats: {
    striker: {
      name: string;
      runsScored: number;
      ballsPlayed: number;
      foursCount: number;
      sixesCount: number;
    };
    nonStriker: {
      name: string;
      runsScored: number;
      ballsPlayed: number;
      foursCount: number;
      sixesCount: number;
    };
    bowler: {
      name: string;
      runsGiven: number;
      wicketsTakem: number;
      oversBowled: string;
    };
  };
  lastSixBalls: string[];
  currOver: string;
}
export const updateStatSchema = z.object({
  runs: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
    z.literal(4),
    z.literal(6),
  ]),
  overthrow: z.boolean(),
  noball: z.boolean(),
  bye: z.boolean(),
  legBye: z.boolean(),
  wide: z.boolean(),
});

export type UpdateStatType = z.infer<typeof updateStatSchema>;
