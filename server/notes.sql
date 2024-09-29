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

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: notepad; Type: TABLE; Schema: public; Owner: Daddy
--

CREATE TABLE public.notepad (
    id integer NOT NULL,
    notes text NOT NULL,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    user_id character varying(65)
);


ALTER TABLE public.notepad OWNER TO "Daddy";

--
-- Name: users; Type: TABLE; Schema: public; Owner: Daddy
--

CREATE TABLE public.users (
    id character varying(65) NOT NULL
);


ALTER TABLE public.users OWNER TO "Daddy";

--
-- Data for Name: notepad; Type: TABLE DATA; Schema: public; Owner: Daddy
--

COPY public.notepad (id, notes, "timestamp", user_id) FROM stdin;
1	one	2024-09-29 12:31:04.755884	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: Daddy
--

COPY public.users (id) FROM stdin;
\.


--
-- Name: notepad notepad_pkey; Type: CONSTRAINT; Schema: public; Owner: Daddy
--

ALTER TABLE ONLY public.notepad
    ADD CONSTRAINT notepad_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: Daddy
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: notepad notepad_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: Daddy
--

ALTER TABLE ONLY public.notepad
    ADD CONSTRAINT notepad_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

