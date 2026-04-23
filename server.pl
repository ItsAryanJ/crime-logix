% ============================================================
% server.pl — HTTP Server (Main Entry Point)
% Crime Investigation Expert System
% ============================================================
% Run with: swipl server.pl
% Access at: http://localhost:5000
% ============================================================

:- use_module(library(http/thread_httpd)).
:- use_module(library(http/http_dispatch)).
:- use_module(library(http/http_json)).
:- use_module(library(http/http_files)).
:- use_module(library(http/http_parameters)).
:- use_module(library(http/html_write)).

% Load all project modules
:- consult(knowledge_base).
:- consult(rules).
:- consult(contradiction).
:- consult(ranking).
:- consult(explanation).

% ------------------------------------------------------------
% HTTP Route Handlers
% ------------------------------------------------------------

% Exact match for root → serve index.html
:- http_handler(root(.),           serve_index,     []).
% API endpoints
:- http_handler(root('api/analyze'),  handle_analyze,  []).
:- http_handler(root('api/results'),  handle_results,  []).
% Prefix match for all other static files
:- http_handler(root(.),           serve_static,    [prefix]).

% ------------------------------------------------------------
% serve_index/1
% Serves the main index.html page at /
% ------------------------------------------------------------
serve_index(Request) :-
    http_reply_file('frontend/index.html', [], Request).

% ------------------------------------------------------------
% serve_static/1
% Serves static files (CSS, JS, etc.) from the frontend/ dir
% ------------------------------------------------------------
serve_static(Request) :-
    http_reply_from_files('frontend', [], Request).

% Fallback: if static file not found, serve index
serve_static(Request) :-
    http_reply_file('frontend/index.html', [], Request).

% ------------------------------------------------------------
% handle_analyze/1
% POST /api/analyze — Main analysis endpoint
% Accepts JSON, runs full investigation, returns results.
% ------------------------------------------------------------
handle_analyze(Request) :-
    % Handle CORS preflight
    member(method(options), Request), !,
    format('Content-type: text/plain~n'),
    format('Access-Control-Allow-Origin: *~n'),
    format('Access-Control-Allow-Methods: POST, GET, OPTIONS~n'),
    format('Access-Control-Allow-Headers: Content-Type~n~n').

handle_analyze(Request) :-
    member(method(post), Request), !,
    catch(
        run_analysis(Request),
        Error,
        handle_error(Error)
    ).

handle_analyze(_Request) :-
    reply_json_dict(_{error: "Method not allowed. Use POST."}, [status(405)]).

% ------------------------------------------------------------
% run_analysis/1
% Core analysis pipeline.
% ------------------------------------------------------------
run_analysis(Request) :-
    % Read JSON body
    http_read_json_dict(Request, Data),

    % Clear previous facts
    clear_facts,

    % Load data from JSON into knowledge base
    get_dict(suspects, Data, Suspects),
    get_dict(evidence, Data, Evidence),
    get_dict(statements, Data, Statements),
    load_suspects(Suspects),
    load_evidence(Evidence),
    load_statements(Statements),

    % Run inference and analysis
    rank_suspects(Ranked),
    find_contradictions(Contradictions),
    generate_full_explanation(Ranked, Explanation),

    % Format results for JSON output
    format_ranking_json(Ranked, RankingJSON),
    format_contradictions_json(Contradictions, ContraJSON),
    determine_most_likely(Ranked, MostLikely),

    % Build result dict
    Result = _{
        ranking: RankingJSON,
        most_likely: MostLikely,
        contradictions: ContraJSON,
        explanation: Explanation
    },

    % Store for GET /api/results
    retractall(last_results(_)),
    assertz(last_results(Result)),

    % Send response
    reply_json_dict(Result).

% ------------------------------------------------------------
% handle_results/1
% GET /api/results — Returns last computed results.
% ------------------------------------------------------------
handle_results(_Request) :-
    last_results(Result), !,
    reply_json_dict(Result).

handle_results(_Request) :-
    reply_json_dict(_{error: "No analysis has been run yet. POST to /api/analyze first."}, [status(404)]).

% ------------------------------------------------------------
% handle_error/1
% Returns a JSON error response.
% ------------------------------------------------------------
handle_error(Error) :-
    term_string(Error, ErrorStr),
    reply_json_dict(_{error: ErrorStr}, [status(500)]).

% ------------------------------------------------------------
% JSON Formatting Helpers
% ------------------------------------------------------------

% Convert ranked list to JSON-friendly list of dicts
format_ranking_json([], []).
format_ranking_json([Score-Suspect|Rest], [Dict|RestDicts]) :-
    Dict = _{suspect: Suspect, score: Score},
    format_ranking_json(Rest, RestDicts).

% Convert contradiction terms to human-readable strings
format_contradictions_json([], []).
format_contradictions_json([contradiction(Suspect, W1, Claim1, W2, Claim2)|Rest], [Str|RestStrs]) :-
    format(atom(Str),
        "Contradiction about ~w: ~w claims '~w' but ~w claims '~w'",
        [Suspect, W1, Claim1, W2, Claim2]),
    format_contradictions_json(Rest, RestStrs).

% Determine the most likely suspect from ranking
determine_most_likely([Score-Suspect|_], Suspect) :- Score > 0, !.
determine_most_likely(_, "No clear suspect").

% ------------------------------------------------------------
% Server Startup
% ------------------------------------------------------------
start_server :-
    Port = 5000,
    http_server(http_dispatch, [port(Port)]),
    format('~n========================================~n'),
    format('  Crime Investigation Expert System~n'),
    format('  Server running on port ~w~n', [Port]),
    format('  Open: http://localhost:~w~n', [Port]),
    format('========================================~n~n').

:- initialization(start_server).
