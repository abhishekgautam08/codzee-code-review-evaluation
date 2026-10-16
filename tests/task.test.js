const request = require('supertest');
const app = require('../src/app');

describe('Task Endpoints', () => {
  let authToken;

  beforeEach(async () => {
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Smith',
        email: 'bob@example.com',
        password: 'password123'
      });

    authToken = registerRes.body.data.token;
  });

  it('should create a new task when authenticated', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        title: 'Complete evaluation PRs',
        description: 'Build realistic backend API and open PRs',
        priority: 'high'
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('success');
    expect(res.body.data.task.title).toBe('Complete evaluation PRs');
    expect(res.body.data.task.status).toBe('pending');
  });

  it('should reject task creation without auth token', async () => {
    const res = await request(app)
      .post('/api/tasks')
      .send({
        title: 'Unauthorized Task'
      });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe('fail');
  });

  it('should list all tasks', async () => {
    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Task 1' });

    await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Task 2' });

    const res = await request(app)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('success');
    expect(res.body.results).toBe(2);
    expect(res.body.data.tasks.length).toBe(2);
  });

  it('should retrieve a task by ID', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Task to fetch', description: 'Testing get by id' });

    const taskId = created.body.data.task._id;

    const res = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.task.title).toBe('Task to fetch');
  });

  it('should update a task', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Task to update', status: 'pending' });

    const taskId = created.body.data.task._id;

    const res = await request(app)
      .put(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`)
      .send({ status: 'completed' });

    expect(res.status).toBe(200);
    expect(res.body.data.task.status).toBe('completed');
  });

  it('should delete a task', async () => {
    const created = await request(app)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ title: 'Task to delete' });

    const taskId = created.body.data.task._id;

    const deleteRes = await request(app)
      .delete(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(deleteRes.status).toBe(204);

    const getRes = await request(app)
      .get(`/api/tasks/${taskId}`)
      .set('Authorization', `Bearer ${authToken}`);

    expect(getRes.status).toBe(404);
  });

  describe('Task Assignment and Comments', () => {
    let colleagueToken;
    let colleagueId;
    let taskId;

    beforeEach(async () => {
      const colleagueRes = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Charlie Davis',
          email: 'charlie@example.com',
          password: 'password123'
        });
      colleagueToken = colleagueRes.body.data.token;
      colleagueId = colleagueRes.body.data.user.id;

      const taskRes = await request(app)
        .post('/api/tasks')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          title: 'Review pull request bugs',
          description: 'Check for planted defects'
        });
      taskId = taskRes.body.data.task._id;
    });

    it('should assign a task to another team member', async () => {
      const res = await request(app)
        .patch(`/api/tasks/${taskId}/assign`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ assigneeId: colleagueId });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.task.assignee).toBe(colleagueId);
    });

    it('should add a comment to a task', async () => {
      const res = await request(app)
        .post(`/api/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${colleagueToken}`)
        .send({ content: 'I am investigating this issue now.' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.data.comment.content).toBe('I am investigating this issue now.');
    });

    it('should list comments for a task', async () => {
      await request(app)
        .post(`/api/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${colleagueToken}`)
        .send({ content: 'First note' });

      const res = await request(app)
        .get(`/api/tasks/${taskId}/comments`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('success');
      expect(res.body.results).toBe(1);
    });
  });
});
