from spyne import Array, Boolean, Enum, Integer, String
from spyne.model.complex import ComplexModel

from enums.GamePhase import GamePhase


class Opponent(ComplexModel):
    __type_name__ = "opponent"
    id = String
    name = String
    isEliminated = Boolean


class GameTurn(ComplexModel):
    __type_name__ = "gameTurn"
    playerId = String
    phase = String


class GetGameStateResponse(ComplexModel):
    map = Array(Integer)
    opponents = Array(Opponent)
    gameTurn = GameTurn
    lastActivity = String
    winner = String
