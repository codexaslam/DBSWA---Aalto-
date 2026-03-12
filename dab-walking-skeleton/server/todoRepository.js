import postgres from "postgres";

const sql = postgres();

const create = async (todo) => {
  const result = await sql`INSERT INTO todos (name, done) VALUES (${todo.name}, ${todo.done}) RETURNING *`;
  return result[0];
};

const readAll = async () => {
  return await sql`SELECT * FROM todos`;
};

const remove = async (id) => {
  const result = await sql`DELETE FROM todos WHERE id = ${id} RETURNING *`;
  return result[0];
};

export { create, readAll, remove };
