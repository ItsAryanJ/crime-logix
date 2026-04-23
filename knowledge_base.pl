% ============================================================
% knowledge_base.pl — Dynamic Fact Store
% Crime Investigation Expert System
% ============================================================
% Stores suspects, evidence, and witness statements.
% Facts are asserted/retracted dynamically per analysis run.
% ============================================================

:- dynamic suspect/1.
:- dynamic evidence/3.            % evidence(Type, Description, LinkedSuspect)
:- dynamic witness_statement/3.   % witness_statement(Witness, Suspect, Claim)
:- dynamic last_results/1.        % Stores last analysis results for GET /api/results

% ------------------------------------------------------------
% clear_facts/0
% Retracts all dynamic facts before a new analysis.
% ------------------------------------------------------------
clear_facts :-
    retractall(suspect(_)),
    retractall(evidence(_, _, _)),
    retractall(witness_statement(_, _, _)).

% ------------------------------------------------------------
% load_suspects/1
% Asserts suspect facts from a JSON list of names.
% ------------------------------------------------------------
load_suspects([]).
load_suspects([S|Rest]) :-
    (atom(S) -> SA = S ; atom_string(SA, S)),
    (suspect(SA) -> true ; assertz(suspect(SA))),
    load_suspects(Rest).

% ------------------------------------------------------------
% load_evidence/1
% Asserts evidence facts from a JSON list of evidence dicts.
% Each dict has keys: type, description, suspect
% ------------------------------------------------------------
load_evidence([]).
load_evidence([E|Rest]) :-
    get_dict(type, E, TypeStr),
    get_dict(description, E, DescStr),
    get_dict(suspect, E, SuspectStr),
    (atom(TypeStr) -> Type = TypeStr ; atom_string(Type, TypeStr)),
    (atom(DescStr) -> Desc = DescStr ; atom_string(Desc, DescStr)),
    (atom(SuspectStr) -> Suspect = SuspectStr ; atom_string(Suspect, SuspectStr)),
    assertz(evidence(Type, Desc, Suspect)),
    load_evidence(Rest).

% ------------------------------------------------------------
% load_statements/1
% Asserts witness_statement facts from a JSON list of dicts.
% Each dict has keys: witness, suspect, claim
% ------------------------------------------------------------
load_statements([]).
load_statements([S|Rest]) :-
    get_dict(witness, S, WitnessStr),
    get_dict(suspect, S, SuspectStr),
    get_dict(claim, S, ClaimStr),
    (atom(WitnessStr) -> Witness = WitnessStr ; atom_string(Witness, WitnessStr)),
    (atom(SuspectStr) -> Suspect = SuspectStr ; atom_string(Suspect, SuspectStr)),
    (atom(ClaimStr) -> Claim = ClaimStr ; atom_string(Claim, ClaimStr)),
    assertz(witness_statement(Witness, Suspect, Claim)),
    load_statements(Rest).
