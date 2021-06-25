const axios = require('axios')
const moment = require('moment')
const config = require('config')
const { db, pgp } = require('./db')

async function getUsers(){
    const res = await axios.post(`${config.get('BEATROUTE_BASE_URL')}/v1/user?key=${config.get('BEATROUTE_TOKEN')}`,{
        search: {
            date: '2021-06-10'
        }
    },{
       headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
       } 
    })
    
    const data = res.data.data.items
    data.forEach(el => {
        if(el['created_date'])el['created_date'] = moment(el['created_date']).isValid() ? moment(el['created_date']).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
        if(el['deleted_date'])el['deleted_date'] = moment(el['deleted_date']).isValid() ? moment(el['deleted_date']).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
        if(el['last_login_date'])el['last_login_date'] = moment(el['last_login_date']).isValid() ? moment(el['last_login_date']).format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
        if(el.customFields && (el.customFields[0].id == 426 || el.customFields[0].field_name.toLowerCase() === 'admin id')){
            el.admin_id = parseInt(el.customFields[0].value) || null
        }
    })
    
    db.task( async t => {
        for(let i = 0; i<data.length; i++){
            await t.none(`
                insert into br_bd_users(admin_id,br_id,name,emp_role_id,designation_name,role,role_name,email,mobile,reportee_br_id,reportee_name,reportee_emp_role_id,created_date,deleted_date,is_available,last_login_date)
                values($(admin_id),$(id),$(name),$(emp_role_id),$(designation_name),$(role),$(role_name),$(email),$(mobile),$(reportee_br_id),$(reportee_name),$(reportee_emp_role_id),$(created_date),$(deleted_date),$(is_available),$(last_login_date))
                on conflict(br_id) do update 
                set 
                    admin_id = $(admin_id),
                    name = $(name),
                    emp_role_id = $(emp_role_id),
                    designation_name = $(designation_name),
                    role = $(role),
                    role_name = $(role_name),
                    email = $(email),
                    mobile = $(mobile),
                    reportee_br_id = $(reportee_br_id),
                    reportee_name = $(reportee_name),
                    reportee_emp_role_id = $(reportee_emp_role_id),
                    created_date = $(created_date),
                    deleted_date = $(deleted_date),
                    is_available = $(is_available),
                    last_login_date = $(last_login_date)
            `,data[i])
        }
        console.log('inserted', data.length, 'records')
    })
}

getUsers()
