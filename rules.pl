% ============================================================
% rules.pl — Inference Engine
% Crime Investigation Expert System
% ============================================================
% Rule-based logic for inferring suspect attributes.
% ============================================================

% ------------------------------------------------------------
% has_motive/1
% True if any witness claims the suspect has a motive.
% ------------------------------------------------------------
has_motive(X) :-
    suspect(X),
    witness_statement(_, X, has_motive), !.

% ------------------------------------------------------------
% was_present/1
% True if any witness places the suspect at the crime scene.
% ------------------------------------------------------------
was_present(X) :-
    suspect(X),
    witness_statement(_, X, was_at_scene), !.

% ------------------------------------------------------------
% linked_to_evidence/1
% True if physical evidence is linked to the suspect.
% ------------------------------------------------------------
linked_to_evidence(X) :-
    suspect(X),
    evidence(_, _, X), !.

% ------------------------------------------------------------
% evidence_count/2
% Counts the number of evidence items linked to a suspect.
% ------------------------------------------------------------
evidence_count(Suspect, Count) :-
    findall(1, evidence(_, _, Suspect), Ones),
    length(Ones, Count).

% ------------------------------------------------------------
% has_alibi/1
% True if any witness claims the suspect has an alibi.
% ------------------------------------------------------------
has_alibi(X) :-
    suspect(X),
    witness_statement(_, X, has_alibi), !.

% ------------------------------------------------------------
% is_suspicious/1
% True if any witness says the suspect is suspicious.
% ------------------------------------------------------------
is_suspicious(X) :-
    suspect(X),
    witness_statement(_, X, is_suspicious), !.

% ------------------------------------------------------------
% guilty/1
% Combined inference: suspect with motive, presence, and evidence.
% ------------------------------------------------------------
guilty(X) :-
    suspect(X),
    has_motive(X),
    was_present(X),
    linked_to_evidence(X).
