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
  const results = await pool.query("SELECT * from match");
  return results.rows;
}

export async function getMatchResultById(id: number) {
  const results = await pool.query("SELECT * from match WHERE match_id = $1", [
    id,
  ]);
  return results.rows[0];
}

// POST
export async function postComment(comment: string, user: string) {
  await pool.query("INSERT INTO comments (comment, user) VALUES ($1, $2)", [
    comment,
    user,
  ]);
}

export async function postMatch(
  fc0Id: number,
  fc1Id: number,
  fc0Score: number,
  fc1Score: number,
  date: string
) {
  await pool.query(
    "INSERT INTO match (fc_id_0, fc_id_1, score_point_0, score_point_1, date, finished) VALUES ($1, $2, $3, $4, $5, $6)",
    [fc0Id, fc1Id, fc0Score, fc1Score, date, false]
  );
}

// PUT
export async function putComment(id: number, comment: string) {
  await pool.query("UPDATE comments SET comment = $1 WHERE comment_id = $2", [
    comment,
    id,
  ]);
}

export async function putMatch(id: number, fc0Score: number, fc1Score: number) {
  await pool.query(
    "UPDATE match SET score_point_0 = $1, score_point_1 = $2 WHERE match_id = $3",
    [fc0Score, fc1Score, id]
  );
}

export async function putMatchFinished(id: number) {
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

  await pool.query("UPDATE match SET finished = $1 WHERE match_id = $2", [
    true,
    id,
  ]);
}

// DELETE
export async function deleteComment(id: number) {
  await pool.query("DELETE FROM comments WHERE id = $1", [id]);
}
