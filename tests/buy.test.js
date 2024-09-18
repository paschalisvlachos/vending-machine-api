const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../app');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const mongoose = require('mongoose');

describe('Buy Endpoint', () => {
  let token;
  let buyer;
  let product;

  before(async () => {
    // Connect to the test database
    await mongoose.connect(process.env.MONGO_URI);

    // Create a buyer user
    buyer = await User.create({
      username: 'testbuyer2',
      password: 'password123',
      role: 'buyer',
      deposit: 200
    });

    // Create a product
    product = await Product.create({
      productName: 'Soda',
      amountAvailable: 10,
      cost: 100,
      sellerId: new mongoose.Types.ObjectId()
    });

    // Log in the buyer to get a JWT token
    const res = await request(app)  // No need for app.address()
      .post('/api/auth/login')
      .send({ username: 'testbuyer2', password: 'password123' });
    token = res.body.token;
  });

  after(async () => {
    // Cleanup: remove the buyer user and the product
    await User.deleteMany({});
    await Product.deleteMany({});
    await mongoose.connection.close();
  });

  it('should successfully buy a product', async () => {
    const res = await request(app)
      .post('/api/transactions/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, amount: 1 });

    expect(res.status).to.equal(200);
    expect(res.body).to.have.property('totalSpent').equal(100);
    expect(res.body).to.have.property('productsPurchased').to.deep.equal({
      productName: 'Soda',
      amount: 1
    });
    expect(res.body).to.have.property('change').to.deep.equal({ 100: 1, 50: 0, 20: 0, 10: 0, 5: 0 });
  });

  it('should return an error for insufficient deposit', async () => {
    const res = await request(app)
      .post('/api/transactions/buy')
      .set('Authorization', `Bearer ${token}`)
      .send({ productId: product._id, amount: 2 });  // Total cost = 200, but user has no deposit left

    expect(res.status).to.equal(400);
    expect(res.body).to.have.property('message', 'Insufficient deposit');
  });
});
