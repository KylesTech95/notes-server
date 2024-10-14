--
-- PostgreSQL database dump
--

-- Dumped from database version 17rc1
-- Dumped by pg_dump version 17rc1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: expired_note(); Type: FUNCTION; Schema: public; Owner: Daddy
--

CREATE FUNCTION public.expired_note() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
delete from notepad where timestamp < current_timestamp - interval '30 minutes';
return null;
end;
$$;


ALTER FUNCTION public.expired_note() OWNER TO "Daddy";

--
-- Name: expired_user(); Type: FUNCTION; Schema: public; Owner: Daddy
--

CREATE FUNCTION public.expired_user() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
delete from users where timestamp < current_timestamp - interval '30 minutes';
return null;
end;
$$;


ALTER FUNCTION public.expired_user() OWNER TO "Daddy";

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: notepad; Type: TABLE; Schema: public; Owner: Daddy
--

CREATE TABLE public.notepad (
    id integer NOT NULL,
    notes json NOT NULL,
    user_id character varying(60) NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.notepad OWNER TO "Daddy";

--
-- Name: notepad_id_seq; Type: SEQUENCE; Schema: public; Owner: Daddy
--

CREATE SEQUENCE public.notepad_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notepad_id_seq OWNER TO "Daddy";

--
-- Name: notepad_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: Daddy
--

ALTER SEQUENCE public.notepad_id_seq OWNED BY public.notepad.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: Daddy
--

CREATE TABLE public.users (
    id character varying(65),
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public.users OWNER TO "Daddy";

--
-- Name: notepad id; Type: DEFAULT; Schema: public; Owner: Daddy
--

ALTER TABLE ONLY public.notepad ALTER COLUMN id SET DEFAULT nextval('public.notepad_id_seq'::regclass);


--
-- Data for Name: notepad; Type: TABLE DATA; Schema: public; Owner: Daddy
--

COPY public.notepad (id, notes, user_id, "timestamp") FROM stdin;
7	{"something":55,"monkey":233}	94	2024-10-14 18:44:23.437017
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: Daddy
--

COPY public.users (id, "timestamp") FROM stdin;
41de9865acb407ce7df56fa4086f7263fa13d24b	2024-10-14 18:18:40.909203
893247983247	2024-10-14 18:40:17.457167
\.


--
-- Name: notepad_id_seq; Type: SEQUENCE SET; Schema: public; Owner: Daddy
--

SELECT pg_catalog.setval('public.notepad_id_seq', 7, true);


--
-- Name: notepad notepad_pkey; Type: CONSTRAINT; Schema: public; Owner: Daddy
--

ALTER TABLE ONLY public.notepad
    ADD CONSTRAINT notepad_pkey PRIMARY KEY (id);


--
-- Name: notepad expired_note; Type: TRIGGER; Schema: public; Owner: Daddy
--

CREATE TRIGGER expired_note AFTER INSERT ON public.notepad FOR EACH STATEMENT EXECUTE FUNCTION public.expired_note();


--
-- Name: users expired_user; Type: TRIGGER; Schema: public; Owner: Daddy
--

CREATE TRIGGER expired_user BEFORE INSERT ON public.users FOR EACH STATEMENT EXECUTE FUNCTION public.expired_user();


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: pg_database_owner
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT CREATE ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

