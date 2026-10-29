-- Razorpay checkout: each order keeps the Razorpay order it is paid through, and the payment
-- that paid it. Payments are verified by signature on our server before an order is marked paid.

alter table orders add column if not exists razorpay_order_id text;
alter table orders add column if not exists razorpay_payment_id text;

create unique index if not exists orders_razorpay_order_id_key on orders (razorpay_order_id) where razorpay_order_id is not null;
