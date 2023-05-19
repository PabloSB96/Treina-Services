require('dotenv').config();
//require('./config/database').connect();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

var nodemailer = require('nodemailer');

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
    dialect: 'mysql',
    logging: false
});

const TRIAL_NUMBER_DAYS = 7;
const ENTITLEMENT_ID = 'pro';

// Define models
const Config = sequelize.define('Config', {
    id: {type: DataTypes.BIGINT, primaryKey: true},
    name: {type: DataTypes.STRING, unique: true, allowNull: false},
    value: {type: DataTypes.STRING, allowNull: false},
    createdAt: {type: DataTypes.DATE, allowNull: true, field: 'created_at'}
}, {tableName: 'treina_config', timestamps: false});
const Plan = sequelize.define('Plan', {
    id: {type: DataTypes.BIGINT, primaryKey: true},
    code: {type: DataTypes.STRING, unique: true, allowNull: false},
    title: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false},
    costMonth: {type: DataTypes.DOUBLE, allowNull: false, field: 'cost_month'},
    costYear: {type: DataTypes.DOUBLE, allowNull: false, field: 'cost_year'},
}, {tableName: 'treina_plan', timestamps: false});
const User = sequelize.define('User', {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
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
    planRevenuecatObj: {type: DataTypes.STRING, field: 'plan_revenuecat_obj'},
    planPurchasedDate: {type: DataTypes.DATE, field: 'plan_purchased_date'},
    isInTrial: {type: DataTypes.BOOLEAN, field: 'is_in_trial'},
    isTrialEnded: {type: DataTypes.BOOLEAN, field: 'is_trial_ended'},
    trialStartDate: {type: DataTypes.DATE, field: 'trial_start_date', allowNull: true},
    recoverPasswordCode: {type: DataTypes.STRING, field: 'recover_password_code'},
    recoverPasswordCodeDate: {type: DataTypes.DATE, field: 'recover_password_code_date'},
    active: {type: DataTypes.BOOLEAN},
    createdAt: {type: DataTypes.DATE, allowNull: true, field: 'created_at'}
}, {tableName: 'treina_user', timestamps: false});
const PurchaseError = sequelize.define('PurchaseError', {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    planRevenuecatObj: {type: DataTypes.STRING, field: 'plan_revenuecat_obj'},
    message: {type: DataTypes.STRING, field: 'message'},
    user: {type: User, field: 'user_id'},
    createdAt: {type: DataTypes.DATE, allowNull: true, field: 'created_at'}
}, {tableName: 'treina_purchase_error', timestamps: false});
const Team = sequelize.define('Team', {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    trainer: {type: User, field: 'trainer_id'},
    trainee: {type: User, field: 'trainee_id'},
}, {tableName: 'treina_team', timestamps: false});
const UserMeasuresHistory = sequelize.define('UserMeasuresHistory', {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
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
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
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
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
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
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
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
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
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
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: false},
    trainerFood: {type: TrainerFood, field: 'trainer_food_id'},
    createdAt: {type: DataTypes.DATE, allowNull: true, field: 'created_at'}
}, {tableName: 'treina_shopping_element_trainer_food', timestamps: false});
TrainerFood.hasMany(ShoppingElementTrainerFood, {sourceKey: 'id', foreignKey: 'trainerFood'});
ShoppingElementTrainerFood.belongsTo(TrainerFood, {foreignKey: 'trainerFood'});
const ShoppingElementTraineeFood = sequelize.define('ShoppingElementTraineeFood', {
    id: {type: DataTypes.BIGINT, primaryKey: true, autoIncrement: true},
    title: {type: DataTypes.STRING, allowNull: false},
    description: {type: DataTypes.STRING, allowNull: true},
    checked: {type: DataTypes.BOOLEAN},
    traineeFood: {type: TraineeFood, field: 'trainee_food_id'},
    createdAt: {type: DataTypes.DATE, allowNull: true, field: 'created_at'}
}, {tableName: 'treina_shopping_element_trainee_food', timestamps: false});
TraineeFood.hasMany(ShoppingElementTraineeFood, {sourceKey: 'id', foreignKey: 'traineeFood'});
ShoppingElementTraineeFood.belongsTo(TraineeFood, {foreignKey: 'traineeFood'});

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

let updateTokenLogin = async (email) => {

    const searchUser = await User.findOne({ where: {email: email }});
    
    const token = jwt.sign(
        {email },
        process.env.TOKEN_KEY,
        {expiresIn: '72h' }
    );
    searchUser.token = token;
    await searchUser.save();
    return token;
}

let sendEmail = async (to, subject, text) => {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'treina.ayuda@gmail.com',
          pass: 'fgqvehxtjjmzsvsz'
        }
    });
      
    var mailOptions = {
        from: 'treina.ayuda@gmail.com',
        to: to,
        subject: subject,
        text: text
    };
      
    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          //console.log(error);
        }
    });
      
}

app.post('/treina-services/config', async (req, res) => {
    try {
        const reqBody = req.body;
        if (reqBody.appVersion != undefined && reqBody.appVersion.trim() != '') {
            let currentVersion = await Config.findOne({where: {name: 'app.currentVersion'}, raw: true});
            if (currentVersion != undefined && currentVersion.value == reqBody.appVersion) {
                res.status(200).send("OK");
                return ;
            } else {
                res.status(400).send("INTERNAL_ERROR");
                return ;
            }
        } else {
            res.status(400).send("BAD_REQUEST");
            return ;
        }
    } catch (error) {
        res.status(400).send("INTERNAL_ERROR");
        return ;
    }
});

app.post('/treina-services/register', async (req, res) => {
    try {
        console.log("/register - 1");
        // Register the new user here
        const registerBody = req.body;
        const searchUser = await User.findOne({where: { email: registerBody.email }});
        if (searchUser != undefined) {
            console.log("/register - 2");
            res.status(400).send({'message': 'USER_ALREADY_EXISTS'});
        } else {
            console.log("/register - 3");
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
                    console.log("/register - 4");
                    let trainer = undefined;
                    if (!registerBody.isTrainer && registerBody.trainerCode != undefined) {
                        console.log("/register - 5");
                        // It is a trainee, first check if trainer exists, then match it with his trainer
                        trainer = await User.findOne({where: { trainerCode: registerBody.trainerCode }});
                        if (trainer == null || trainer == undefined) {
                            console.log("/register - 6");
                            res.status(400).send({'message': 'TRAINER_CODE_NOT_EXISTS'});
                            return ;
                        }
                        // check number of clients the trainer already has
                        let trainees = await Team.findAll({where: {trainer: trainer.id}});
                        if (trainees == undefined) {
                            trainees = [];
                        }
                        console.log("/register - 7");
                        console.log(trainees);
                        console.log("/register - 8");
                        if (trainer.isInTrial == true && (trainees.length + 1) > 1) {
                            console.log("/register - 9");
                            res.status(400).send({'message': 'TRAINER_MAX_CLIENTS_EXCEEDED'});
                            return ;
                        }
                        let plan = await Plan.findOne({where: {id: trainer.plan}});
                        if (plan != undefined && plan.code == 'treina_10_1m_0w0') {
                            if ((trainees.length + 1) > 5) {
                                res.status(400).send({'message': 'TRAINER_MAX_CLIENTS_EXCEEDED'});
                                return ;
                            }
                        } else if (plan != undefined && plan.code == 'treina_15_1m_0w0') {
                            if ((trainees.length + 1) > 10) {
                                res.status(400).send({'message': 'TRAINER_MAX_CLIENTS_EXCEEDED'});
                                return ;
                            }
                        } else if (plan != undefined && plan.code == 'treina_100_1y_0w0') {
                            if ((trainees.length + 1) > 5) {
                                res.status(400).send({'message': 'TRAINER_MAX_CLIENTS_EXCEEDED'});
                                return ;
                            }
                        } else if (plan != undefined && plan.code == 'treina_150_1y_0w0') {
                            if ((trainees.length + 1) > 10) {
                                res.status(400).send({'message': 'TRAINER_MAX_CLIENTS_EXCEEDED'});
                                return ;
                            }
                        }
                    }

                    console.log("/register - 10");
                    encryptedPassword = await bcrypt.hash(registerBody.password.trim(), 10);

                    let email = registerBody.email;
                    const token = jwt.sign(
                        {email, isTrainer: registerBody.isTrainer},
                        process.env.TOKEN_KEY,
                        {expiresIn: '72h' }
                    );

                    var trainerCode = undefined;
                    let active = true;
                    if (registerBody.isTrainer) {
                        for(let i = 0; i < 100; i++) {
                            trainerCode = Date.now().toString(36).toUpperCase();
                            let userCheck = await User.findOne({where: {trainerCode: trainerCode}});
                            if (userCheck == undefined) {
                                i = 100;
                                active = false;
                            } else {
                                trainerCode = undefined;
                            }
                        }
                        if (trainerCode == undefined) {
                            res.status(400).send({'message': 'NOT_ABLE_TO_GENERATE_CODE'});
                            return ;
                        }
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
                        weight: registerBody.weight,
                        active: active
                    });

                    user = await User.findOne({where: { email: registerBody.email }});

                    if (trainer != null && trainer != undefined) {
                        // It is a trainee so match it with his trainer
                        await Team.create({
                            trainer: trainer.id,
                            trainee: user.id
                        });
                    }

                    if (!user.active) {
                        res.status(400).send({'message': 'USER_NOT_ACTIVE'});
                        return;
                    }

                    /*if (registerBody.isTrainer) {
                        sendEmail(
                            registerBody.email.toLowerCase(), 
                            'Registro completado', 
                            'Se ha completado tu registro como entrenador correctamente. Para poder iniciar sesión debemos activar tu cuenta, y para ello debes solicitarnos un plan en nuestra web: www.treina.app con este mismo email. En caso de cualquier duda o problema no dudes en contactarnos en treina.ayuda@gmail.com.');
                    }*/

                    res.status(200).json(user);
                    return;
            } else {
                console.log("/register - 11");
                res.status(400).send({'message': 'BAD_REQUEST'});
                return;
            }
        }
    } catch (error) {
        console.log("\n\n/register - error - 1");
        console.log(JSON.stringify(error));
        console.log("/register - error - 2");
        console.log(error);
        console.log("/register - error - 3\n\n");
        res.status(400).send({'message': 'INTERNAL_ERROR'});
        return;
    }
});

app.post('/treina-services/plan/register', async (req, res) => {
    console.log("\n\n/plan/register - 1");
    try {
        const registerBody = req.body;
        const searchUser = await User.findOne({where: { email: registerBody.email }});
        if (searchUser == undefined || !searchUser.isTrainer) {
            console.log("/plan/register - 2");
            console.log(JSON.stringify(searchUser));
            console.log("/plan/register - 2.2");
            console.log(JSON.stringify(registerBody));
            console.log("/plan/register - 2.3");
            if (registerBody != undefined) {
                console.log(registerBody.email);
            }
            console.log("/plan/register - 2.3");
            res.status(400).send({'message': 'BAD_REQUEST'});
        } else {
            console.log("/plan/register - 3");
            if (registerBody.revenuecat != undefined) {
                console.log("/plan/register - 4");
                /*
                Object {
                    "identifier": "Monthly_Basico",
                    "offeringIdentifier": "default",
                    "packageType": "CUSTOM",
                    "product": Object {
                        "currencyCode": "EUR",
                        "description": "",
                        "discounts": null,
                        "identifier": "treina_10_1m_0w0",
                        "introPrice": null,
                        "price": 11.99,
                        "priceString": "11,99 €",
                        "productCategory": "SUBSCRIPTION",
                        "productType": "AUTO_RENEWABLE_SUBSCRIPTION",
                        "subscriptionPeriod": "P1M",
                        "title": "Plan Básico (mensual) (Treina)",
                    },
                }
                */
                if (registerBody.revenuecat.entitlements.active[ENTITLEMENT_ID] != undefined && registerBody.revenuecat.entitlements.active[ENTITLEMENT_ID].productIdentifier != undefined) {
                    console.log("/plan/register - 5");
                    const plan = await Plan.findOne({where: {code: registerBody.revenuecat.entitlements.active[ENTITLEMENT_ID].productIdentifier }, raw: true});
                    if (plan == undefined || plan == null) {
                        console.log("/plan/register - 6");
                        res.status(400).send({'message': 'PRODUCT_INCORRECT'});
                        return;
                    }

                    let planRevenuecatObj = JSON.stringify(registerBody.revenuecat);
                    if (planRevenuecatObj.length > 1995) { //max length of database column
                        planRevenuecatObj = JSON.stringify(registerBody.revenuecat.entitlements.active[ENTITLEMENT_ID]);
                    }
                    searchUser.planRevenuecatObj = planRevenuecatObj;
                    searchUser.planPurchasedDate = (new Date()).getTime();
                    searchUser.active = true;
                    searchUser.isTrialEnded = true;
                    searchUser.plan = plan.id;
                    await searchUser.save();

                    console.log("/plan/register - 7");

                    //sendEmail(searchUser.email, 'Activación de cuenta', 'Su cuenta: ' + searchUser.email + ' como entrenador ha sido activada correctamente con el siguiente plan:\nNombre del plan: ' + registerBody.revenuecat.product.title + '\nPrecio: ' + registerBody.revenuecat.product.priceString);

                    res.status(200).json(searchUser);
                    return;
                } else {
                    console.log("/plan/register - 8");
                    res.status(400).send({'message': 'PRODUCT_INCORRECT'});
                    return;
                }
                
            } else {
                console.log("/plan/register - 9");
                res.status(400).send({'message': 'BAD_REQUEST'});
                return;
            }
        }
    } catch(error){
        console.log("/plan/register - 10");
        console.log(JSON.stringify(error));
        console.log("/plan/register - 11");
        res.status(400).send({'message': 'INTERNAL_ERROR'});
        return ;
    }
});
app.post('/treina-services/plan/remove', async (req, res) => {
    try {
        const registerBody = req.body;
        const searchUser = await User.findOne({where: { email: registerBody.email }});
        if (searchUser == undefined || !searchUser.isTrainer) {
            res.status(400).send({'message': 'BAD_REQUEST'});
        } else {
            searchUser.planRevenuecatObj = null;
            searchUser.planPurchasedDate = (new Date()).getTime();
            searchUser.active = false;
            searchUser.plan = null;
            await searchUser.save();

            sendEmail(searchUser.email, 'Todavía no tienes una suscripción activa', 'Hemos detectado que tu cuenta: ' + searchUser.email + ' como entrenador no tiene actulamente ningún plan asignado. Recuerda que a través de la app puedes volver a suscribirte. ¡Estaremos encantados de tenerte de nuevo por Treina!\n\nEn caso de que estés teniendo algún problema al acceder a la app, recuerda que nos puedes contactar en: treina.ayuda@gmail.com');

            res.status(200).json(searchUser);
            return;
        }
    } catch(error){
        res.status(400).send({'message': 'INTERNAL_ERROR'});
        return ;
    }
});
app.post('/treina-services/plan/activate', async (req, res) => {
    // This service is used when in the login the user has a plan activated,
    // but for some reason it was not previously registered on the backend correctly.
    console.log("\n\n/plan/activate - 1");
    try {
        const registerBody = req.body;
        let email = registerBody.email;
        console.log("/plan/activate - 2");
        console.log(registerBody.email);
        console.log("/plan/activate - 3");
        if (email == undefined || email.trim() == '') {
            let userToken = req.headers.token;
            const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
            email = tokenDecoded.email;
        }
        const searchUser = await User.findOne({where: { email: email }});
        console.log("/plan/activate - 4");
        if (searchUser == undefined || !searchUser.isTrainer) {
            console.log("/plan/activate - 5");
            res.status(400).send({'message': 'BAD_REQUEST'});
        } else {
            console.log("/plan/activate - 6");
            searchUser.active = true;
            await searchUser.save();

            let result = new Object();
            result.email = email;
            result.token = await updateTokenLogin(email);
            result.name = searchUser.name;

            /*if (searchUser.isTrainer) {
                if (searchUser.customerInfo != undefined && searchUser.customerInfo.)
            }*/

            res.status(200).json(result);
            return;
        }
    } catch(error){
        console.log("/plan/activate - 7");
        console.log(JSON.stringify(error));
        console.log("/plan/activate - 8");
        res.status(400).send({'message': 'INTERNAL_ERROR'});
        return ;
    }
});
app.post('/treina-services/plan/check', async (req, res) => {
    // This service is used when the users selects the trial package.
    console.log("/plan/check - 1");
    try {
        let userToken = req.headers.token;
        const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
        const email = tokenDecoded.email;
        const searchUser = await User.findOne({where: {email: email }});
        console.log("/plan/check - 2");
        if (searchUser == undefined || !searchUser.isTrainer) {
            console.log("/plan/check - 3");
            res.status(400).send({'message': 'BAD_REQUEST'});
        } else {
            console.log("/plan/check - 4");
            if (searchUser.isInTrial) {
                console.log("/plan/check - 5");
                console.log("/plan/check - 5.1");
                let dateDaysInPastFromToday = new Date((new Date()).getTime() - 1000 * 60 * 60 * 24 * TRIAL_NUMBER_DAYS);
                console.log((new Date(searchUser.trialStartDate)).getTime());
                console.log("/plan/check - 5.2");
                console.log(dateDaysInPastFromToday.getTime());
                console.log("/plan/check - 5.3");
                console.log((new Date(searchUser.trialStartDate)).getTime() >= dateDaysInPastFromToday.getTime());
                console.log("/plan/check - 5.4");
                if ((new Date(searchUser.trialStartDate)).getTime() < dateDaysInPastFromToday.getTime()) {
                    console.log("/plan/check - 6");
                    res.status(400).send({'message': 'TRIAL_EXPIRED'});
                    return ;
                } else {
                    res.status(200).send({'message': 'TRIAL_ACTIVE'});
                    return ;
                }
            }
            console.log("/plan/check - 7");
            res.status(200).send({'message': 'NOT_IN_TRIAL'});
            return;
        }
    } catch(error){
        console.log("/plan/check - error - 1");
        console.log(error);
        console.log("/plan/check - error - 2");
        console.log(JSON.stringify(error));
        console.log("/plan/check - error - 3");
        res.status(400).send({'message': 'INTERNAL_ERROR'});
        return ;
    }
});
app.post('/treina-services/plan/trial', async (req, res) => {
    // This service is used when the users selects the trial package.
    try {
        const registerBody = req.body;
        const searchUser = await User.findOne({where: { email: registerBody.email }});
        if (searchUser == undefined || !searchUser.isTrainer) {
            res.status(400).send({'message': 'BAD_REQUEST'});
        } else {
            searchUser.active = true;
            searchUser.isInTrial = true;
            searchUser.trialStartDate = (new Date()).getTime();
            await searchUser.save();

            let result = new Object();
            result.email = registerBody.email;
            result.token = await updateTokenLogin(registerBody.email);
            result.name = searchUser.name;

            res.status(200).json(result);
            return;
        }
    } catch(error){
        res.status(400).send({'message': 'INTERNAL_ERROR'});
        return ;
    }
});
app.post('/treina-services/registerPurchaseError', async (req, res) => {
    try {
        const registerBody = req.body;
        const searchUser = await User.findOne({where: { email: registerBody.email }});
        if (searchUser == undefined || !searchUser.isTrainer) {
            res.status(400).send({'message': 'BAD_REQUEST'});
        } else {
            if (registerBody.message != undefined && registerBody.revenuecat != undefined) {

                const purchaseError = await PurchaseError.create({
                    planRevenuecatObj: JSON.stringify(registerBody.revenuecat),
                    message: registerBody.message,
                    user: searchUser.id
                });

                res.status(200).json(purchaseError);
                return;
            } else {
                res.status(400).send({'message': 'BAD_REQUEST'});
                return;
            }
        }
    } catch(error){
        res.status(400).send({'message': 'INTERNAL_ERROR'});
        return ;
    }
});

app.post('/treina-services/login', async (req, res) => {
    try {
        const registerBody = req.body;
        const email = registerBody.email;
        const password = registerBody.password;

        const searchUser = await User.findOne({ where: {email: email }});

        if (searchUser != undefined && searchUser.isTrainer == registerBody.isTrainer) {
            if (searchUser.active) {
                if (await bcrypt.compare(password, searchUser.password)) {
                    let result = new Object();
                    result.email = email;
                    result.token = await updateTokenLogin(email);
                    result.name = searchUser.name;
                    result.isInTrial = searchUser.isInTrial;
                    result.isTrialEnded = searchUser.isTrialEnded;
                    result.trialStartDate = searchUser.trialStartDate;

                    /*if (searchUser.isTrainer) {
                        if (searchUser.customerInfo != undefined && searchUser.customerInfo.)
                    }*/

                    res.status(200).json(result);
                } else {
                    let message  = 'PASSWORD_INCORRECT';
                    res.status(400).send({'message': message});
                }
            } else {
                let message  = 'USER_NOT_ACTIVE';
                res.status(400).send({'message': message});
            }
        } else {
            res.status(400).send({'message': 'USER_NOT_EXISTS'});
        }
    } catch (error) {
        res.status(400).send({'message': 'INTERNAL_ERROR'});
        return ;
    }
});
app.post('/treina-services/forgotpassword/code', async (req, res) => {
    try {
        const reqBody = req.body;
        if (reqBody.email != undefined && reqBody.email.trim() != '') {
            let searchUser = await User.findOne({where: {email: reqBody.email}});
            if (searchUser != undefined) {
                let newCode = Date.now().toString(36).toUpperCase();
                searchUser.recoverPasswordCode = newCode;
                searchUser.recoverPasswordCodeDate = Date.now() + 300000;
                await searchUser.save();

                sendEmail(reqBody.email, 'Cambio de contraseña', 'Su código para recuperar su contraseña es: ' + newCode.toString() + '\nRecuerda que el código será válido durante 5 minutos.')

                res.status(200).send("OK");
                return ;
            } else {
                res.status(400).send("EMAIL_NOT_EXISTS");
                return ;
            }
        } else {
            res.status(400).send("BAD_REQUEST");
            return ;
        }
    } catch (error) {
        res.status(400).send("INTERNAL_ERROR");
        return ;
    }
});
app.post('/treina-services/forgotpassword/newpassword', async (req, res) => {
    try {
        const reqBody = req.body;
        if (reqBody.email != undefined && reqBody.email.trim() != '' && 
            reqBody.code != undefined && reqBody.code.trim() != '' && 
            reqBody.password != undefined && reqBody.password.trim() != '' && 
            reqBody.repeatPassword != undefined && reqBody.repeatPassword.trim() != '' && 
            reqBody.password.trim() == reqBody.repeatPassword.trim()) {
            let searchUser = await User.findOne({where: {email: reqBody.email}});
            if (searchUser != undefined) {
                if (searchUser.recoverPasswordCode == reqBody.code.trim() && Date.now() < searchUser.recoverPasswordCodeDate) {
                    searchUser.recoverPasswordCode = null;
                    searchUser.recoverPasswordCodeDate = null;
                    let encryptedPassword = await bcrypt.hash(reqBody.password.trim(), 10);
                    searchUser.password = encryptedPassword;
                    await searchUser.save();
                    res.status(200).send("OK");
                    return ;
                } else {
                    res.status(400).send("CODE_NOT_VALID");
                    return ;
                }
            } else {
                res.status(400).send("EMAIL_NOT_EXISTS");
                return ;
            }
        } else {
            res.status(400).send("BAD_REQUEST");
            return ;
        }
    } catch (error) {
        res.status(400).send("INTERNAL_ERROR");
        return ;
    }
});
app.post('/treina-services/account/delete', async (req, res) => {
    try {
        let userToken = req.headers.token;
        const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
        const email = tokenDecoded.email;
        const searchUser = await User.findOne({where: {email: email }});
        const reqBody = req.body;
        if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
            res.status(400).send('TOKEN_NOT_VALID');
            return;
        } else {
            if (searchUser.isTrainer) {
                await TrainerExercice.destroy({where: {trainer: searchUser.id}});
                await TrainerFood.destroy({where: {trainer: searchUser.id}});
                await Team.destroy({where: {trainer: searchUser.id}});
                await User.destroy({where: {id: searchUser.id}});

                res.status(200).send("DELETED");
                return;
            } else {
                await UserMeasuresHistory.destroy({where: {trainee: searchUser.id}});
                await TraineeExercice.destroy({where: {trainee: searchUser.id}});
                await TraineeFood.destroy({where: {trainee: searchUser.id}});
                await Team.destroy({where: {trainee: searchUser.id}});
                await User.destroy({where: {id: searchUser.id}});

                res.status(200).send("DELETED");
                return;
            }
        }
    } catch (error) {
        res.status(400).json("INTERNAL_ERROR");
        return ;
    }
});

app.post('/treina-services/trainer/trainees', async (req, res) => {
    try {
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
                let t = await User.findOne({where: {id: trainees[i].getDataValue('trainee')}, raw: true});
                if (t != null && t != undefined) {
                    let history = await UserMeasuresHistory.findAll({where: {trainee: t.id}, limit: 1, order: [['createdAt', 'DESC']]});
                    if (history != undefined && history.length == 1) {
                        t.lastMeasuresUpdate = history[0].getDataValue('createdAt');
                    }
                    result.push(t);
                }
            }
            res.status(200).json(result);
            return;
        }
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return ;
    }
});
app.post('/treina-services/trainer/trainees/delete', async (req, res) => {
    try {
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
                    await Team.destroy({where: {trainer: searchUser.id, trainee: reqBody.id}});

                    res.status(200).json("DELETED");
                    return ;
                }
            } else {
                res.status(400).send('BAD_INFORMATION');
                return;
            }
        }
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainer/trainees/:traineeId/profile', async (req, res) => {
    try {
        let userToken = req.headers.token;
        let traineeId = req.params.traineeId;
        const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
        const email = tokenDecoded.email;
        const searchUser = await User.findOne({where: {email: email }});
        if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
            res.status(400).send('TOKEN_NOT_VALID');
            return;
        } else {
            let trainee = await User.findOne({where: {id: traineeId}, attributes: {exclude: ['password', 'recoverPasswordCode', 'recoverPasswordCodeDate', 'active']}});
            res.status(200).json(trainee);
            return;
        }
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainer/trainees/:traineeId/history', async (req, res) => {
    try {
        let userToken = req.headers.token;
        let traineeId = req.params.traineeId;
        const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
        const email = tokenDecoded.email;
        const searchUser = await User.findOne({where: {email: email }});
        if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
            res.status(400).send('TOKEN_NOT_VALID');
            return;
        } else {
            let historicalData = await UserMeasuresHistory.findAll({where: {trainee: traineeId}, order: [['createdAt', 'DESC']]});
            res.status(200).json(historicalData);
            return;
        }
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainer/trainees/:traineeId/food', async (req, res) => {
    try {
        let userToken = req.headers.token;
        let traineeId = req.params.traineeId;
        const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
        const email = tokenDecoded.email;
        const searchUser = await User.findOne({where: {email: email }});
        if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
            res.status(400).send('TOKEN_NOT_VALID');
            return;
        } else {
            let food = await TraineeFood.findAll({where: {trainee: traineeId}, include: [FoodType, ShoppingElementTraineeFood]});
            res.status(200).json(food);
            return;
        }
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainer/trainees/:traineeId/food/new', async (req, res) => {
    try {
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

                    shopList = [];
                    if (reqBody.shoppingList != undefined && reqBody.shoppingList.length > 0) {
                        for (let i = 0; i < reqBody.shoppingList.length; i++) {
                            if (reqBody.shoppingList[i].title != null && reqBody.shoppingList[i].title.trim() != '') {
                                let description = '';
                                if (reqBody.shoppingList[i].description != undefined && reqBody.shoppingList[i].description != null) {
                                    description = reqBody.shoppingList[i].description;
                                } 
                                const elem = await ShoppingElementTraineeFood.create({
                                    title: reqBody.shoppingList[i].title,
                                    description: description,
                                    traineeFood: food.id
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
        }
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return ;
    }
});
app.post('/treina-services/trainer/trainees/:traineeId/food/edit', async (req, res) => {
    try {
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

                        food = await food.save();

                        shopList = [];
                        if (reqBody.shoppingList != undefined && reqBody.shoppingList.length > 0) {
                            for (let i = 0; i < reqBody.shoppingList.length; i++) {
                                if (reqBody.shoppingList[i].new != undefined && reqBody.shoppingList[i].new) {
                                    const elem = await ShoppingElementTraineeFood.create({
                                        title: reqBody.shoppingList[i].title,
                                        description: reqBody.shoppingList[i].description,
                                        traineeFood: food.id
                                    });
                                    shopList.push(elem);
                                } else {
                                    let elem = await ShoppingElementTraineeFood.findOne({where: {id: reqBody.shoppingList[i].id}});
                                    if (elem != undefined) {
                                        if (reqBody.shoppingList[i].delete) {
                                            await elem.destroy();
                                        } else {
                                            elem.title = reqBody.shoppingList[i].title;
                                            elem.description = reqBody.shoppingList[i].description;
                                            await elem.save();
                                            shopList.push(elem);
                                        }
                                    }
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
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return ;
    }
});
app.post('/treina-services/trainer/trainees/:traineeId/food/delete', async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainer/trainees/:traineeId/exercices', async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainer/trainees/:traineeId/exercices/new', async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return ;
    }
});
app.post('/treina-services/trainer/trainees/:traineeId/exercices/edit', async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return ;
    }
});
app.post('/treina-services/trainer/trainees/:traineeId/exercices/delete', async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainer/data/food', async (req, res) => {
    try {
        let userToken = req.headers.token;
        const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
        const email = tokenDecoded.email;
        const searchUser = await User.findOne({where: {email: email }});
        if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
            res.status(400).send('TOKEN_NOT_VALID');
            return;
        } else {
            let food = await TrainerFood.findAll({where: {trainer: searchUser.id}, include: [FoodType, ShoppingElementTrainerFood]});
            res.status(200).json(food);
            return;
        }
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainer/data/exercices', async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainer/data/food/new', async (req, res) => {
    try {
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
        }
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainer/data/food/edit', async (req, res) => {
    try {
        let userToken = req.headers.token;
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
                                if (reqBody.shoppingList[i].new != undefined && reqBody.shoppingList[i].new) {
                                    const elem = await ShoppingElementTrainerFood.create({
                                        title: reqBody.shoppingList[i].title,
                                        description: reqBody.shoppingList[i].description,
                                        trainerFood: food.id
                                    });
                                    shopList.push(elem);
                                } else {
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
                                    }
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
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainer/data/exercices/new', async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return ;
    }
});
app.post('/treina-services/trainer/data/exercices/edit', async (req, res) => {
    try {
        let userToken = req.headers.token;
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
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return ;
    }
});
app.post('/treina-services/trainer/profile', async (req, res) => {
    console.log("/trainer/profile - 1");
    try {
        let userToken = req.headers.token;
        let registerBody = req.body;
        const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
        const email = tokenDecoded.email;
        let searchUser = await User.findOne({where: {email: email }});
        console.log("/trainer/profile - 2");
        if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
            console.log("/trainer/profile - 3");
            res.status(400).send('TOKEN_NOT_VALID');
            return;
        } else {
            console.log("/trainer/profile - 4");
            let trainees = await Team.findAll({where: {trainer: searchUser.id}});
            console.log("/trainer/profile - 5");
            if (trainees == null || trainees == undefined) {
                console.log("/trainer/profile - 6");
                trainees = [];
            }
            let plan = undefined;
            console.log("/trainer/profile - 7");
            if (searchUser.plan != null && searchUser.plan != undefined) {
                console.log("/trainer/profile - 8");
                plan = await Plan.findOne({where: {id: searchUser.plan}});
            }
            // check if a plan to be updated is needed
            console.log("/trainer/profile - 9");
            if (registerBody.revenuecat != undefined && registerBody.revenuecat.productIdentifier != undefined) {
                console.log("/trainer/profile - 10");
                let revenuecatPlan = await Plan.findOne({where: {code: registerBody.revenuecat.productIdentifier}, raw: true});
                console.log("/trainer/profile - 11");
                if (revenuecatPlan == undefined || revenuecatPlan == null) {
                    console.log("/trainer/profile - 12");
                    console.log("/trainer/profile - error - plan null");
                    res.status(400).send({'message': 'PRODUCT_INCORRECT'});
                    return ;
                }
                console.log("/trainer/profile - 13");
                if (plan == undefined || plan.id != revenuecatPlan.id) {
                    console.log("/trainer/profile - 14");
                    // User has updated his plan
                    searchUser.planRevenuecatObj = JSON.stringify(registerBody.revenuecat);
                    searchUser.planPurchasedDate = (new Date()).getTime();
                    searchUser.active = true;
                    searchUser.isTrialEnded = true;
                    searchUser.plan = revenuecatPlan.id;
                    await searchUser.save();
                }
                console.log("/trainer/profile - 15");
            }
            console.log("/trainer/profile - 16");
            let myProfile = {
                id: searchUser.id,
                email: searchUser.email,
                name: searchUser.name,
                trainerCode: searchUser.trainerCode,
                isInTrial: searchUser.isInTrial,
                isTrialEnded: searchUser.isTrialEnded,
                trialStartDate: searchUser.trialStartDate,
                traineeNumber: trainees.length,
                plan: plan
            };
            res.status(200).json(myProfile);
            return;
        }
    } catch (error) {
        console.log("/trainer/profile - 17");
        console.log(JSON.stringify(error));
        console.log("/trainer/profile - 18");
        res.status(400).send('INTERNAL_ERROR');
        return ;
    }
});

app.post('/treina-services/trainee/exercices', async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainee/food', async (req, res) => {
    try {
        let userToken = req.headers.token;
        const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
        const email = tokenDecoded.email;
        const searchUser = await User.findOne({where: {email: email }});
        if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
            res.status(400).send('TOKEN_NOT_VALID');
            return;
        } else {
            let food = await TraineeFood.findAll({where: {trainee: searchUser.id}, include: [FoodType, ShoppingElementTraineeFood]});
            res.status(200).json(food);
            return;
        }
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainee/food/shoppinglist', async (req, res) => {
    try {
        let userToken = req.headers.token;
        const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
        const email = tokenDecoded.email;
        const searchUser = await User.findOne({where: {email: email }});
        if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
            res.status(400).send('TOKEN_NOT_VALID');
            return;
        } else {
            let food = await TraineeFood.findAll({where: {trainee: searchUser.id}, include: [ShoppingElementTraineeFood]});
            let result = [];
            for (let i = 0; i < food.length; i++) {
                result = result.concat(food[i].ShoppingElementTraineeFoods);
            }
            res.status(200).json(result);
            return;
        }
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainee/food/shoppinglist/:idShoppingListElement', async (req, res) => {
    try {
        let userToken = req.headers.token;
        let idShoppingListElement = req.params.idShoppingListElement;
        const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
        const email = tokenDecoded.email;
        const reqBody = req.body;
        const searchUser = await User.findOne({where: {email: email }});
        if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
            res.status(400).send('TOKEN_NOT_VALID');
            return;
        } else {
            let shoppingListElement = await ShoppingElementTraineeFood.findOne({where: {id: idShoppingListElement}});
            if (shoppingListElement != undefined) {
                if (reqBody.checked != undefined) {
                    shoppingListElement.checked = reqBody.checked;
                    shoppingListElement = await shoppingListElement.save();
                    res.status(200).send(shoppingListElement);
                    return;
                } else {
                    res.status(400).send('BAD_INFORMATION');
                    return;
                }
            } else {
                res.status(400).send('BAD_INFORMATION');
                return;
            }
        }
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainee/history', async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainee/history/new', async (req, res) => {
    try {
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
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainee/profile', async (req, res) => {
    try {
        let userToken = req.headers.token;
        const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
        const email = tokenDecoded.email;
        const searchUser = await User.findOne({where: {email: email }});
        if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
            res.status(400).send('TOKEN_NOT_VALID');
            return;
        } else {
            let profile = await User.findOne({where: {id: searchUser.id}, attributes: {exclude: ['password', 'recoverPasswordCode', 'recoverPasswordCodeDate', 'active']}, raw: true});
            let trainers = await Team.findAll({where: {trainee: searchUser.id}});
            let trainer = undefined;
            if (trainers != undefined && trainers.length == 1) {
                trainer = await User.findOne({where: {id: trainers[0].trainer}, attributes: {exclude: ['password', 'recoverPasswordCode', 'recoverPasswordCodeDate', 'active']}, raw: true});
            }
            profile.trainer = trainer;
            res.status(200).json(profile);
            return;
        }
    } catch (error) {
        res.status(400).send('INTERNAL_ERROR');
        return;
    }
});
app.post('/treina-services/trainee/profile/edit', async (req, res) => {
    try {
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
                let profile = await User.findOne({where: {id: searchUser.id}, attributes: {exclude: ['password', 'recoverPasswordCode', 'recoverPasswordCodeDate', 'active']}});
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
    } catch (error) {
        res.status(400).json("INTERNAL_ERROR");
        return ;
    }
});
app.post('/treina-services/trainee/profile/updateCode', async (req, res) => {
    try {
        let userToken = req.headers.token;
        const tokenDecoded = jwt.verify(await updateToken(userToken), process.env.TOKEN_KEY);
        const email = tokenDecoded.email;
        const searchUser = await User.findOne({where: {email: email }});
        const reqBody = req.body;
        if (searchUser == undefined && searchUser.isTrainer == tokenDecoded.isTrainer && searchUser.isTrainer == true) {
            res.status(400).send('TOKEN_NOT_VALID');
            return;
        } else {
            if (reqBody.code != undefined && reqBody.code.trim() != '') {

                let newTrainer = await User.findOne({where: { trainerCode: reqBody.code }});
                if (newTrainer == undefined) {
                    res.status(400).send("TRAINER_CODE_NOT_EXISTS");
                    return;
                }
                await TraineeExercice.destroy({where: {trainee: searchUser.id}});
                await TraineeFood.destroy({where: {trainee: searchUser.id}});
                await Team.destroy({where: {trainee: searchUser.id}});

                if (newTrainer != undefined) {
                    // It is a trainee so match it with his trainer
                    await Team.create({
                        trainer: newTrainer.id,
                        trainee: searchUser.id
                    });
                }

                res.status(200).json("DELETED");
                return;
            } else {
                res.status(400).json("BAD_REQUEST");
                return ;
            }
        }
    } catch (error) {
        res.status(400).json("INTERNAL_ERROR");
        return ;
    }
});


app.listen(port, async () => {
    console.log(`Global-controller listening on port ${port}!`);

    //sendEmail('pablosanchezbello@gmail.com', 'Prueba', 'Prueba envio email.\nSegunda linea\n<b>Tercera linea</b>');

    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
});