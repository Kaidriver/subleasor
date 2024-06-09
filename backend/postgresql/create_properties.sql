CREATE TABLE users_dev (
	username UUID NOT NULL,
	given_name varchar(255) NOT NULL,
	family_name varchar(255) NOT NULL,
	email varchar(255) NOT NULL,
	PRIMARY KEY(username)
);

CREATE TABLE properties_dev (
	property_id UUID NOT NULL,
	username UUID NOT NULL,
	street varchar(255) NOT NULL,
	street2 varchar(255),
	city varchar(255) NOT NULL,
	st varchar(255) NOT NULL,
	postal integer NOT NULL,
	coordinates geometry NOT NULL,
	post_date date NOT NULL,
	PRIMARY KEY(property_id),
	CONSTRAINT unique_username
		FOREIGN KEY(username)
		REFERENCES users_dev(username)
);

CREATE INDEX properties_geom_idx
	ON properties_dev
	USING GIST(coordinates)

