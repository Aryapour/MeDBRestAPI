import jwt from 'jsonwebtoken';
import { logonUsers } from './database.js'

const verifyToken = (req, res, next) => {
    const bearer_token = req.header('Authorization');
    if(bearer_token && bearer_token.toLowerCase().startsWith('bearer ')) {
        const token = bearer_token.substring(7);
        try {
            const decodedToken = jwt.verify(token, 'my_secret_key')
            console.log(decodedToken)
            const now = Date.now()/1000;
            const isValid = (decodedToken.exp-now) >= 0 ? true : false;
            if(isValid) {
                const user = logonUsers.get(decodedToken.username)
                if(user.token = token) {
                    next()
                } else
                    res.status(401).json({"error": "Unauthorized"})
            } else
            res.status(401).json({"error": "Invalid token"})
        } catch (err) {
            res.status(401).json({"error": "Invalid token"})
        }
    } else
        res.status(401).json({"error": "Invalid token"})
} 

export {
    verifyToken
}