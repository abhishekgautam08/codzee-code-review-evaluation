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

  describe('Pagination, Filtering, Search, and Sorting', () => {
    beforeEach(async () => {
      const sampleTasks = [
        { title: 'Alpha task', description: 'Setup database schema', priority: 'high', status: 'pending' },
        { title: 'Beta task', description: 'Configure redis cache', priority: 'medium', status: 'in-progress' },
        { title: 'Gamma task', description: 'Implement JWT refresh rotation', priority: 'urgent', status: 'completed' },
        { title: 'Delta task', description: 'Review security audit logs', priority: 'low', status: 'pending' },
        { title: 'Epsilon task', description: 'Database performance index tuning', priority: 'urgent', status: 'in-progress' }
      ];

      for (const t of sampleTasks) {
        await request(app)
          .post('/api/tasks')
          .set('Authorization', `Bearer ${authToken}`)
          .send(t);
      }
    });

    it('should paginate tasks with limit and page params', async () => {
      const res = await request(app)
        .get('/api/tasks?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.results).toBe(2);
      expect(res.body.pagination).toBeDefined();
      expect(res.body.pagination.total).toBe(5);
      expect(res.body.pagination.page).toBe(1);
      expect(res.body.pagination.limit).toBe(2);
      expect(res.body.pagination.totalPages).toBe(3);
    });

    it('should filter tasks by status', async () => {
      const res = await request(app)
        .get('/api/tasks?status=pending')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.results).toBe(2);
      res.body.data.tasks.forEach((t) => {
        expect(t.status).toBe('pending');
      });
    });

    it('should filter tasks by priority', async () => {
      const res = await request(app)
        .get('/api/tasks?priority=urgent')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.results).toBe(2);
      res.body.data.tasks.forEach((t) => {
        expect(t.priority).toBe('urgent');
      });
    });

    it('should search tasks by keyword in title and description', async () => {
      const res = await request(app)
        .get('/api/tasks?search=Database')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.results).toBe(2);
    });

    it('should reject invalid query parameters', async () => {
      const res = await request(app)
        .get('/api/tasks?status=invalid_status')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body.status).toBe('fail');
      expect(res.body.message).toContain('Invalid status filter');
    });
  });
});
