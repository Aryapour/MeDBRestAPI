import { Router } from 'express';
//import {getAllData, getDataById, addData, insertNewRows} from '../database.js'
import {getAllData, getDataById, addData, insertNewRows,findOneUser,getUsersRecords} from '../mongodb.js'
let router = Router()

router.get('/', async (req, res) => {
    res.json( await getAllData() )
})

router.get('/:id', async (req, res) => {
    res.json( await getDataById(req.params.id) )
})

router.post('/', async (req, res) => {
    let exist = await getDataById(req.body.id)
    if( exist[0] ) {
        res.status(409).json( {"error": "record already exists"});
    } else {
        let result = await addData(req.body);
        if(result.affectedRows)
            res.json(req.body);
        else
            res.status(500).json({"error": "unknown database error"})
    }
})

router.post('/', async (req, res) => {
    let result = await insertNewRows(req.body);
    if(result.affectedRows)
        res.json(req.body);
    else
        res.status(500).json({"error": "unknown database error"})
})

router.get('/', async (req, res) => {
    const result = await getUsersRecords();
    if (result && !result.error) {
        res.json(result);
    } else {
        res.status(500).json({ "error": "unknown database error" });
    }
});

export default router;
