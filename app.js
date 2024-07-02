const express = require('express');
const mysql = require('mysql2/promise'); 
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const app = express();
app.use(bodyParser.json());
app.use(express.json());

const secretKey = 'mysecretkey';
const ADMIN_API_KEY= '123456SushantAdmin'




const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: 'MySQL',
    database: 'car_rental' 
};


let db;
(async () => { 
    try {
        db = await mysql.createConnection(dbConfig);
        console.log('MySQL connected...');

        await db.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(256),
                email VARCHAR(256),
                password VARCHAR(256)
            )
        `);
        console.log('users table created or already exists.');

        await db.query(`
            CREATE TABLE IF NOT EXISTS admin (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(256),
                email VARCHAR(256),
                password VARCHAR(256)
            )
        `);
        console.log('admin table created or already exists.');

        await db.query(`
            CREATE TABLE IF NOT EXISTS cars (
                id INT AUTO_INCREMENT PRIMARY KEY,
                category VARCHAR(256),
                model VARCHAR(256),
                number_plate VARCHAR(256),
                current_city VARCHAR(256),
                rent_per_hr VARCHAR(256)
            ) 
        `);
        console.log('car table created or already exists.');

        await db.query(`
            CREATE TABLE IF NOT EXISTS rent_history (
                car_id INT,
                origin VARCHAR(256),
                destination VARCHAR(256),
                hours_requirement VARCHAR(256)
                
            ) 
        `);
        console.log('rent_table table created or already exists.');
        
    } catch (err) {
        console.error('Error connecting to MySQL:', err.message);
    }
})();

const apiKeyValidator = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    if (apiKey && apiKey === ADMIN_API_KEY) {
      next(); 
    } else {
      res.status(403).json({ message: 'Forbidden. Invalid API key.' });
    }
  };


const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
  
    if (!token) return res.status(403).send('A token is required for authentication');
  
    jwt.verify(token, secretKey, (err, user) => {
      if (err) return res.status(401).send('Invalid Token');
  
      req.user = user; // Attach user info to request object
      console.log("Authenticated User:", req.user); // Log to check if user is being set correctly
      next();
    });
  };

app.post('/register', async (req, res) => {
    try {
        const { username, email , password } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ error: 'Credentials are required' });
        }

        await db.query('INSERT INTO users (username, email , password) VALUES (?, ?, ?)', [username, email ,password]);
        res.json({ status: 'Account created' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.post('/admin_register', async (req, res) => {
    try {
        const { username, email , password } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ error: 'Credentials are required' });
        }


        await db.query('INSERT INTO admin (username, email , password) VALUES (?, ?, ?)', [username, email ,password]);
        res.json({ status: 'Account created' });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.post('/user_login' , async(req , res)=>{

    try{

        const{username , password} = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Credentials are required' });
        }

        const data = await db.query('SELECT * FROM users WHERE username = ? AND password = ?' , [username , password]);

        if(data){
            const token = jwt.sign({ userId: data.id }, secretKey);
            res.json({ status: 'user login successfully', userId: data.id, token });
        }
        else{
            res.json({message : 'invalid credentials'})
        }

    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'An error occurred' });
    
    }

})

app.post('/admin_login' , async(req , res)=>{

    try{

        const{username , password} = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Credentials are required' });
        }

        const data = await db.query('SELECT * FROM admin WHERE username = ? AND password = ?' , [username , password]);

        if(data){
            const token = jwt.sign({ userId: data.id }, secretKey);
            res.json({ status: 'success', userId: data.id, token });
        }
        else{
            res.json({message : 'invalid credentials'})
        }

    }catch(err){
        console.log(err);
        res.status(500).json({ error: 'An error occurred' });
    
    }

})

app.post('/addCar' , authenticateToken, async(req ,res) => {
    const {category , model , number_plate , current_city , rent_per_hr} = req.body;

    if(!category || !model || !number_plate || !current_city || !rent_per_hr){
        return res.json({message : "please fill all data"})
    }

    await db.query('INSERT INTO cars (category, model , number_plate , current_city  , rent_per_hr) VALUES (?, ?, ?, ?, ?)', 
        [category, model , number_plate , current_city  , rent_per_hr]);

        res.json({ "message": "Car added successfully", "status_code": 200});
        
})

app.get('/api/car/get-rides/:current_city/:destination/:category/:required_hours' 
    , async(req , res)=> {

        try{

            const {current_city , destination , category , required_hours} =  req.params; 
            // console.log(current_city , category);

            const [rows] = await db.query('SELECT * FROM cars WHERE current_city = ? AND category = ?', [current_city , category]);

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Book not found' });
            }

            const amount = rows[0].rent_per_hr * required_hours;
            rows[0].amount = amount;
            res.json(rows[0]);
            
        }catch(err){
            console.log(err);
        }

})

app.post('/api/car/rent' , authenticateToken , async(req ,res) => {

    try{

        const {id , origin , destination , hours_requirement} = req.body;

        if(!id || !origin || !destination || !hours_requirement){
            return res.json({message : "please fill all data"})
        }


        const [rows] = await  db.query('SELECT * FROM  cars WHERE id=? AND current_city=? ', 
            [id , destination]);
    
        if (rows.length === 0) {
            return res.status(404).json({ error: 'car not found' });
        }
    
        const amount = rows[0].rent_per_hr * hours_requirement;
        rows[0].amount = amount;
        res.json(rows[0]);

    }catch(err){
        console.log(err);
    }
})

app.use(apiKeyValidator);

app.post('/api/car/update-rent-history' , authenticateToken , async(req ,res) => {

    try{

        const {car_id , origin , destination , hours_requirement} = req.body;

        if(!car_id || !origin || !destination || !hours_requirement){
            return res.json({message : "please fill all data"})
        }

        await db.query('INSERT INTO rent_history (car_id, origin , destination , hours_requirement) VALUES (?, ?, ?, ?)', 
        [car_id, origin , destination , hours_requirement]);

        res.json({ "message": "rent car added successfully", "status_code": 200});
    
        

    }catch(err){
        console.log(err);
    }
})
    

    
app.listen(3000, () => {
    console.log('Server running on port 3000');
});
