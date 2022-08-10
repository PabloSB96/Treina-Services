require('dotenv').config();
//require('./config/database').connect();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Sequelize: general import
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
const {API_PORT} = process.env;
const port = process.env.port || API_PORT;

let users = new Map();

app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Sequelize: connect to database
const sequelize = new Sequelize('treinaapi', 'root', 'password12345678', {
    host: 'localhost',
    dialect: 'mysql'
});

// Define models
const User = sequelize.define('User', {
    id: {type: DataTypes.BIGINT, primaryKey: true},
    email: {type: DataTypes.STRING, unique: true, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
    sex: {type: DataTypes.STRING, allowNull: false},
    birthDate: {type: DataTypes.BIGINT, allowNull: false},
    isTrainer: {type: DataTypes.BOOLEAN, allowNull: false, field: 'is_trainer'},
    trainerCode: {type: DataTypes.STRING, allowNull: true, field: 'trainer_code'},
    name: {type: DataTypes.STRING, allowNull: false},
    token: {type: DataTypes.STRING, allowNull: false},
    deviceId: {type: DataTypes.STRING, allowNull: false, field: 'device_id'},
    createdAt: {type: DataTypes.DATE, allowNull: true, field: 'created_at'}
}, {tableName: 'atopa_user', timestamps: false});

let updateToken = async (userToken) => {
    const tokenDecoded = jwt.verify(userToken, process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});
    const token = jwt.sign(
        {email },
        process.env.TOKEN_KEY,
        {expiresIn: '72h' }
    );
    searchUser.token = token;
    await searchUser.save();
    return token;
}

app.post('/register', async (req, res) => {
    // Register the new user here
    const registerBody = req.body;

    const emailUser = registerBody.email;
    const searchUser = await User.findOne({where: { email: registerBody.email }});
    console.log("register - 1");
    if (searchUser != undefined) {
        console.log("register - 1");
        res.status(400).send('El usuario ya existe');
    } else {
        console.log("register - 2");
        if (registerBody.password != undefined && registerBody.password.trim() != '' &&
            registerBody.email != undefined && registerBody.email.trim() != '' && 
            registerBody.repeatPassword != undefined && registerBody.repeatPassword.trim() != '' &&
            registerBody.password.trim() == registerBody.repeatPassword.trim() && 
            registerBody.sex != undefined && registerBody.sex.trim() != '' && 
            registerBody.birthDate != undefined &&
            registerBody.isTrainer != undefined &&
            registerBody.name != undefined && registerBody.name.trim() != '' && 
            registerBody.deviceId != undefined && registerBody.deviceId.trim() != ''
            ) {

                encryptedPassword = await bcrypt.hash(registerBody.password, 10);

                let email = registerBody.email;
                const token = jwt.sign(
                    {email },
                    process.env.TOKEN_KEY,
                    {expiresIn: '72h' }
                );

                var trainerCode = undefined;
                if (registerBody.isTrainer) {
                    // TODO : Improve this code generation to avoid repetitions
                    trainerCode = Date.now().toString(36).toUpperCase();
                }

                //users.set(user.email, user);
                const user = await User.create({
                    email: registerBody.email.toLowerCase(),
                    password: encryptedPassword,
                    sex: registerBody.sex,
                    birthDate: registerBody.birthDate,
                    isTrainer: registerBody.isTrainer,
                    trainerCode: trainerCode,
                    name: registerBody.name,
                    token: token,
                    deviceId: registerBody.deviceId,
                });

                // Return login token
                console.log("register - 4");
                res.status(200).json(user);
        } else {
            console.log("register - 5");
            res.status(400).send("Información no válida");
        }
    }
});

app.post('/login', async (req, res) => {
    const registerBody = req.body;
    const email = registerBody.email;
    const password = registerBody.password;

    const searchUser = await User.findOne({ email: email });
    if (searchUser != undefined) {
        if (await bcrypt.compare(password, searchUser.password)) {
            let result = new Object();
            result.email = email;
            result.token = await updateToken(searchUser.token);
            result.name = searchUser.name;
            result.sex = searchUser.sex;
            result.age = searchUser.age;
            res.status(200).json(result);
        } else {
            let message  = 'PASSWORD_INCORRECT';
            res.status(400).send({'message': message});
        }
    } else {
        res.status(400).send('El usuario no existe');
    }
});


app.listen(port, async () => {
    console.log(`Hello global-controller listening on port ${port}!`);

    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});