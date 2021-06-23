with bd_tl_mapping as (
select 
    tbl_admin.admin_id as  bd_id,
    username as bd_user_name,
    phone_number as bd_phonenumber,
    leader_id 
from tbl_admin 
left join bd_leader_mapping on tbl_admin.admin_id = bd_leader_mapping.admin_id
where tbl_admin.admin_id in(90,3614,3615,3616,5069,1368,3617,3618,84,4795,5483,3620,4186,1133,60,3621,3622,1001,3625,5138,3624,3633,3626,2918,3635,3628,3629,4951,1210,555,5482,4964,5481) 
)

,cte_cl_income as (
        select  team_leaders.id ,
            sum(amount) as CL_income
        from wallet_transactions 
        left join team_leaders on team_leaders.user_id = wallet_transactions.user_id 
        where type in ('bonus-commission-credit','commission-credit','commission-credit')
        and wallet_transactions.status in ('processed','processing')
        and date(wallet_transactions.created_at) between {{from_date}} and {{to_date}}
        group by 1 
    )
            
,first_order_cx as (
select  user_id  , 
        min(processing_at) as first_order_date
                from orders 
                    where order_status <> 'CANCELLED' and order_status <> 'CREATED'
                    group by 1 )

,cx_repeat_rate as (
select
        orders.team_leader ,
        ( count(  order_id)/ count( distinct user_id)) as repeat_rate 
from orders 
where   order_status <> 'CANCELLED' 
 and     user_id not in ( select user_id from first_order_cx where date_trunc('month',first_order_date) = date_trunc('month',{{to_date}}) )
     and    date_trunc('month',processing_at) = date_trunc('month',{{to_date}})
 group by 1)
 
 
,dormant_customers as (
select team_leader , count(distinct user_id ) no_of_dormant_cust
from orders 
    where order_status not in ('CANCELLED','CREATED')
    AND user_id not in (select user_id from orders where date(processing_at) >= date({{to_date}})-15 and order_status <> 'CANCELLED' )
    and    date_trunc('month',processing_at) = date_trunc('month',date({{to_date}})-interval'1'month)
    group by 1 
)

,Final_base as (
select 
    orders.team_leader ,
    case when SUM(case when to_char(orders.created_at,'YYYY-MM-DD')::date = CURRENT_DATE then 1 else 0 end) > 0 then 1 else 0 end as currently_active,
    sum(total_after_discount) as GMV,
    sum(case when to_char(order_items.created_at,'YYYY-MM-DD')::date = CURRENT_DATE then total_after_discount end) as daily_GMV,   
    COUNT(DISTINCT (CASE WHEN DATE (DATE_TRUNC('day',orders.processing_at)) = f.first_order_date THEN orders.user_id END)) AS new_cx,
    COUNT(DISTINCT (CASE WHEN DATE (DATE_TRUNC('day',orders.processing_at)) != f.first_order_date THEN orders.user_id END)) AS repeat_cx,
    ( NULLIF(SUM(CASE WHEN super_category in ('Atta, Sugar, Oil & Ghee') THEN total_after_discount ELSE 0 END),0)*1.0/NULLIF(SUM(total_after_discount),0)) *100 as ASOG_GMV_perc,
    SUM(case when order_item_status ='RTO' then total_after_discount end) as RTO_GMV
from orders
left join order_items on orders.order_id = order_items.order_id
LEFT JOIN (
            SELECT user_id,
                    MIN(DATE (DATE_TRUNC('day',processing_at))) AS first_order_date,
                    MIN(order_id) as first_order_id,
                    MIN(CASE WHEN DATE (DATE_TRUNC('month',processing_at)) = DATE (DATE_TRUNC('month',CURRENT_DATE)) THEN DATE (processing_at) END) AS first_order_date_cm,
                    MAX(CASE WHEN DATE (processing_at) < DATE (DATE_TRUNC('month',CURRENT_DATE)) THEN DATE (processing_at) END) AS max_order_date_exc_cm,
                    MIN(CASE WHEN DATE (DATE_TRUNC('month',processing_at)) = DATE (DATE_TRUNC('month',CURRENT_DATE)) THEN DATE (processing_at) END) -MAX(CASE WHEN DATE (processing_at) < DATE (DATE_TRUNC('month',CURRENT_DATE)) THEN DATE (processing_at) END) AS days_resurrect,
                    COUNT(DISTINCT order_id) AS no_of_orders
                    
                    FROM orders
                    where order_status NOT IN ('CANCELLED','CREATED')
                    
                    GROUP BY 1
            )f ON f.user_id = orders.user_id
   left  JOIN product_with_categories pc ON pc.sku_id = order_items.sku_id and order_items.catalogue_name=pc.catalogue_name

where order_status NOT IN ('CANCELLED','CREATED')
and date(processing_at) between {{from_date}} and {{to_date}}
group by 1 )

select
    bd_id,
    sum(new_cx) as new_cx,
    sum(repeat_cx) as repeat_cx,
    sum(daily_GMV) as daily_gmv,
    sum(GMV) as mtd_gmv,
    sum(no_of_dormant_cust) as no_of_dormant_cust,
    count(cl_id) as cl_count,
    sum(CL_income) as cl_income,
    sum(RTO_GMV) as customer_rto,
    (sum(ASOG_GMV_perc)/coalesce(nullif(count(cl_id),0),1)) as asog_gmv_perc,
    (sum(gmv)/extract(days FROM date_trunc('month', now()) + interval '1 month - 1 day')) as current_ddr,
    (sum(gmv)/coalesce(nullif(count(cl_id),0),1)) as avg_gmv_per_cl,
    count(currently_active) as daily_active_cl
from
(select 
    bd_user_name,
    bd_id,
    leader_id as cl_id,
    team_leader_view.city,
    to_char(team_leader_view.team_leader_created_at,'YYYY-MM') cl_created_month, 
    CL_income,
    GMV,
    daily_GMV,
    new_cx,
    repeat_cx,
    repeat_rate,
    no_of_dormant_cust,
    currently_active,
    coalesce(ASOG_GMV_perc,0) ASOG_GMV_perc,
    coalesce(RTO_GMV,0) RTO_GMV
from 
bd_tl_mapping 
left join team_leader_view on team_leader_view.id = bd_tl_mapping.leader_id
left join Final_base on Final_base.team_leader = bd_tl_mapping.leader_id
left join cte_cl_income on cte_cl_income.id = bd_tl_mapping.leader_id
left join cx_repeat_rate on cx_repeat_rate.team_leader = bd_tl_mapping.leader_id
left join dormant_customers on dormant_customers.team_leader = bd_tl_mapping.leader_id) x

group by (x.bd_id)
