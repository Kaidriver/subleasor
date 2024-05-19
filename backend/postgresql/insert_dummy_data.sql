INSERT INTO users_dev(username)
VALUES
	('user1'), ('user2'), ('user3');

INSERT INTO properties_dev (property_id, username, street, street2, city, st, postal, coordinates, post_date)
VALUES
  ('a8d8b8dc-950b-4367-b1dc-f68a5fd06d34', 'user1', '1234 Maple Street', null, 'Chicago', 'IL', '23456', ST_GeomFromText('POINT(-77.242924 39.093227)', 4326), '2024-05-18'), 
  ('17ffdfe3-5fb7-42e1-865f-f6099dfd563c', 'user2', '4321 Fields Street', null, 'Chicago', 'IL', '23456', ST_GeomFromText('POINT(-77.235028 39.094409)', 4326), '2024-05-15'),
  ('92c659ae-1319-4616-9398-1d49a0936c63', 'user3', '3212 Mars Road', null, 'Chicago', 'IL', '43234', ST_GeomFromText('POINT(-77.238096 39.097090)', 4326), '2024-05-17');
