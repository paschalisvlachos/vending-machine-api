const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../app');
const User = require('../models/userModel');
const mongoose = require('mongoose');

describe('User Registration', () => {
  before(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI);
  });

  after(async () => {
    // Cleanup: remove the created user
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should successfully register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'password123',
        role: 'buyer',
      });

    expect(res.status).to.equal(201);
    expect(res.body).to.have.property('username', 'testuser');
    expect(res.body).to.have.property('role', 'buyer');
    expect(res.body).to.have.property('token');
  });

  it('should return an error if the username is already taken', async () => {
    // Try registering the same user again
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        password: 'password123',
        role: 'buyer',
      });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'User already exists');
  });
});
