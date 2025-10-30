--
-- PostgreSQL database dump
--

-- Dumped from database version 17.4
-- Dumped by pg_dump version 17.4

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
-- Name: article_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.article_status AS ENUM (
    'draft',
    'published'
);


ALTER TYPE public.article_status OWNER TO postgres;

--
-- Name: event_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.event_status AS ENUM (
    'draft',
    'published',
    'processing'
);


ALTER TYPE public.event_status OWNER TO postgres;

--
-- Name: set_cinema_flag(); Type: FUNCTION; Schema: public; Owner: postgres
--

CREATE FUNCTION public.set_cinema_flag() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    IF NEW.section_id = (SELECT id FROM sections WHERE name = 'Cinéma') THEN
        NEW.is_cinema = TRUE;
    END IF;
    RETURN NEW;
END;
$$;


ALTER FUNCTION public.set_cinema_flag() OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: admin_password_reset; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_password_reset (
    reset_id integer NOT NULL,
    admin_id integer NOT NULL,
    reset_code character varying(20) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp with time zone NOT NULL,
    is_used boolean DEFAULT false NOT NULL
);


ALTER TABLE public.admin_password_reset OWNER TO postgres;

--
-- Name: admin_password_reset_reset_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_password_reset_reset_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_password_reset_reset_id_seq OWNER TO postgres;

--
-- Name: admin_password_reset_reset_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_password_reset_reset_id_seq OWNED BY public.admin_password_reset.reset_id;


--
-- Name: admin_permissions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_permissions (
    permission_id integer NOT NULL,
    admin_id integer NOT NULL,
    can_create_content boolean DEFAULT false NOT NULL,
    can_edit_content boolean DEFAULT false NOT NULL,
    can_delete_content boolean DEFAULT false NOT NULL,
    can_manage_users boolean DEFAULT false NOT NULL,
    can_view_analytics boolean DEFAULT false NOT NULL,
    can_manage_settings boolean DEFAULT false NOT NULL,
    can_manage_admins boolean DEFAULT false NOT NULL,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_permissions OWNER TO postgres;

--
-- Name: admin_permissions_permission_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_permissions_permission_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_permissions_permission_id_seq OWNER TO postgres;

--
-- Name: admin_permissions_permission_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_permissions_permission_id_seq OWNED BY public.admin_permissions.permission_id;


--
-- Name: admin_sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admin_sessions (
    session_id integer NOT NULL,
    admin_id integer NOT NULL,
    token character varying(255) NOT NULL,
    device_info character varying(255),
    ip_address character varying(45),
    is_valid boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    expires_at timestamp with time zone NOT NULL,
    last_activity timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admin_sessions OWNER TO postgres;

--
-- Name: admin_sessions_session_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admin_sessions_session_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_sessions_session_id_seq OWNER TO postgres;

--
-- Name: admin_sessions_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admin_sessions_session_id_seq OWNED BY public.admin_sessions.session_id;


--
-- Name: admins; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.admins (
    admin_id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    first_name character varying(100) NOT NULL,
    last_name character varying(100) NOT NULL,
    profile_image_url character varying(255),
    role character varying(20) DEFAULT 'editor'::character varying NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.admins OWNER TO postgres;

--
-- Name: admins_admin_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.admins_admin_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admins_admin_id_seq OWNER TO postgres;

--
-- Name: admins_admin_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.admins_admin_id_seq OWNED BY public.admins.admin_id;


--
-- Name: articles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.articles (
    id integer NOT NULL,
    title text NOT NULL,
    content text NOT NULL,
    category_id integer NOT NULL,
    section_id integer,
    status public.article_status DEFAULT 'draft'::public.article_status NOT NULL,
    image_url text,
    duration text,
    author_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    featured boolean DEFAULT false,
    is_story boolean DEFAULT false,
    story_expires_at timestamp without time zone,
    video_url text,
    views integer,
    is_cinema boolean DEFAULT false NOT NULL,
    is_comedy boolean DEFAULT false NOT NULL,
    is_sport boolean DEFAULT false NOT NULL,
    is_rap boolean DEFAULT false NOT NULL,
    is_afrotcham boolean DEFAULT false NOT NULL,
    is_buzz boolean DEFAULT false NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    is_alaune boolean DEFAULT false NOT NULL,
    alauneactual boolean DEFAULT false NOT NULL,
    videoactual boolean DEFAULT false NOT NULL,
    eventactual boolean DEFAULT false NOT NULL,
    mostread boolean DEFAULT false NOT NULL,
    science boolean DEFAULT false,
    is_artist boolean DEFAULT false,
    contenurecent boolean DEFAULT false NOT NULL
);


ALTER TABLE public.articles OWNER TO postgres;

--
-- Name: articles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.articles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.articles_id_seq OWNER TO postgres;

--
-- Name: articles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.articles_id_seq OWNED BY public.articles.id;


--
-- Name: categories; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    slug character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    description text
);


ALTER TABLE public.categories OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.categories_id_seq OWNER TO postgres;

--
-- Name: categories_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.events (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    category_id integer NOT NULL,
    location character varying(100) NOT NULL,
    venue character varying(100) NOT NULL,
    date timestamp with time zone NOT NULL,
    end_date timestamp with time zone,
    "time" character varying(50) NOT NULL,
    status public.event_status DEFAULT 'draft'::public.event_status NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    attendees integer DEFAULT 0,
    contact character varying(50) NOT NULL,
    tickets_available boolean DEFAULT false NOT NULL,
    ticket_price character varying(50),
    ticket_url text,
    organizer_id integer NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    image_url text
);


ALTER TABLE public.events OWNER TO postgres;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO postgres;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: gabonculture; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.gabonculture (
);


ALTER TABLE public.gabonculture OWNER TO postgres;

--
-- Name: login_attempts; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.login_attempts (
    attempt_id integer NOT NULL,
    username character varying(50),
    ip_address character varying(45) NOT NULL,
    user_agent text,
    success boolean NOT NULL,
    attempted_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.login_attempts OWNER TO postgres;

--
-- Name: login_attempts_attempt_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.login_attempts_attempt_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.login_attempts_attempt_id_seq OWNER TO postgres;

--
-- Name: login_attempts_attempt_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.login_attempts_attempt_id_seq OWNED BY public.login_attempts.attempt_id;


--
-- Name: sections; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sections (
    id integer NOT NULL,
    name character varying(50) NOT NULL,
    slug character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    description text
);


ALTER TABLE public.sections OWNER TO postgres;

--
-- Name: sections_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.sections_id_seq OWNER TO postgres;

--
-- Name: sections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sections_id_seq OWNED BY public.sections.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password_hash character varying(255) NOT NULL,
    role character varying(50) DEFAULT 'editor'::character varying NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    disabled boolean DEFAULT false NOT NULL,
    last_login timestamp with time zone,
    last_activity timestamp with time zone DEFAULT now(),
    status character varying DEFAULT 'active'::character varying NOT NULL,
    CONSTRAINT users_role_check CHECK (((role)::text = ANY (ARRAY[('admin'::character varying)::text, ('editor'::character varying)::text])))
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: admin_password_reset reset_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_password_reset ALTER COLUMN reset_id SET DEFAULT nextval('public.admin_password_reset_reset_id_seq'::regclass);


--
-- Name: admin_permissions permission_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions ALTER COLUMN permission_id SET DEFAULT nextval('public.admin_permissions_permission_id_seq'::regclass);


--
-- Name: admin_sessions session_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_sessions ALTER COLUMN session_id SET DEFAULT nextval('public.admin_sessions_session_id_seq'::regclass);


--
-- Name: admins admin_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins ALTER COLUMN admin_id SET DEFAULT nextval('public.admins_admin_id_seq'::regclass);


--
-- Name: articles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles ALTER COLUMN id SET DEFAULT nextval('public.articles_id_seq'::regclass);


--
-- Name: categories id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: login_attempts attempt_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_attempts ALTER COLUMN attempt_id SET DEFAULT nextval('public.login_attempts_attempt_id_seq'::regclass);


--
-- Name: sections id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sections ALTER COLUMN id SET DEFAULT nextval('public.sections_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: admin_password_reset; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_password_reset (reset_id, admin_id, reset_code, created_at, expires_at, is_used) FROM stdin;
\.


--
-- Data for Name: admin_permissions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_permissions (permission_id, admin_id, can_create_content, can_edit_content, can_delete_content, can_manage_users, can_view_analytics, can_manage_settings, can_manage_admins, updated_at) FROM stdin;
\.


--
-- Data for Name: admin_sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admin_sessions (session_id, admin_id, token, device_info, ip_address, is_valid, created_at, expires_at, last_activity) FROM stdin;
\.


--
-- Data for Name: admins; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.admins (admin_id, username, email, password_hash, first_name, last_name, profile_image_url, role, is_active, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: articles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.articles (id, title, content, category_id, section_id, status, image_url, duration, author_id, created_at, updated_at, featured, is_story, story_expires_at, video_url, views, is_cinema, is_comedy, is_sport, is_rap, is_afrotcham, is_buzz, is_featured, is_alaune, alauneactual, videoactual, eventactual, mostread, science, is_artist, contenurecent) FROM stdin;
64	Accueil	Accueil 2.0pro max	2	1	published	/static/uploads/images/34b0baee-984a-4f48-bd3a-6efd3160fe7f.png	\N	4	2025-05-03 12:16:54.641129-04	2025-05-03 12:16:54.641129-04	f	f	\N	\N	0	f	f	f	f	f	f	f	t	f	f	f	f	f	f	f
19	video	nian nian	2	10	published	/static/uploads/images/fabc1019-10e8-4f3a-86e8-c017411e7a57.jpg	\N	2	2025-04-24 08:26:42.133749-04	2025-05-03 11:05:07.970712-04	f	t	2025-04-25 08:26:40.418	/static/uploads/videos/a3e14a89-69af-425d-a783-81a130a455bf.mp4	33	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f
65	buzz	le moment trop de l afrotcham Ludovic	2	2	published	/static/uploads/images/c0fc29df-72cd-41e3-b6f0-084c4ba75744.jpg	\N	4	2025-05-03 12:37:00.530136-04	2025-05-03 12:38:00.757113-04	f	f	\N	/static/uploads/videos/299a4c43-baa4-4eb7-81dd-242c6eacff81.mp4	2	f	f	f	f	f	t	f	f	f	f	f	f	f	f	f
35	ftegtrh	fweafrrrrrrrrrrrrrrrrrrrrrvsv	2	6	published	/static/uploads/images/95645c59-9304-42d3-873a-756517befadd.jpg	\N	2	2025-04-25 09:55:42.880573-04	2025-05-03 11:06:13.402134-04	f	t	2025-04-26 09:55:42.852	\N	10	f	t	f	f	f	f	f	f	f	f	f	f	f	f	f
10	rrrr	moi sussi	2	10	published	/static/uploads/images/d1efa141-f902-4e03-a02c-c193f19cddb9.png	\N	2	2025-04-20 10:20:04.700373-04	2025-04-21 11:20:31.248531-04	f	t	2025-04-21 10:20:04.532	\N	6	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f
33	wwwd	d3d33edded	2	10	published	/static/uploads/images/fb2821e0-076e-46d4-8e4f-d5e4bf4429ee.jpg	\N	2	2025-04-25 09:46:53.556568-04	2025-05-03 12:38:20.956971-04	f	t	2025-04-26 09:46:53.421	\N	12	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f
66	;koko;kp	poo;kkkkkkkkkk	2	9	published	/static/uploads/images/4492dfe6-0d0d-47a5-a531-297bb063b525.jpg	\N	4	2025-05-03 12:41:17.10441-04	2025-05-03 12:48:30.402534-04	f	f	\N	\N	2	f	f	f	f	f	f	f	f	f	f	f	t	f	f	f
11	bttttttttttttttttttttttttdddddddv	cssssssffffffffffffffffffffffffffffffffffffyybbbbbbae	2	10	published	/static/uploads/images/af9de608-5d09-4ab8-b2c8-2ce378c7dfa9.png	\N	2	2025-04-20 11:49:11.280149-04	2025-04-21 11:21:02.004828-04	f	t	2025-04-21 11:49:11.11	\N	10	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f
16	gaboma	gabon culture 	2	10	published	/static/uploads/images/67a33ca3-f362-446c-aa6a-8d60eaae08a9.jpg	\N	2	2025-04-23 08:09:56.982597-04	2025-04-24 08:10:26.690762-04	f	t	2025-04-24 08:09:56.614	/static/uploads/videos/ca9f4d2f-c6cb-4901-8166-a03a5d6a3682.mp4	67	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f
9	moi 	meme	2	10	published	/static/uploads/images/919676de-fe16-4f58-9aa0-5dfc1117f3d4.png	\N	2	2025-04-20 10:16:53.842198-04	2025-04-21 06:10:29.371999-04	f	t	2025-04-21 10:16:53.806	\N	8	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f
17	image	test i2.0	2	10	published	/static/uploads/images/f038893a-5a4b-4683-9676-f0750a4c3249.jpg	\N	2	2025-04-23 09:38:02.909441-04	2025-04-24 09:22:46.705986-04	f	t	2025-04-24 09:38:02.046	\N	70	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f
49	alauneactual	alauneactual 2.0	17	11	published	/static/uploads/images/0f6b8b85-f3f7-4f02-b849-1a3d6ceb2667.jpg	\N	2	2025-04-28 10:41:28.791932-04	2025-04-28 11:33:57.367595-04	f	f	\N	\N	13	f	f	f	f	f	f	f	f	t	f	f	f	f	f	f
37	mml	,;,;,	2	10	published	/static/uploads/images/ca9d9aff-afde-4909-82ff-7b9531552ce4.jpg	\N	2	2025-04-26 10:28:03.843708-04	2025-04-26 20:25:05.913382-04	f	t	2025-04-27 10:28:03.728	\N	6	f	f	f	f	f	f	f	f	f	f	f	f	f	f	f
13	Meda	Unique vraiment une grande 	2	10	published	/static/uploads/images/cec60d4c-2fe5-4dd1-a6a1-2e3a47434afe.png	\N	2	2025-04-21 20:42:35.236377-04	2025-04-28 18:42:46.416416-04	f	t	2025-04-22 20:42:34.479	\N	6	f	f	f	f	f	f	f	f	f	f	t	f	f	f	f
\.


--
-- Data for Name: categories; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.categories (id, name, slug, created_at, description) FROM stdin;
1	Article	article	2025-04-14 10:44:41.981554-04	\N
2	Accueil	info	2025-04-14 10:44:41.981554-04	\N
3	Actualité	news	2025-04-14 10:44:41.981554-04	\N
4	Culture Urbaine	culture	2025-04-14 10:44:41.981554-04	\N
5	Science	science	2025-04-14 10:44:41.981554-04	\N
6	Economie	economy	2025-04-14 10:44:41.981554-04	\N
7	Santé	health	2025-04-14 10:44:41.981554-04	\N
8	Politique	politics	2025-04-14 10:44:41.981554-04	\N
9	Sport	sport	2025-04-14 10:44:41.981554-04	\N
10	AfroTcham	afrotcham	2025-04-14 10:44:41.981554-04	\N
11	Rap	rap	2025-04-14 10:44:41.981554-04	\N
12	Comédie	comedy	2025-04-14 10:44:41.981554-04	\N
13	Cinéma	cinema	2025-04-14 10:44:41.981554-04	\N
17	actualite	actualite	2025-04-27 12:36:50.695628-04	Actualités et événements culturels au Gabon
19	Recherche	recherche	2025-04-28 21:44:49.824445-04	\N
20	Technologies	technologies	2025-04-28 21:44:49.824445-04	\N
21	Environnement	environnement	2025-04-28 21:44:49.824445-04	\N
23	Biodiversité	biodiversite	2025-04-28 21:44:49.824445-04	\N
24	Innovation	innovation	2025-04-28 21:44:49.824445-04	\N
25	Développement Durable	developpement-durable	2025-04-28 21:44:49.824445-04	\N
26	Concert	concert	2025-05-02 12:00:00-04	\N
27	Festival	festival	2025-05-02 12:00:00-04	\N
28	Exposition	exposition	2025-05-02 12:00:00-04	\N
29	Conférence	conference	2025-05-02 12:00:00-04	\N
30	Atelier	atelier	2025-05-02 12:00:00-04	\N
31	Compétition	competition	2025-05-02 12:00:00-04	\N
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.events (id, title, description, category_id, location, venue, date, end_date, "time", status, is_featured, attendees, contact, tickets_available, ticket_price, ticket_url, organizer_id, created_at, updated_at, image_url) FROM stdin;
1	fetisval	festival de la grande star de l afrotcham Ludovic	27	Libreville	place de l'independance	2025-05-02 00:00:00-04	2025-05-04 00:00:00-04	10h30 -12h00	published	t	198	074131313	t	5000 cfa	\N	3	2025-05-02 12:07:47.07293-04	2025-05-02 12:07:47.07293-04	\N
2	fetisval	festival de la grande star de l afrotcham Ludovic	27	Libreville	place de l'independance	2025-05-02 00:00:00-04	2025-05-04 00:00:00-04	10h30 -12h00	published	t	198	074131313	t	5000 cfa	\N	3	2025-05-02 12:21:12.991507-04	2025-05-02 12:21:12.991507-04	\N
3	Concert	le grand Fabrice concert sera dispo samedi a 11h venez nombre il y aura des iphones gratuitsssss Iphone205  pro maxxxxxxxxx	26	Libreville	place de l'independance	2025-05-03 00:00:00-04	2025-05-05 00:00:00-04	11h00-15h00	published	t	200	074505050	t	5000 cfa		3	2025-05-02 20:17:15.042544-04	2025-05-02 20:17:15.042544-04	/static/images/Snapshot_2025-02-13_12-25-48.png
4	Expo	lmolppompooooooooooooooo	28	Libreville	place de l'independance	2025-05-02 20:00:00-04	2025-05-02 20:00:00-04	10h30 -12h00	published	t	100	99999999999999	f	\N	\N	4	2025-05-03 12:26:20.261426-04	2025-05-03 12:26:20.261426-04	/static/images/Snapshot_2025-03-28_11-40-24.png
5	Confe	jvgjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjjh	29	Libreville	place de l'independance	2025-05-02 20:00:00-04	2025-05-03 20:00:00-04	10h30 -12h00	published	t	52	99999999999999	f	\N	\N	4	2025-05-03 12:52:54.994607-04	2025-05-03 12:52:54.994607-04	/static/images/danse.jpg
\.


--
-- Data for Name: gabonculture; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.gabonculture  FROM stdin;
\.


--
-- Data for Name: login_attempts; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.login_attempts (attempt_id, username, ip_address, user_agent, success, attempted_at) FROM stdin;
\.


--
-- Data for Name: sections; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sections (id, name, slug, created_at, description) FROM stdin;
1	À la Une	aLaUne	2025-04-14 10:44:25.04249-04	\N
2	Buzz du Moment	buzz	2025-04-14 10:44:25.04249-04	\N
3	AfroTcham	afroTcham	2025-04-14 10:44:25.04249-04	\N
4	Rap Gabonais	rap	2025-04-14 10:44:25.04249-04	\N
5	Sport National	sport	2025-04-14 10:44:25.04249-04	\N
6	Comédie	comedy	2025-04-14 10:44:25.04249-04	\N
7	Cinéma	cinema	2025-04-14 10:44:25.04249-04	\N
8	Dernières Actualités	latestNews	2025-04-14 10:44:25.04249-04	\N
9	Les Plus Lus	mostRead	2025-04-14 10:44:25.04249-04	\N
10	Stories	stories	2025-04-14 10:44:25.04249-04	\N
11	alauneactual	alauneactual	2025-04-28 10:13:33.605234-04	Articles à la Une
12	videos	videos	2025-04-28 10:13:33.605234-04	Recent Videos
13	events	events	2025-04-28 10:13:33.605234-04	Upcoming Events
14	Science	science	2025-04-28 20:58:14.542612-04	Articles scientifiques et technologiques
16	Technologies	technologies	2025-04-28 22:48:06.060739-04	\N
17	Environnement	environnement	2025-04-28 22:48:06.060739-04	\N
18	Santé	sante	2025-04-28 22:48:06.060739-04	\N
19	Biodiversité	biodiversite	2025-04-28 22:48:06.060739-04	\N
20	Innovation	innovation	2025-04-28 22:48:06.060739-04	\N
21	Développement Durable	developpement-durable	2025-04-28 22:48:06.060739-04	\N
22	Recherche	recherche	2025-04-28 22:48:06.060739-04	\N
24	Contenus Récents	contenus-recents	2025-04-29 21:21:48.909816-04	\N
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, email, password_hash, role, created_at, disabled, last_login, last_activity, status) FROM stdin;
2	gcadmin	admin@gcutv.com	$2b$12$ymz2ZRJAmXKAvvXk96LcEerX5splmNb.muEURVxapTgh6pN0DXEL6	admin	2025-04-19 17:23:06.783506-04	f	2025-04-30 20:01:45.515153-04	2025-04-30 22:03:51.212416-04	active
4	BOUTSIMA Ludovic	lucmoukagha@gmail.com	$2b$12$3NvLagm9JGdyFbzE/dlNhuwftodCEhfXBVXvFqrDx414YUdVTytu.	admin	2025-05-03 11:00:37.348269-04	f	2025-05-03 17:59:28.617373-04	2025-05-03 18:08:52.306744-04	active
3	Melvinanzamba	melvinanzamba@gmail.com	$2b$12$dEUQuhUK6LUlswqyokdmee/7XCOYPEoA5vhv0vOAJmiAH1HOjn9CS	admin	2025-04-30 20:29:42.669198-04	f	2025-05-03 14:45:59.510796-04	2025-05-03 15:00:39.181392-04	active
\.


--
-- Name: admin_password_reset_reset_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_password_reset_reset_id_seq', 1, false);


--
-- Name: admin_permissions_permission_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_permissions_permission_id_seq', 1, false);


--
-- Name: admin_sessions_session_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admin_sessions_session_id_seq', 1, false);


--
-- Name: admins_admin_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.admins_admin_id_seq', 1, false);


--
-- Name: articles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.articles_id_seq', 66, true);


--
-- Name: categories_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.categories_id_seq', 34, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.events_id_seq', 5, true);


--
-- Name: login_attempts_attempt_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.login_attempts_attempt_id_seq', 1, false);


--
-- Name: sections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sections_id_seq', 24, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 4, true);


--
-- Name: admin_password_reset admin_password_reset_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_password_reset
    ADD CONSTRAINT admin_password_reset_pkey PRIMARY KEY (reset_id);


--
-- Name: admin_permissions admin_permissions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_pkey PRIMARY KEY (permission_id);


--
-- Name: admin_sessions admin_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_pkey PRIMARY KEY (session_id);


--
-- Name: admins admins_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_email_key UNIQUE (email);


--
-- Name: admins admins_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_pkey PRIMARY KEY (admin_id);


--
-- Name: admins admins_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admins
    ADD CONSTRAINT admins_username_key UNIQUE (username);


--
-- Name: articles articles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_pkey PRIMARY KEY (id);


--
-- Name: categories categories_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);


--
-- Name: categories categories_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);


--
-- Name: categories categories_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_slug_key UNIQUE (slug);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: login_attempts login_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.login_attempts
    ADD CONSTRAINT login_attempts_pkey PRIMARY KEY (attempt_id);


--
-- Name: sections sections_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_name_key UNIQUE (name);


--
-- Name: sections sections_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_pkey PRIMARY KEY (id);


--
-- Name: sections sections_slug_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sections
    ADD CONSTRAINT sections_slug_key UNIQUE (slug);


--
-- Name: users users_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);


--
-- Name: idx_admin_sessions_admin_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_sessions_admin_id ON public.admin_sessions USING btree (admin_id);


--
-- Name: idx_admin_sessions_token; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admin_sessions_token ON public.admin_sessions USING btree (token);


--
-- Name: idx_admins_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admins_email ON public.admins USING btree (email);


--
-- Name: idx_admins_username; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_admins_username ON public.admins USING btree (username);


--
-- Name: idx_articles_author_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_articles_author_id ON public.articles USING btree (author_id);


--
-- Name: idx_articles_category_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_articles_category_id ON public.articles USING btree (category_id);


--
-- Name: idx_articles_section_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_articles_section_id ON public.articles USING btree (section_id);


--
-- Name: idx_articles_status; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_articles_status ON public.articles USING btree (status);


--
-- Name: idx_articles_title; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_articles_title ON public.articles USING btree (title);


--
-- Name: idx_login_attempts_ip; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_login_attempts_ip ON public.login_attempts USING btree (ip_address);


--
-- Name: articles enforce_cinema_flag; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER enforce_cinema_flag BEFORE INSERT OR UPDATE ON public.articles FOR EACH ROW EXECUTE FUNCTION public.set_cinema_flag();


--
-- Name: admin_password_reset admin_password_reset_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_password_reset
    ADD CONSTRAINT admin_password_reset_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(admin_id) ON DELETE CASCADE;


--
-- Name: admin_permissions admin_permissions_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_permissions
    ADD CONSTRAINT admin_permissions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(admin_id) ON DELETE CASCADE;


--
-- Name: admin_sessions admin_sessions_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.admin_sessions
    ADD CONSTRAINT admin_sessions_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.admins(admin_id) ON DELETE CASCADE;


--
-- Name: articles articles_author_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_author_id_fkey FOREIGN KEY (author_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- Name: articles articles_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- Name: articles articles_section_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.articles
    ADD CONSTRAINT articles_section_id_fkey FOREIGN KEY (section_id) REFERENCES public.sections(id) ON DELETE SET NULL;


--
-- Name: events fk_category; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT fk_category FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE RESTRICT;


--
-- Name: events fk_organizer; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT fk_organizer FOREIGN KEY (organizer_id) REFERENCES public.users(id) ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

