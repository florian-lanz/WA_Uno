package controllers

import akka.actor._
import akka.stream.Materializer
import com.google.inject.{Guice, Injector}
import de.htwg.se.uno.UnoModule
import de.htwg.se.uno.controller.controllerComponent.{ChooseColor, ControllerInterface, GameChanged, GameEnded, GameNotChanged, GameSizeChanged}
import play.api.Play.materializer
import play.api.libs.json._
import play.api.libs.streams.ActorFlow
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents, WebSocket}
import play.twirl.api.Html

import javax.inject.{Inject, Singleton}
import scala.swing.Reactor

@Singleton
class UnoController @Inject() (val controllerComponents: ControllerComponents) (implicit system: ActorSystem, mat: Materializer) extends BaseController {

  val injector: Injector = Guice.createInjector(new UnoModule)
  val controller: ControllerInterface = injector.getInstance(classOf[ControllerInterface])

  def index(): Action[AnyContent] = Action {
    Ok(print())
  }

  def newGame(size: Int): Action[AnyContent] = Action {
    controller.createGame(size)
    Ok(print())
  }

  def testGame(): Action[AnyContent] = Action {
    controller.createTestGame()
    Ok(print())
  }

  def set(card: String): Action[AnyContent] = Action {
    controller.set(card)
    Ok(print())
  }

  def setSpecial(card: String, color: String): Action[AnyContent] = Action {
    if(color.equals("blue")) {
      controller.set(card, 1)
    } else if (color.equals("green")) {
      controller.set(card, 2)
    } else if (color.equals("yellow")) {
      controller.set(card, 3)
    } else if (color.equals("red")) {
      controller.set(card, 4)
    } else {
      controller.set(card)
    }
    Ok(print())
  }

  def chooseColor(card: String): Action[AnyContent] = Action {
    controller.set(card)
    Ok(print())
  }

  def get(): Action[AnyContent] = Action {
    controller.get()
    Ok(print())
  }

  def doStep(): Action[AnyContent] = Action {
    if (controller.nextTurn()) {
      controller.controllerEvent("yourTurn")
      controller.publish(new GameNotChanged)
    } else {
      controller.enemy()
    }
    Ok(print())
  }

  def undo(): Action[AnyContent] = Action {
    controller.undo()
    Ok(print())
  }

  def redo(): Action[AnyContent] = Action {
    controller.redo()
    Ok(print())
  }

  def save(): Action[AnyContent] = Action {
    controller.save()
    Ok(print())
  }

  def load(): Action[AnyContent] = Action {
    controller.load()
    Ok(print())
  }

  def print(): Html = {
    views.html.uno(controller)
  }

  def about(): Action[AnyContent] = Action {
    Ok(views.html.index())
  }

  def gameToJsonAction(): Action[AnyContent] = Action {
    Ok(gameToJson())
  }

  def gameToJson(): String = {
    Json.prettyPrint(
      Json.obj(
        "game" -> Json.obj(
          "numOfPlayers" -> JsNumber(controller.getNumOfPlayers),
          "nextTurn" -> JsBoolean(controller.nextTurn()),
          "nextEnemy" -> JsNumber(controller.nextEnemy()),
          "gameText" -> JsString(controller.controllerEvent("idle")),
          "specialCard" -> JsString(controller.getHs2),
          "enemy1Cards" -> JsNumber(controller.getLength(0)),
          "enemy2Cards" -> JsNumber(controller.getLength(1)),
          "enemy3Cards" -> JsNumber(controller.getLength(2)),
          "openCardStack" -> JsString(controller.getCardText(3, 1)),
          "playerCards" -> JsArray(
            for {
              cardNumber <- 0 until controller.getLength(4)
            } yield {
              JsString(controller.getCardText(4, cardNumber))
            }
          ),
        )
      )
    )
  }


  def socket: WebSocket = WebSocket.accept[String, String] { request =>
    ActorFlow.actorRef { out =>
      println("Connect received")
      UnoWebSocketActorFactory.create(out)
    }
  }

  object UnoWebSocketActorFactory {
    def create(out: ActorRef): Props = {
      Props(new UnoWebSocketActor(out))
    }
  }

  class UnoWebSocketActor(out: ActorRef) extends Actor with Reactor {
    listenTo(controller)

    def receive: Receive = {
      case msg: String =>
        out ! gameToJson()
        println("Sent Json to Client"+ msg)
    }

    reactions += {
      case event: GameSizeChanged => sendJsonToClient
      case event: GameChanged => sendJsonToClient
      case event: GameNotChanged => sendJsonToClient
      case event: ChooseColor => sendJsonToClient
      case event: GameEnded => sendJsonToClient
    }

    def sendJsonToClient(): Unit = {
      println("Received event from Controller")
      out ! gameToJson()
    }
  }
}
