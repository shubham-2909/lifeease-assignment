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
}
