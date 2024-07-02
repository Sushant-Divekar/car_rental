# car_rental
Hey there, Mr. X. You have been appointed to design an InShorts-like platform, where users can browse through various shorts (news, articles, posts, etc.).


```markdown
# Node.js MVC Application

This is a Node.js application with a Model-View-Controller (MVC) architecture for handling user authentication and news shorts creation.

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/nodejs-mvc-app.git
   ```

2. Install dependencies:
   ```bash
   cd nodejs-mvc-app
   npm install
   ```

3. Set up the MySQL database:
   - Create a database named `car_rental`
   

4. Start the server:
   ```bash
   npm start
   ```

## Routes

- POST /api/register: Create a new user account
- POST /api/login: User login
- POST /api/car/update-rent-history: Create a new rental
- GET /api/car/rent: rent a car
- GET /api/car/get-rides/bangalore/mumbai/SUV/6 : api for rent a car which is available

## Tests (Optional)

To run tests, you can use a testing framework like Jest or Mocha. Here is an example using Jest:

1. Install Jest:
   ```bash
   npm install --save-dev jest
   ```

2. Create test files in the `tests` directory.

3. Run tests:
   ```bash
   npm test
   

   ```


## Assumptions

- The MySQL database is running locally on the default port.
- JWT secret key and API key are hardcoded for simplicity.
- Error handling in controllers is minimal for demonstration purposes.

![image](https://github.com/Sushant-Divekar/car_rental/assets/116884359/de75253c-afbb-4f6e-b28d-3d39a6d73542)
![image](https://github.com/Sushant-Divekar/car_rental/assets/116884359/9cd8b51d-5e99-425c-b745-c8441b36e364)
![image](https://github.com/Sushant-Divekar/car_rental/assets/116884359/f5e88cc5-9785-49e0-8633-e6493cd226db)



