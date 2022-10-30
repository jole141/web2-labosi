import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: "web2_fer_labosi",
  password: process.env.DB_PASSWORD,
  port: 5432,
  ssl: true,
});

// GET
export async function getClubs() {
  const results = await pool.query(
    "SELECT * from football_club ORDER BY points DESC, victories DESC, scored_points DESC;"
  );
  return results.rows;
}

export async function getComments(matchId: number) {
  const results = await pool.query(
    "SELECT * from comments WHERE match_id = $1;",
    [matchId]
  );
  return results.rows;
}

export async function getCommentById(id: number) {
  const results = await pool.query(
    "SELECT * from comments WHERE comment_id = $1",
    [id]
  );
  return results.rows[0];
}

export async function getMatches() {
  const results = await pool.query(
    "SELECT match_id, score_point_0, score_point_1, date, fc0.name as team0, fc1.name as team1 from match JOIN football_club as fc0 ON(fc_id_0 = fc0.fc_id) JOIN football_club as fc1 ON(fc_id_1 = fc1.fc_id) WHERE score_point_0 IS NULL;"
  );
  return results.rows;
}

export async function getMatchesResults() {
  const results = await pool.query(
    "SELECT match_id, score_point_0, score_point_1, date, fc0.name as team0, fc1.name as team1 from match JOIN football_club as fc0 ON(fc_id_0 = fc0.fc_id) JOIN football_club as fc1 ON(fc_id_1 = fc1.fc_id) WHERE score_point_0 IS NOT NULL;"
  );
  return results.rows;
}

export async function getMatchById(id: number) {
  const results = await pool.query(
    "SELECT match_id, score_point_0, score_point_1, date, fc0.name as team0, fc1.name as team1 from match JOIN football_club as fc0 ON(fc_id_0 = fc0.fc_id) JOIN football_club as fc1 ON(fc_id_1 = fc1.fc_id) WHERE match_id = $1",
    [id]
  );
  return results.rows[0];
}

export async function getMatchResultById(id: number) {
  const results = await pool.query("SELECT * from match WHERE match_id = $1", [
    id,
  ]);
  return results.rows[0];
}

// POST
export async function postComment(
  comment: string,
  matchId: number,
  email: string
) {
  await pool.query(
    "INSERT INTO comments (comment, match_id, email, datetime) VALUES ($1, $2, $3, $4)",
    [comment, matchId, email, new Date().toLocaleString()]
  );
}

export async function createEmptyMatch(
  fc0Id: number,
  fc1Id: number,
  date: string
) {
  await pool.query(
    "INSERT INTO match (fc_id_0, fc_id_1, score_point_0, score_point_1, date) VALUES ($1, $2, $3, $4, $5)",
    [fc0Id, fc1Id, null, null, date]
  );
}

// PUT
export async function putComment(id: number, comment: string) {
  await pool.query(
    "UPDATE comments SET comment = $1, datetime = $2 WHERE comment_id = $3",
    [comment, new Date().toLocaleString(), id]
  );
}

export async function enterMatchResults(
  id: number,
  fc0Score: number,
  fc1Score: number
) {
  await pool.query(
    "UPDATE match SET score_point_0 = $1, score_point_1 = $2 WHERE match_id = $3",
    [fc0Score, fc1Score, id]
  );
  await putMatchResultsToTable(id);
}

export async function updateMatchResults(
  id: number,
  fc0Score: number,
  fc1Score: number
) {
  await removePreviousMatchResults(id);
  await pool.query(
    "UPDATE match SET score_point_0 = $1, score_point_1 = $2 WHERE match_id = $3",
    [fc0Score, fc1Score, id]
  );
  await putMatchResultsToTable(id);
}

export async function putMatchResultsToTable(id: number) {
  const results = await getMatchResultById(id);
  if (results.score_point_0 > results.score_point_1) {
    await pool.query(
      "UPDATE football_club SET points = points + 3, victories = victories + 1, scored_points = scored_points + $1 WHERE fc_id = $2",
      [results.score_point_0, results.fc_id_0]
    );
    await pool.query(
      "UPDATE football_club SET losses = losses + 1, scored_points = scored_points + $1 WHERE fc_id = $2",
      [results.score_point_1, results.fc_id_1]
    );
  } else if (results.score_point_0 < results.score_point_1) {
    await pool.query(
      "UPDATE football_club SET points = points + 3, victories = victories + 1, scored_points = scored_points + $1 WHERE fc_id = $2",
      [results.score_point_1, results.fc_id_1]
    );
    await pool.query(
      "UPDATE football_club SET losses = losses + 1, scored_points = scored_points + $1 WHERE fc_id = $2",
      [results.score_point_0, results.fc_id_0]
    );
  } else {
    await pool.query(
      "UPDATE football_club SET points = points + 1, tied = tied + 1, scored_points = scored_points + $1 WHERE fc_id = $2",
      [results.score_point_0, results.fc_id_0]
    );
    await pool.query(
      "UPDATE football_club SET points = points + 1, tied = tied + 1, scored_points = scored_points + $1 WHERE fc_id = $2",
      [results.score_point_1, results.fc_id_1]
    );
  }
}

// DELETE
export async function deleteComment(id: number) {
  await pool.query("DELETE FROM comments WHERE comment_id = $1", [id]);
}

export async function removePreviousMatchResults(id: number) {
  const results = await getMatchResultById(id);
  if (results.score_point_0 > results.score_point_1) {
    await pool.query(
      "UPDATE football_club SET points = points - 3, victories = victories - 1, scored_points = scored_points - $1 WHERE fc_id = $2",
      [results.score_point_0, results.fc_id_0]
    );
    await pool.query(
      "UPDATE football_club SET losses = losses - 1, scored_points = scored_points - $1 WHERE fc_id = $2",
      [results.score_point_1, results.fc_id_1]
    );
  } else if (results.score_point_0 < results.score_point_1) {
    await pool.query(
      "UPDATE football_club SET points = points - 3, victories = victories - 1, scored_points = scored_points - $1 WHERE fc_id = $2",
      [results.score_point_1, results.fc_id_1]
    );
    await pool.query(
      "UPDATE football_club SET losses = losses - 1, scored_points = scored_points - $1 WHERE fc_id = $2",
      [results.score_point_0, results.fc_id_0]
    );
  } else {
    await pool.query(
      "UPDATE football_club SET points = points - 1, tied = tied - 1, scored_points = scored_points - $1 WHERE fc_id = $2",
      [results.score_point_0, results.fc_id_0]
    );
    await pool.query(
      "UPDATE football_club SET points = points - 1, tied = tied - 1, scored_points = scored_points - $1 WHERE fc_id = $2",
      [results.score_point_1, results.fc_id_1]
    );
  }
}
