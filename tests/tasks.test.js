import request from "supertest";
import app from "../src/app.js";

let token;
let secondToken;
let taskId;

beforeAll(async () => {
  // Register
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Task User",
      email: "task@example.com",
      password: "123456"
    });

  // Login
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "task@example.com",
      password: "123456"
    });

  token = res.body.token;

  // Register second user
  await request(app)
    .post("/api/auth/register")
    .send({
      name: "Other User",
      email: "other@example.com",
      password: "123456"
    });

  // Login second user
  const secondRes = await request(app)
    .post("/api/auth/login")
    .send({
      email: "other@example.com",
      password: "123456"
    });

  secondToken = secondRes.body.token;
});

describe("Task Routes", () => {

  it("should not allow access without token", async () => {
    const res = await request(app)
      .get("/api/tasks");

    expect(res.statusCode).toBe(401);
  });

  it("should create a task", async () => {
    const res = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Task",
        description: "Testing"
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe("Test Task");

    taskId = res.body._id;
  });

  it("should get user tasks only", async () => {
    const res = await request(app)
      .get("/api/tasks")
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it("should not allow deleting a task without token", async () => {
    const ownTask = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Delete Auth Task",
        description: "No token delete check"
      });

    const res = await request(app)
      .delete(`/api/tasks/${ownTask.body._id}`);

    expect(res.statusCode).toBe(401);
  });

  it("should not allow deleting another user's task", async () => {
    const ownerTask = await request(app)
      .post("/api/tasks")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Owner Protected Task",
        description: "Forbidden delete check"
      });

    const res = await request(app)
      .delete(`/api/tasks/${ownerTask.body._id}`)
      .set("Authorization", `Bearer ${secondToken}`);

    expect(res.statusCode).toBe(403);
  });

  it("should allow owner to delete own task", async () => {
    const res = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Task deleted");
  });

});