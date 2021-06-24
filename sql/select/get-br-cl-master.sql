select 
    tl.name as name,
    tl.id as erp_id,
    bru.br_id as br_id,
    'Individual' as type,
    ua.city as city,
    p.district as district,
    ua.state as state,
    ua.pincode as pincode,
    tl.phone_number as mobile,
    (
        case
            when discarded_at is null then 1
            else 0
        end
    ) as is_available,
    1 as status
from bd_leader_mapping blm
join team_leaders tl on blm.leader_id = tl.id
join br_bd_users bru on bru.admin_id = blm.admin_id
join user_addresses ua on tl.address = ua.id
join pincodes p on ua.pincode = p.pincode



-- br_id 
-- class 
-- stage
-- tsm
-- route
-- street
-- locality
-- contact_person
-- landline 
-- email
-- remarks