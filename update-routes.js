const axios = require('axios')
const moment = require('moment')
const config = require('config')
const { db, pgp } = require('./db')

async function getUsers(){
    const res = await axios.post(`${config.get('BEATROUTE_BASE_URL')}/v1/route?key=${config.get('BEATROUTE_TOKEN')}`,{
       headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       } 
    })
    let data = res.data.data.items
    data = data.map(el => {
        return { br_id: parseInt(el.sales_rep.id), route_id: parseInt(el.id) }
    })

    const update_qry = pgp.helpers.update(data,['?br_id','route_id'],'br_bd_users') + ' where v.br_id = t.br_id '
    
    await db.none(update_qry)
    console.log('updated',data.length,'records')
}

getUsers()
