from spyne import Unicode
from spyne.decorator import rpc
from spyne.service import ServiceBase

from models.Response.GetGameState import (GameTurn, GetGameStateResponse,
                                          Opponent)


class getGameStateController(ServiceBase):
    @rpc(Unicode, _returns=GetGameStateResponse)
    def getGameState(self, gameId):
        print(gameId)
        return GetGameStateResponse(map=['0', '1', '2', '3', '4', '5', '6'],
                                    opponents=[Opponent(id='1', name='Hieu', isEliminated=False),
                                               Opponent(id='2', name='Huy', isEliminated=False)],
                                    gameTurn=GameTurn(
                                        playerId='1', phase="a"),
                                    lastActivity='2023-03-27T13:30:00Z',
                                    winner=None)


class reinforce(ServiceBase):
    @rpc(Unicode, _returns=GetGameStateResponse)
    def getGameState(self, gameId):
        print(gameId)
        return GetGameStateResponse(map=['0', '1', '2', '3', '4', '5', '6'],
                                    opponents=[Opponent(id='1', name='Hieu', isEliminated=False),
                                               Opponent(id='2', name='Huy', isEliminated=False)],
                                    gameTurn=GameTurn(
                                        playerId='1', phase="a"),
                                    lastActivity='2023-03-27T13:30:00Z',
                                    winner=None)


class attack(ServiceBase):
    @rpc(Unicode, _returns=GetGameStateResponse)
    def getGameState(self, gameId):
        print(gameId)
        return GetGameStateResponse(map=['0', '1', '2', '3', '4', '5', '6'],
                                    opponents=[Opponent(id='1', name='Hieu', isEliminated=False),
                                               Opponent(id='2', name='Huy', isEliminated=False)],
                                    gameTurn=GameTurn(
                                        playerId='1', phase="a"),
                                    lastActivity='2023-03-27T13:30:00Z',
                                    winner=None)


class relocate(ServiceBase):
    @rpc(Unicode, _returns=GetGameStateResponse)
    def getGameState(self, gameId):
        print(gameId)
        return GetGameStateResponse(map=['0', '1', '2', '3', '4', '5', '6'],
                                    opponents=[Opponent(id='1', name='Hieu', isEliminated=False),
                                               Opponent(id='2', name='Huy', isEliminated=False)],
                                    gameTurn=GameTurn(
                                        playerId='1', phase="a"),
                                    lastActivity='2023-03-27T13:30:00Z',
                                    winner=None)
