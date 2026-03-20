CREATE EXTENSION IF NOT EXISTS postgis;

ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS location_geog GEOGRAPHY(POINT, 4326);

UPDATE user_profiles
SET location_geog = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)::geography
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_user_profiles_location_geog 
ON user_profiles USING GIST (location_geog);
