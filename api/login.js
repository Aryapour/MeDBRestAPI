import { Router } from 'express';
import jwt from 'jsonwebtoken';
import {logonUsers, findOneUser} from '../database.js'
let router = Router()

router.post('/', async (req, res) => {
    const username = req.body.username;
    const password = req.body.password;
    let user = await findOneUser(username);
    console.log(user[0].username)
    if( user[0] && user[0].password === password) {
        const token = jwt.sign({username: user[0].username}, 'my_secret_key', {
            expiresIn: '1h'
        })
        logonUsers.set(username, {...user[0], token: token});
        console.log(logonUsers.get(username))
        res.json( {
            'username': username,
            'access_token': token,
            'token_type': 'Bearer',
            'expires_in': '1h'
        });
    } else
        res.status(401).json({"error": "Login failed"});
})

export default router;