-- New orders get Aavjoo order codes (AAV-1005, AAV-1006 …). Existing NIM- codes stay as they are.
alter table orders alter column code set default ('AAV-' || nextval('order_number_seq'));
