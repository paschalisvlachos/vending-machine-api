const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../app');
const User = require('../models/userModel');
const mongoose = require('mongoose');

describe('Deposit Endpoint', () => {
  let token;
  let buyer;

  before(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI);

    // Create a buyer user
    buyer = await User.create({ username: 'testbuyer', password: 'password123', role: 'buyer', deposit: 0 });

    // Log in the buyer to get a JWT token
    const res = await request(app)
      .post('/api/auth/login')
      .send({ username: 'testbuyer', password: 'password123' });
    token = res.body.token;
  });

  after(async () => {
    // Cleanup: remove the buyer user
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  it('should successfully deposit valid coins', async () => {
    const res = await request(app)
      .post('/api/transactions/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send({ coins: [5, 10, 50] });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('totalDeposit').equal(65);
  });

  it('should return an error for invalid coin denominations', async () => {
    const res = await request(app)
      .post('/api/transactions/deposit')
      .set('Authorization', `Bearer ${token}`)
      .send({ coins: [5, 12] });

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Invalid coin denomination');
  });
});
