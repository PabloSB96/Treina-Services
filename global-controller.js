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
const Plan = sequelize.define('Plan', {
    id: {type: DataTypes.BIGINT, primaryKey: true},
    code: {type: DataTypes.STRING, unique: true, allowNull: false},
    title: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false},
    costMonth: {type: DataTypes.DOUBLE, allowNull: false, field: 'cost_month'},
    costYear: {type: DataTypes.DOUBLE, allowNull: false, field: 'cost_year'},
}, {tableName: 'treina_plan', timestamps: false});
const User = sequelize.define('User', {
    id: {type: DataTypes.BIGINT, primaryKey: true},
    email: {type: DataTypes.STRING, unique: true, allowNull: false},
    password: {type: DataTypes.STRING, allowNull: false},
    sex: {type: DataTypes.STRING, allowNull: true},
    birthDate: {type: DataTypes.BIGINT, allowNull: true, field: 'birth_date'},
    isTrainer: {type: DataTypes.BOOLEAN, allowNull: false, field: 'is_trainer'},
    trainerCode: {type: DataTypes.STRING, allowNull: true, field: 'trainer_code'},
    name: {type: DataTypes.STRING, allowNull: false},
    goal: {type: DataTypes.STRING, allowNull: true, field: 'current_goal'},
    goalFull: {type: DataTypes.STRING, allowNull: true, field: 'current_goal_full'},
    height: {type: DataTypes.DOUBLE, field: 'current_height_cm'},
    weight: {type: DataTypes.DOUBLE, field: 'current_weight_kg'},
    token: {type: DataTypes.STRING, allowNull: false},
    deviceId: {type: DataTypes.STRING, allowNull: false, field: 'device_id'},
    plan: {type: Plan, field: 'plan_id'},
    createdAt: {type: DataTypes.DATE, allowNull: true, field: 'created_at'}
}, {tableName: 'treina_user', timestamps: false});
const Team = sequelize.define('Team', {
    id: {type: DataTypes.BIGINT, primaryKey: true},
    trainer: {type: User, field: 'trainer_id'},
    trainee: {type: User, field: 'trainee_id'},
}, {tableName: 'treina_team', timestamps: false});
const UserMeasuresHistory = sequelize.define('UserMeasuresHistory', {
    id: {type: DataTypes.BIGINT, primaryKey: true},
    weightKg: {type: DataTypes.DOUBLE, allowNull: false, field: 'weight_kg'},
    chestCm: {type: DataTypes.DOUBLE, allowNull: false, field: 'chest_cm'},
    armCm: {type: DataTypes.DOUBLE, allowNull: false, field: 'arm_cm'},
    waistCm: {type: DataTypes.DOUBLE, allowNull: false, field: 'waist_cm'},
    hipCm: {type: DataTypes.DOUBLE, allowNull: false, field: 'hip_cm'},
    gluteusCm: {type: DataTypes.DOUBLE, allowNull: false, field: 'gluteus_cm'},
    thighCm: {type: DataTypes.DOUBLE, allowNull: false, field: 'thigh_cm'},
    trainee: {type: User, field: 'trainee_id'},
    createdAt: {type: DataTypes.DATE, allowNull: true, field: 'created_at'}
}, {tableName: 'treina_user_measures_history', timestamps: false});
const TrainerExercice = sequelize.define('TrainerExercice', {
    id: {type: DataTypes.BIGINT, primaryKey: true},
    title: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false},
    observations: {type: DataTypes.STRING, allowNull: false},
    repetitions: {type: DataTypes.STRING, allowNull: false, field: 'default_repetitions'},
    rest: {type: DataTypes.STRING, allowNull: false, field: 'default_rest'},
    series: {type: DataTypes.STRING, allowNull: false, field: 'default_series'},
    onMonday: {type: DataTypes.BOOLEAN, field: 'on_monday'},
    onTuesday: {type: DataTypes.BOOLEAN, field: 'on_tuesday'},
    onWednesday: {type: DataTypes.BOOLEAN, field: 'on_wednesday'},
    onThursday: {type: DataTypes.BOOLEAN, field: 'on_thursday'},
    onFriday: {type: DataTypes.BOOLEAN, field: 'on_friday'},
    onSaturday: {type: DataTypes.BOOLEAN, field: 'on_saturday'},
    onSunday: {type: DataTypes.BOOLEAN, field: 'on_sunday'},
    trainer: {type: User, field: 'trainer_id'},
    createdAt: {type: DataTypes.DATE, allowNull: true, field: 'created_at'}
}, {tableName: 'treina_trainer_exercice', timestamps: false});
const FoodType = sequelize.define('FoodType', {
    id: {type: DataTypes.BIGINT, primaryKey: true},
    code: {type: DataTypes.STRING, allowNull: false},
    title: {type: DataTypes.STRING, allowNull: false},
    createdAt: {type: DataTypes.DATE, allowNull: true, field: 'created_at'}
}, {tableName: 'treina_food_type', timestamps: false});
const TrainerFood = sequelize.define('TrainerFood', {
    id: {type: DataTypes.BIGINT, primaryKey: true},
    title: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false},
    amount: {type: DataTypes.STRING, allowNull: false, field: 'default_amount'},
    foodType: {type: FoodType, allowNull: false, field: 'food_type_id'},
    onMonday: {type: DataTypes.BOOLEAN, field: 'on_monday'},
    onTuesday: {type: DataTypes.BOOLEAN, field: 'on_tuesday'},
    onWednesday: {type: DataTypes.BOOLEAN, field: 'on_wednesday'},
    onThursday: {type: DataTypes.BOOLEAN, field: 'on_thursday'},
    onFriday: {type: DataTypes.BOOLEAN, field: 'on_friday'},
    onSaturday: {type: DataTypes.BOOLEAN, field: 'on_saturday'},
    onSunday: {type: DataTypes.BOOLEAN, field: 'on_sunday'},
    trainer: {type: User, field: 'trainer_id'},
    createdAt: {type: DataTypes.DATE, allowNull: true, field: 'created_at'}
}, {tableName: 'treina_trainer_food', timestamps: false});
FoodType.hasMany(TrainerFood, {sourceKey: 'id', foreignKey: 'foodType'});
TrainerFood.belongsTo(FoodType, {foreignKey: 'foodType'});
const TraineeExercice = sequelize.define('TraineeExercice', {
    id: {type: DataTypes.BIGINT, primaryKey: true},
    title: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false},
    observations: {type: DataTypes.STRING, allowNull: false},
    repetitions: {type: DataTypes.STRING, allowNull: false, field: 'default_repetitions'},
    rest: {type: DataTypes.STRING, allowNull: false, field: 'default_rest'},
    series: {type: DataTypes.STRING, allowNull: false, field: 'default_series'},
    onMonday: {type: DataTypes.BOOLEAN, field: 'on_monday'},
    onTuesday: {type: DataTypes.BOOLEAN, field: 'on_tuesday'},
    onWednesday: {type: DataTypes.BOOLEAN, field: 'on_wednesday'},
    onThursday: {type: DataTypes.BOOLEAN, field: 'on_thursday'},
    onFriday: {type: DataTypes.BOOLEAN, field: 'on_friday'},
    onSaturday: {type: DataTypes.BOOLEAN, field: 'on_saturday'},
    onSunday: {type: DataTypes.BOOLEAN, field: 'on_sunday'},
    trainee: {type: User, field: 'trainee_id'},
    createdAt: {type: DataTypes.DATE, allowNull: true, field: 'created_at'}
}, {tableName: 'treina_trainee_exercice', timestamps: false});
const TraineeFood = sequelize.define('TraineeFood', {
    id: {type: DataTypes.BIGINT, primaryKey: true},
    title: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false},
    amount: {type: DataTypes.STRING, allowNull: false, field: 'default_amount'},
    foodType: {type: FoodType, allowNull: false, field: 'food_type_id'},
    onMonday: {type: DataTypes.BOOLEAN, field: 'on_monday'},
    onTuesday: {type: DataTypes.BOOLEAN, field: 'on_tuesday'},
    onWednesday: {type: DataTypes.BOOLEAN, field: 'on_wednesday'},
    onThursday: {type: DataTypes.BOOLEAN, field: 'on_thursday'},
    onFriday: {type: DataTypes.BOOLEAN, field: 'on_friday'},
    onSaturday: {type: DataTypes.BOOLEAN, field: 'on_saturday'},
    onSunday: {type: DataTypes.BOOLEAN, field: 'on_sunday'},
    trainee: {type: User, field: 'trainee_id'},
    createdAt: {type: DataTypes.DATE, allowNull: true, field: 'created_at'}
}, {tableName: 'treina_trainee_food', timestamps: false});
FoodType.hasMany(TraineeFood, {sourceKey: 'id', foreignKey: 'foodType'});
TraineeFood.belongsTo(FoodType, {foreignKey: 'foodType'});
const ShoppingElementTrainerFood = sequelize.define('ShoppingElementTrainerFood', {
    id: {type: DataTypes.BIGINT, primaryKey: true},
    title: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false},
    trainerFood: {type: TrainerFood, field: 'trainer_food_id'},
    createdAt: {type: DataTypes.DATE, allowNull: true, field: 'created_at'}
}, {tableName: 'treina_shopping_element_trainer_food', timestamps: false});
TrainerFood.hasMany(ShoppingElementTrainerFood, {sourceKey: 'id', foreignKey: 'trainerFood'});
ShoppingElementTrainerFood.belongsTo(TrainerFood, {foreignKey: 'trainerFood'});

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
    const searchUser = await User.findOne({where: { email: registerBody.email }});
    console.log("register - 1");
    if (searchUser != undefined) {
        console.log("register - 1");
        res.status(400).send('El usuario ya existe');
    } else {
        console.log("register - 2");
        if ((registerBody.password != undefined && registerBody.password.trim() != '' &&
            registerBody.email != undefined && registerBody.email.trim() != '' && 
            registerBody.repeatPassword != undefined && registerBody.repeatPassword.trim() != '' &&
            registerBody.password.trim() == registerBody.repeatPassword.trim() && 
            registerBody.name != undefined && registerBody.name.trim() != '' && 
            registerBody.isTrainer != undefined && 
            registerBody.deviceId != undefined && registerBody.deviceId.trim() != '' ) && (
                (
                    !registerBody.isTrainer && 
                    registerBody.height != undefined &&
                    registerBody.weight != undefined && 
                    registerBody.goal != undefined && registerBody.goal.trim() != '' && 
                    registerBody.goalFull != undefined && registerBody.goalFull.trim() != '' &&
                    registerBody.sex != undefined && registerBody.sex.trim() != '' && 
                    registerBody.birthDate != undefined
                ) || registerBody.isTrainer
            )) {

                let trainer = undefined;
                if (!registerBody.isTrainer && registerBody.trainerCode != undefined) {
                    // It is a trainee, first check if trainer exists, then match it with his trainer
                    trainer = await User.findOne({where: { trainerCode: registerBody.trainerCode }});
                    if (trainer == null || trainer == undefined) {
                        res.status(400).send("TRAINER_CODE_NOT_EXISTS");
                        return;
                    }
                }

                encryptedPassword = await bcrypt.hash(registerBody.password, 10);

                let email = registerBody.email;
                const token = jwt.sign(
                    {email, isTrainer: registerBody.isTrainer},
                    process.env.TOKEN_KEY,
                    {expiresIn: '72h' }
                );

                var trainerCode = undefined;
                if (registerBody.isTrainer) {
                    // TODO : Improve this code generation to avoid repetitions
                    trainerCode = Date.now().toString(36).toUpperCase();
                }

                //users.set(user.email, user);
                let user = await User.create({
                    email: registerBody.email.toLowerCase(),
                    password: encryptedPassword,
                    sex: registerBody.sex,
                    birthDate: registerBody.birthDate,
                    isTrainer: registerBody.isTrainer,
                    trainerCode: trainerCode,
                    name: registerBody.name,
                    token: token,
                    deviceId: registerBody.deviceId,
                    goal: registerBody.goal,
                    goalFull: registerBody.goalFull,
                    height: registerBody.height,
                    weight: registerBody.weight
                });

                user = await User.findOne({where: { email: registerBody.email }});

                if (trainer != null && trainer != undefined) {
                    // It is a trainee so match it with his trainer
                    await Team.create({
                        trainer: trainer.id,
                        trainee: user.id
                    });
                }

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

    const searchUser = await User.findOne({ where: {email: email }});

    console.log("\n\n\nlogin - 1");
    console.log(searchUser);
    console.log("login - 2");
    console.log(email);
    console.log("login - 3");
    console.log(registerBody.isTrainer);
    console.log("login - 4");
    console.log(searchUser.isTrainer);
    console.log("login - 5\n\n\n");

    if (searchUser != undefined && searchUser.isTrainer == registerBody.isTrainer) {
        if (await bcrypt.compare(password, searchUser.password)) {
            let result = new Object();
            result.email = email;
            result.token = await updateToken(searchUser.token);
            result.name = searchUser.name;
            res.status(200).json(result);
        } else {
            let message  = 'PASSWORD_INCORRECT';
            res.status(400).send({'message': message});
        }
    } else {
        res.status(400).send({'message': 'USER_NOT_EXISTS'});
    }
});

app.post('/trainer/trainees', async (req, res) => {
    let userToken = req.headers.token;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});
    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        let result = [];
        let trainees = await Team.findAll({where: {trainer: searchUser.id}});
        if (trainees == null || trainees == undefined) {
            trainees = [];
        }
        for (let i = 0; i < trainees.length; i++) {
            let t = await User.findOne({where: {id: trainees[i].getDataValue('trainee')}});
            if (t != null && t != undefined) {
                let history = await UserMeasuresHistory.findAll({limit: 1, order: [['createdAt', 'DESC']]});
                if (history != undefined && history.length == 1) {
                    t.lastMeasuresUpdate = history[0].getDataValue('createdAt');
                }
                result.push(t);
            }
        }
        res.status(200).json(result);
        return;
    }
});
app.post('/trainer/trainees/delete', async (req, res) => {
    let userToken = req.headers.token;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});

    const reqBody = req.body;

    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        if (reqBody.id != undefined) {
            let trainee = await User.findOne({where: {id: reqBody.id}});

            if (trainee == undefined) {
                res.status(400).send('BAD_INFORMATION');
                return ;
            } else {
                await TraineeExercice.destroy({where: {trainee: reqBody.id}});
                await TraineeFood.destroy({where: {trainee: reqBody.id}});
                await Team.destroy({where: {trainer: searchUser.id, trainee: reqBody.id}})

                res.status(200).json("DELETED");
                return ;
            }
        } else {
            res.status(400).send('BAD_INFORMATION');
            return;
        }
    }
});
app.post('/trainer/trainees/:traineeId/profile', async (req, res) => {
    let userToken = req.headers.token;
    let traineeId = req.params.traineeId;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});
    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        let trainee = await User.findOne({where: {id: traineeId}, attributes: {exclude: ['password']}});
        res.status(200).json(trainee);
        return;
    }
});
app.post('/trainer/trainees/:traineeId/history', async (req, res) => {
    let userToken = req.headers.token;
    let traineeId = req.params.traineeId;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});
    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        let historicalData = await UserMeasuresHistory.findAll({where: {trainee: traineeId}});
        console.log("\n\n\ntrainees - history - 1");
        console.log(historicalData);
        console.log("trainees - history - 2\n\n\n");
        res.status(200).json(historicalData);
        return;
    }
});
app.post('/trainer/trainees/:traineeId/food', async (req, res) => {
    let userToken = req.headers.token;
    let traineeId = req.params.traineeId;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});
    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        let food = await TraineeFood.findAll({where: {trainee: traineeId}, include: FoodType});
        console.log("trainees - food - 1");
        console.log(food);
        console.log("trainees - food - 2");
        res.status(200).json(food);
        return;
    }
});
app.post('/trainer/trainees/:traineeId/food/new', async (req, res) => {
    let userToken = req.headers.token;
    let traineeId = req.params.traineeId;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});

    const reqBody = req.body;

    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        if (reqBody.title != undefined && reqBody.title.trim() != '' &&
            reqBody.description != undefined && reqBody.description.trim() != '' && 
            reqBody.onMonday != undefined && 
            reqBody.onTuesday != undefined && 
            reqBody.onWednesday != undefined && 
            reqBody.onThursday != undefined && 
            reqBody.onFriday != undefined && 
            reqBody.onSaturday != undefined && 
            reqBody.onSunday != undefined && 
            reqBody.foodType != undefined && reqBody.foodType.trim() != '' && 
            reqBody.amount != undefined && reqBody.amount.trim() != '') {

            const foodType = await FoodType.findOne({where: {code: reqBody.foodType }});
            const trainee = await User.findOne({where: {id: traineeId}});

            if (foodType != undefined && trainee != undefined) {
                const food = await TraineeFood.create({
                    title: reqBody.title,
                    description: reqBody.description,
                    amount: reqBody.amount,
                    foodType: foodType.id,
                    onMonday: reqBody.onMonday,
                    onTuesday: reqBody.onTuesday,
                    onWednesday: reqBody.onWednesday,
                    onThursday: reqBody.onThursday,
                    onFriday: reqBody.onFriday,
                    onSaturday: reqBody.onSaturday,
                    onSunday: reqBody.onSunday,
                    trainee: traineeId
                });

                res.status(200).json(food);
                return;
            } else {
                res.status(400).send('BAD_INFORMATION');
                return ;
            }
        } else {
            res.status(400).send('BAD_INFORMATION');
            return ;
        }
    }
});
app.post('/trainer/trainees/:traineeId/food/edit', async (req, res) => {
    let userToken = req.headers.token;
    let traineeId = req.params.traineeId;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});

    const reqBody = req.body;

    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        if (reqBody.id != undefined &&
            reqBody.title != undefined && reqBody.title.trim() != '' &&
            reqBody.description != undefined && reqBody.description.trim() != '' && 
            reqBody.onMonday != undefined && 
            reqBody.onTuesday != undefined && 
            reqBody.onWednesday != undefined && 
            reqBody.onThursday != undefined && 
            reqBody.onFriday != undefined && 
            reqBody.onSaturday != undefined && 
            reqBody.onSunday != undefined && 
            reqBody.foodType != undefined && reqBody.foodType.trim() != '' && 
            reqBody.amount != undefined && reqBody.amount.trim() != '') {

            const foodType = await FoodType.findOne({where: {code: reqBody.foodType }});
            const trainee = await User.findOne({where: {id: traineeId}});

            if (foodType != undefined && trainee != undefined) {

                let food = await TraineeFood.findOne({where: { id: reqBody.id }});

                if (food != undefined) {
                    food.title = reqBody.title;
                    food.description = reqBody.description;
                    food.amount = reqBody.amount;
                    food.foodType = foodType.id;
                    food.onMonday = reqBody.onMonday;
                    food.onTuesday = reqBody.onTuesday;
                    food.onWednesday = reqBody.onWednesday;
                    food.onThursday = reqBody.onThursday;
                    food.onFriday = reqBody.onFriday;
                    food.onSaturday = reqBody.onSaturday;
                    food.onSunday = reqBody.onSunday;

                    await food.save();

                    res.status(200).json(food);
                    return;
                } else {
                    res.status(400).send('BAD_INFORMATION');
                    return ;
                }
            } else {
                res.status(400).send('BAD_INFORMATION');
                return ;
            }
        } else {
            res.status(400).send('BAD_INFORMATION');
            return ;
        }
    }
});
app.post('/trainer/trainees/:traineeId/food/delete', async (req, res) => {
    let userToken = req.headers.token;
    let traineeId = req.params.traineeId;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});

    const reqBody = req.body;

    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        if (reqBody.id != undefined) {

            let food = await TraineeFood.findOne({where: { id: reqBody.id }});

            const trainee = await User.findOne({where: {id: traineeId}});

            if (food == undefined || trainee == undefined) {
                res.status(400).send('BAD_INFORMATION');
                return ;
            } else {
                await food.destroy();

                res.status(200).json("DELETED");
                return ;
            }
        } else {
            res.status(400).send('BAD_INFORMATION');
            return;
        }
    }
});
app.post('/trainer/trainees/:traineeId/exercices', async (req, res) => {
    let userToken = req.headers.token;
    let traineeId = req.params.traineeId;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});
    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        let exercices = await TraineeExercice.findAll({where: {trainee: traineeId}});
        res.status(200).json(exercices);
        return;
    }
});
app.post('/trainer/trainees/:traineeId/exercices/new', async (req, res) => {
    let userToken = req.headers.token;
    let traineeId = req.params.traineeId;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});

    const reqBody = req.body;

    console.log("trainer - trainees - exercices - new - 1");
    console.log(reqBody);
    console.log("trainer - trainees - exercices - new - 2");
    console.log(traineeId);
    console.log("trainer - trainees - exercices - new - 3");

    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        if (reqBody.title != undefined && reqBody.title.trim() != '' &&
            reqBody.description != undefined && reqBody.description.trim() != '' && 
            reqBody.observations != undefined && reqBody.observations.trim() != '' && 
            reqBody.onMonday != undefined && 
            reqBody.onTuesday != undefined && 
            reqBody.onWednesday != undefined && 
            reqBody.onThursday != undefined && 
            reqBody.onFriday != undefined && 
            reqBody.onSaturday != undefined && 
            reqBody.onSunday != undefined && 
            reqBody.repetitions != undefined && reqBody.repetitions.trim() != '' &&
            reqBody.rest != undefined && reqBody.rest.trim() != '' &&
            reqBody.series != undefined && reqBody.series.trim() != '') {

            const trainee = await User.findOne({where: {id: traineeId}});

            if (trainee == undefined) {
                res.status(400).send('BAD_INFORMATION');
                return ;
            } else {
                const exercice = await TraineeExercice.create({
                    title: reqBody.title,
                    description: reqBody.description,
                    observations: reqBody.observations,
                    repetitions: reqBody.repetitions,
                    rest: reqBody.rest,
                    series: reqBody.series,
                    onMonday: reqBody.onMonday,
                    onTuesday: reqBody.onTuesday,
                    onWednesday: reqBody.onWednesday,
                    onThursday: reqBody.onThursday,
                    onFriday: reqBody.onFriday,
                    onSaturday: reqBody.onSaturday,
                    onSunday: reqBody.onSunday,
                    trainee: traineeId
                });
    
                res.status(200).json(exercice);
                return;
            }
        } else {
            res.status(400).send('BAD_INFORMATION');
            return ;
        }
    }
});
app.post('/trainer/trainees/:traineeId/exercices/edit', async (req, res) => {
    let userToken = req.headers.token;
    let traineeId = req.params.traineeId;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});

    const reqBody = req.body;

    console.log("trainer - trainees - exercices - edit - 1");
    console.log(reqBody);
    console.log("trainer - trainees - exercices - edit - 2");

    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        if (reqBody.id != undefined && 
            reqBody.title != undefined && reqBody.title.trim() != '' &&
            reqBody.description != undefined && reqBody.description.trim() != '' && 
            reqBody.observations != undefined && reqBody.observations.trim() != '' && 
            reqBody.onMonday != undefined && 
            reqBody.onTuesday != undefined && 
            reqBody.onWednesday != undefined && 
            reqBody.onThursday != undefined && 
            reqBody.onFriday != undefined && 
            reqBody.onSaturday != undefined && 
            reqBody.onSunday != undefined && 
            reqBody.repetitions != undefined && reqBody.repetitions.trim() != '' &&
            reqBody.rest != undefined && reqBody.rest.trim() != '' &&
            reqBody.series != undefined && reqBody.series.trim() != '') {

            let exercice = await TraineeExercice.findOne({where: { id: reqBody.id }});

            const trainee = await User.findOne({where: {id: traineeId}});

            if (exercice == undefined || trainee == undefined) {
                res.status(400).send('BAD_INFORMATION');
                return ;
            } else {
                exercice.title = reqBody.title;
                exercice.description = reqBody.description;
                exercice.observations = reqBody.observations;
                exercice.repetitions = reqBody.repetitions;
                exercice.rest = reqBody.rest;
                exercice.series = reqBody.series;
                exercice.onMonday = reqBody.onMonday;
                exercice.onTuesday = reqBody.onTuesday;
                exercice.onWednesday = reqBody.onWednesday;
                exercice.onThursday = reqBody.onThursday;
                exercice.onFriday = reqBody.onFriday;
                exercice.onSaturday = reqBody.onSaturday;
                exercice.onSunday = reqBody.onSunday;

                await exercice.save();

                res.status(200).json(exercice);
                return;
            }
        } else {
            res.status(400).send('BAD_INFORMATION');
            return ;
        }
    }
});
app.post('/trainer/trainees/:traineeId/exercices/delete', async (req, res) => {
    let userToken = req.headers.token;
    let traineeId = req.params.traineeId;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});

    const reqBody = req.body;

    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        if (reqBody.id != undefined) {

            let exercice = await TraineeExercice.findOne({where: { id: reqBody.id }});

            const trainee = await User.findOne({where: {id: traineeId}});

            if (exercice == undefined || trainee == undefined) {
                res.status(400).send('BAD_INFORMATION');
                return ;
            } else {
                await exercice.destroy();

                res.status(200).json("DELETED");
                return ;
            }
        } else {
            res.status(400).send('BAD_INFORMATION');
            return;
        }
    }
});
app.post('/trainer/data/food', async (req, res) => {
    let userToken = req.headers.token;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});
    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        let food = await TrainerFood.findAll({where: {trainer: searchUser.id}, include: FoodType});
        console.log("data - food - 1");
        console.log(food);
        console.log("data - food - 2");
        res.status(200).json(food);
        return;
    }
});
app.post('/trainer/data/exercices', async (req, res) => {
    let userToken = req.headers.token;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});
    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        let exercices = await TrainerExercice.findAll({where: {trainer: searchUser.id}});
        res.status(200).json(exercices);
        return;
    }
});
app.post('/trainer/data/food/new', async (req, res) => {
    let userToken = req.headers.token;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});

    const reqBody = req.body;

    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        if (reqBody.title != undefined && reqBody.title.trim() != '' &&
            reqBody.description != undefined && reqBody.description.trim() != '' && 
            reqBody.onMonday != undefined && 
            reqBody.onTuesday != undefined && 
            reqBody.onWednesday != undefined && 
            reqBody.onThursday != undefined && 
            reqBody.onFriday != undefined && 
            reqBody.onSaturday != undefined && 
            reqBody.onSunday != undefined && 
            reqBody.foodType != undefined && reqBody.foodType.trim() != '' && 
            reqBody.amount != undefined && reqBody.amount.trim() != '') {

            const foodType = await FoodType.findOne({where: {code: reqBody.foodType }});

            if (foodType != undefined) {
                const food = await TrainerFood.create({
                    title: reqBody.title,
                    description: reqBody.description,
                    amount: reqBody.amount,
                    foodType: foodType.id,
                    onMonday: reqBody.onMonday,
                    onTuesday: reqBody.onTuesday,
                    onWednesday: reqBody.onWednesday,
                    onThursday: reqBody.onThursday,
                    onFriday: reqBody.onFriday,
                    onSaturday: reqBody.onSaturday,
                    onSunday: reqBody.onSunday,
                    trainer: searchUser.id
                });

                console.log("\n\n\n food - 1");
                console.log(food);
                console.log("food - 2\n\n\n");

                shopList = [];
                if (reqBody.shoppingList != undefined && reqBody.shoppingList.length > 0) {
                    for (let i = 0; i < reqBody.shoppingList.length; i++) {
                        const elem = await ShoppingElementTrainerFood.create({
                            title: reqBody.shoppingList[i].title,
                            description: reqBody.shoppingList[i].description,
                            trainerFood: food.id
                        });
                        shopList.push(elem);
                    }
                }
                //food.shoppingList = shopList;

                res.status(200).json(food);
                return;
            } else {
                res.status(400).send('BAD_INFORMATION');
                return ;
            }
        } else {
            res.status(400).send('BAD_INFORMATION');
            return ;
        }
    }
});
app.post('/trainer/data/food/edit', async (req, res) => {
    let userToken = req.headers.token;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});

    const reqBody = req.body;

    console.log("\n\ndata - food - edit - 0.1\n\n");
    console.log(reqBody);
    console.log("\n\ndata - food - edit - 0.2\n\n");

    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        if (reqBody.id != undefined &&
            reqBody.title != undefined && reqBody.title.trim() != '' &&
            reqBody.description != undefined && reqBody.description.trim() != '' && 
            reqBody.onMonday != undefined && 
            reqBody.onTuesday != undefined && 
            reqBody.onWednesday != undefined && 
            reqBody.onThursday != undefined && 
            reqBody.onFriday != undefined && 
            reqBody.onSaturday != undefined && 
            reqBody.onSunday != undefined && 
            reqBody.foodType != undefined && reqBody.foodType.trim() != '' && 
            reqBody.amount != undefined && reqBody.amount.trim() != '') {

            const foodType = await FoodType.findOne({where: {code: reqBody.foodType }});

            if (foodType != undefined) {

                let food = await TrainerFood.findOne({where: { id: reqBody.id }});

                if (food != undefined) {
                    food.title = reqBody.title;
                    food.description = reqBody.description;
                    food.amount = reqBody.amount;
                    food.foodType = foodType.id;
                    food.onMonday = reqBody.onMonday;
                    food.onTuesday = reqBody.onTuesday;
                    food.onWednesday = reqBody.onWednesday;
                    food.onThursday = reqBody.onThursday;
                    food.onFriday = reqBody.onFriday;
                    food.onSaturday = reqBody.onSaturday;
                    food.onSunday = reqBody.onSunday;

                    food = await food.save();

                    shopList = [];
                    if (reqBody.shoppingList != undefined && reqBody.shoppingList.length > 0) {
                        for (let i = 0; i < reqBody.shoppingList.length; i++) {
                            let elem = await ShoppingElementTrainerFood.findOne({where: {id: reqBody.shoppingList[i].id}});
                            if (elem != undefined) {
                                if (reqBody.shoppingList[i].delete) {
                                    await elem.destroy();
                                } else {
                                    elem.title = reqBody.shoppingList[i].title;
                                    elem.description = reqBody.shoppingList[i].description;
                                    await elem.save();
                                    shopList.push(elem);
                                }
                            } else {
                                const elem = await ShoppingElementTrainerFood.create({
                                    title: reqBody.shoppingList[i].title,
                                    description: reqBody.shoppingList[i].description,
                                    trainerFood: food.id
                                });
                                shopList.push(elem);
                            }
                        }
                    }
                    food.shoppingList = shopList;

                    res.status(200).json(food);
                    return;
                } else {
                    res.status(400).send('BAD_INFORMATION');
                    return ;
                }
            } else {
                res.status(400).send('BAD_INFORMATION');
                return ;
            }
        } else {
            res.status(400).send('BAD_INFORMATION');
            return ;
        }
    }
});
app.post('/trainer/data/exercices/new', async (req, res) => {
    let userToken = req.headers.token;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});

    const reqBody = req.body;

    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        if (reqBody.title != undefined && reqBody.title.trim() != '' &&
            reqBody.description != undefined && reqBody.description.trim() != '' && 
            reqBody.observations != undefined && reqBody.observations.trim() != '' && 
            reqBody.onMonday != undefined && 
            reqBody.onTuesday != undefined && 
            reqBody.onWednesday != undefined && 
            reqBody.onThursday != undefined && 
            reqBody.onFriday != undefined && 
            reqBody.onSaturday != undefined && 
            reqBody.onSunday != undefined && 
            reqBody.repetitions != undefined && reqBody.repetitions.trim() != '' &&
            reqBody.rest != undefined && reqBody.rest.trim() != '' &&
            reqBody.series != undefined && reqBody.series.trim() != '') {

            const exercice = await TrainerExercice.create({
                title: reqBody.title,
                description: reqBody.description,
                observations: reqBody.observations,
                repetitions: reqBody.repetitions,
                rest: reqBody.rest,
                series: reqBody.series,
                onMonday: reqBody.onMonday,
                onTuesday: reqBody.onTuesday,
                onWednesday: reqBody.onWednesday,
                onThursday: reqBody.onThursday,
                onFriday: reqBody.onFriday,
                onSaturday: reqBody.onSaturday,
                onSunday: reqBody.onSunday,
                trainer: searchUser.id
            });

            res.status(200).json(exercice);
            return;
        } else {
            res.status(400).send('BAD_INFORMATION');
            return ;
        }
    }
});
app.post('/trainer/data/exercices/edit', async (req, res) => {
    let userToken = req.headers.token;
    console.log("data - exercices - edit - 1");
    console.log(userToken);
    console.log("data - exercices - edit - 2");
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});

    const reqBody = req.body;

    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        if (reqBody.id != undefined && 
            reqBody.title != undefined && reqBody.title.trim() != '' &&
            reqBody.description != undefined && reqBody.description.trim() != '' && 
            reqBody.observations != undefined && reqBody.observations.trim() != '' && 
            reqBody.onMonday != undefined && 
            reqBody.onTuesday != undefined && 
            reqBody.onWednesday != undefined && 
            reqBody.onThursday != undefined && 
            reqBody.onFriday != undefined && 
            reqBody.onSaturday != undefined && 
            reqBody.onSunday != undefined && 
            reqBody.repetitions != undefined && reqBody.repetitions.trim() != '' &&
            reqBody.rest != undefined && reqBody.rest.trim() != '' &&
            reqBody.series != undefined && reqBody.series.trim() != '') {

            let exercice = await TrainerExercice.findOne({where: { id: reqBody.id }});

            if (exercice == undefined) {
                res.status(400).send('BAD_INFORMATION');
                return ;
            } else {
                exercice.title = reqBody.title;
                exercice.description = reqBody.description;
                exercice.observations = reqBody.observations;
                exercice.repetitions = reqBody.repetitions;
                exercice.rest = reqBody.rest;
                exercice.series = reqBody.series;
                exercice.onMonday = reqBody.onMonday;
                exercice.onTuesday = reqBody.onTuesday;
                exercice.onWednesday = reqBody.onWednesday;
                exercice.onThursday = reqBody.onThursday;
                exercice.onFriday = reqBody.onFriday;
                exercice.onSaturday = reqBody.onSaturday;
                exercice.onSunday = reqBody.onSunday;

                await exercice.save();

                res.status(200).json(exercice);
                return;
            }
        } else {
            res.status(400).send('BAD_INFORMATION');
            return ;
        }
    }
});
app.post('/trainer/profile', async (req, res) => {
    let userToken = req.headers.token;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});
    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        let trainees = await Team.findAll({where: {trainer: searchUser.id}});
        if (trainees == null || trainees == undefined) {
            trainees = [];
        }
        let plan = undefined;
        if (searchUser.plan != null && searchUser.plan != undefined) {
            plan = await Plan.findOne({where: {id: searchUser.plan}});
        }
        let myProfile = {
            id: searchUser.id,
            email: searchUser.email,
            name: searchUser.name,
            trainerCode: searchUser.trainerCode,
            traineeNumber: trainees.length,
            plan: plan
        };
        res.status(200).json(myProfile);
        return;
    }
});

app.post('/trainee/exercices', async (req, res) => {
    let userToken = req.headers.token;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});
    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        let exercices = await TraineeExercice.findAll({where: {trainee: searchUser.id}});
        res.status(200).json(exercices);
        return;
    }
});
app.post('/trainee/food', async (req, res) => {
    let userToken = req.headers.token;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});
    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        let food = await TraineeFood.findAll({where: {trainee: searchUser.id}});
        res.status(200).json(food);
        return;
    }
});
app.post('/trainee/history', async (req, res) => {
    let userToken = req.headers.token;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});
    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        let historicalData = await UserMeasuresHistory.findAll({where: {trainee: searchUser.id}, order: [['createdAt', 'DESC']]});
        res.status(200).json(historicalData);
        return;
    }
});
app.post('/trainee/history/new', async (req, res) => {
    let userToken = req.headers.token;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});
    const reqBody = req.body;
    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        if (reqBody.weight != undefined && 
            reqBody.chest != undefined && 
            reqBody.arm != undefined && 
            reqBody.waist != undefined && 
            reqBody.hip != undefined && 
            reqBody.gluteus != undefined && 
            reqBody.thigh != undefined) {
            let historicalData = await UserMeasuresHistory.create({
                weightKg: reqBody.weight,
                chestCm: reqBody.chest,
                armCm: reqBody.arm,
                waistCm: reqBody.waist,
                hipCm: reqBody.hip,
                gluteusCm: reqBody.gluteus,
                thighCm: reqBody.thigh,
                trainee: searchUser.id
            });
            res.status(200).json(historicalData);
            return;
        } else {
            res.status(400).send('BAD_INFORMATION');
            return;
        }
    }
});
app.post('/trainee/profile', async (req, res) => {
    let userToken = req.headers.token;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});
    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        let profile = await User.findOne({where: {id: searchUser.id}, attributes: {exclude: ['password']}});
        console.log("\n\n trainee - profile - 1");
        console.log(profile);
        console.log("trainee - profile - 2");
        res.status(200).json(profile);
        return;
    }
});
app.post('/trainee/profile/edit', async (req, res) => {
    let userToken = req.headers.token;
    const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
    const email = tokenDecoded.email;
    const searchUser = await User.findOne({where: {email: email }});
    const reqBody = req.body;
    if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
        res.status(400).send('TOKEN_NOT_VALID');
        return;
    } else {
        if (reqBody.name != undefined && reqBody.name.trim() != '' && 
            reqBody.sex != undefined && reqBody.sex.trim() != '' && 
            reqBody.goal != undefined && reqBody.goal.trim() != '' && 
            reqBody.goalFull != undefined && reqBody.goalFull.trim() != '' && 
            reqBody.height != undefined && 
            reqBody.weight != undefined
        ) {
            let profile = await User.findOne({where: {id: searchUser.id}, attributes: {exclude: ['password']}});
            profile.name = reqBody.name;
            profile.sex = reqBody.sex;
            profile.goal = reqBody.goal;
            profile.goalFull = reqBody.goalFull;
            profile.height = reqBody.height;
            profile.weight = reqBody.weight;

            await profile.save();

            res.status(200).json(profile);
            return;
        } else {
            res.status(400).json("BAD_REQUEST");
            return ;
        }
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