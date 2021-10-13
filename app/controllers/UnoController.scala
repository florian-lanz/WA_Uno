package controllers

import com.google.inject.{Guice, Injector}
import de.htwg.se.uno.UnoModule
import de.htwg.se.uno.controller.controllerComponent.ControllerInterface
import play.api.mvc.{Action, AnyContent, BaseController, ControllerComponents}

import javax.inject.{Inject, Singleton}

@Singleton
class UnoController @Inject() (val controllerComponents: ControllerComponents) extends BaseController {

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

  def print(): String = {
    s"${controller.gameToString}"
  }

}
