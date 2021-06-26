const axios = require('axios')
const axiosMetabse = require('./axios-metabase')
const { db } = require('./db')

const metaUrl = 'https://analytics.citymall.live/api/dataset'

const countBody = {
    type: "native",
    native: {
        query: `select \n    count(*)\nfrom bd_leader_mapping blm\njoin team_leaders tl on blm.leader_id = tl.id and blm.admin_id in(90,3614,3615,3616,5069,1368,3617,3618,84,4795,5483,3620,4186,1133,60,3621,3622,1001,3625,5138,3624,3633,3626,2918,3635,3628,3629,4951,1210,555,5482,4964,5481)\njoin user_addresses ua on tl.address = ua.id\njoin pincodes p on ua.pincode = p.pincode `,
        "template-tags": {},
    },
    database: 2,
    parameters: [],
};

const metaBody = (limit, offset) => {
    return {
        type: "native",
        native: {
            query: `select \n    tl.name as name,\n   tl.id as erp_id,\n    'Individual' as type,\n    ua.city as city,\n    p.district as district,\n    ua.state as state,\n    ua.pincode as pincode,\n    tl.phone_number as mobile,\n    (\n        case\n            when discarded_at is null then 1\n            else 0\n        end\n    ) as is_available,\n    1 as status,\n    blm.admin_id as admin_id\nfrom bd_leader_mapping blm\njoin team_leaders tl on blm.leader_id = tl.id and blm.admin_id in(90,3614,3615,3616,5069,1368,3617,3618,84,4795,5483,3620,4186,1133,60,3621,3622,1001,3625,5138,3624,3633,3626,2918,3635,3628,3629,4951,1210,555,5482,4964,5481)\njoin user_addresses ua on tl.address = ua.id\njoin pincodes p on ua.pincode = p.pincode order by tl.phone_number limit ${limit} offset ${offset}`,
            "template-tags": {},
        },
        database: 2,
        parameters: [],
    }
};

let fields = []
let count = null

async function upload(){
    let routes = await db.any(`
        select 
            br_id, admin_id, route_id 
        from br_bd_users 
        where route_id is not null and admin_id is not null
    `)
    const routesObj = {}
    routes = routes.forEach(el => {
        routesObj[el.admin_id] = el.route_id
    })
    
    const resCount = await axiosMetabse.post(metaUrl,countBody)
    count = Math.ceil(resCount.data.data.rows[0][0]/100)

    for(let i = 0; i< count; i++){
        const offset = i*100
        const limit = 100
        const body = metaBody(limit, offset)
        let data = []
        console.log('limit',limit,'\noffset',offset)
    
        const res = await axiosMetabse.post(metaUrl,body)
        fields = fields.length ? fields : res.data.data.cols.map(el => el.name)
        res.data.data.rows.forEach(record => {
            const obj = {}
            fields.forEach((e,i) => {
                if(e === 'admin_id'){
                    obj.route = routesObj[record[i]]
                }
                else{
                    obj[e] = record[i]
                }
            })
            data.push(obj)
        })
        data = data.filter(e => {
            if(!e.route) return false
            else return true
        })
        // console.log(data)

        console.log('insert count', data.length)
        const result = await axios.post('https://devapi.vwbeatroute.com/v1/customer/create?key=mLIuBnWREzA6jthvp~aZMoBVZHLIp1SV',data,{
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })

        console.log('inserted',i+1)
    }
}

upload()

























// axios.post(`https://devapi.vwbeatroute.com/v1/customer/create?key=mLIuBnWREzA6jthvp~aZMoBVZHLIp1SV`,[
//         {
//             name: 'Sarita Singh',
//             erp_id: 'saritasingh9729640087',
//             type: 'Individual',
//             city: 'PANIPAT',
//             district: 'Panipat',
//             state: 'Haryana',
//             pincode: '132103',
//             mobile: '9729640087',
//             is_available: 0,
//             status: 2
//         },
//         {
//             name: 'Tarun',
//             erp_id: 'tarun9355173927',
//             type: 'Individual',
//             city: 'FARIDABAD',
//             district: 'FARIDABAD',
//             state: 'Haryana',
//             pincode: '121102',
//             mobile: '9355173927',
//             is_available: 0,
//             status: 2
//         }
//     ],
//     {
//         headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json'
//         }
//     }
// )
// .then(res => console.log(res.data))
