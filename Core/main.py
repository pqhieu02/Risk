from spyne.application import Application
from spyne.protocol.soap import Soap11
from spyne.util.wsgi_wrapper import WsgiMounter

from controller.GameplayControllers import getGameStateController

if __name__ == '__main__':
    from wsgiref.simple_server import make_server

    getGameStateController = Application([getGameStateController],
                                         tns='spyne.examples.hello.soap',
                                         in_protocol=Soap11(validator='soft'),
                                         out_protocol=Soap11())
    wsgiMounter = WsgiMounter({
        'getGameState': getGameStateController,
    })

    server = make_server('127.0.0.1', 8000,
                         wsgiMounter)

    print("listening to http://127.0.0.1")
    print("wsdl is at: http://localhost:8000/?wsdl")
    server.serve_forever()
