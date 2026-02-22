import {_decorator, Component, RichText, AudioSource, director} from 'cc'

const {ccclass, property} = _decorator

// всё что начинается с собаки, это декораторы!!
@ccclass('DoorBellController')
export class DoorBellController extends Component {
  // property Говорит редактору: «Покажи это поле в Inspector»
  @property(RichText)
  counter: RichText | null = null // означает: либо CounterText, либо null

  @property(AudioSource)
  audioSource: AudioSource | null = null

  clickCooldownMs = 120
  private isBlocked = false
  private count = 0

  start() {
    this.#updateCounterText()
  }

  onBellPressed() {
    if (this.#isClickAllowed()) {
      this.count++
      this.#updateCounterText()
      this.#playBell()
      this.#checkCompletion()
    }
  }

  #isClickAllowed(): boolean {
    if (this.isBlocked) return false

    this.isBlocked = true
    this.scheduleOnce(() => this.isBlocked = false, this.clickCooldownMs / 1000)

    return true
  }

  #updateCounterText() {
    if (!this.counter) {
      console.error('ERROR: counter is not assigned in Inspector')
      return
    }

    this.counter.string = `<color=#0ffff>Счёт:</color>\n<color=#ff0000>${this.count}</color>`
  }

  #checkCompletion = () => {
    if (this.count === 5) {
      throw new Error()
      console.log('Счётчик достиг 5!')
      director.loadScene('Level2')
    }
  }

  #playBell() {
    if (!this.audioSource) return
    const clip = this.audioSource.clip
    if (!clip) return

    this.audioSource.playOneShot(clip)
  }
}


