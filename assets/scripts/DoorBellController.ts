import {_decorator, Component, RichText, AudioSource} from 'cc'

const {ccclass, property} = _decorator

// всё что начинается с собаки, это декораторы!!
@ccclass('DoorBellController')
export class DoorBellController extends Component {
  // property Говорит редактору: «Покажи это поле в Inspector»
  @property(RichText)
  counter: RichText | null = null // означает: либо CounterText, либо null

  @property(AudioSource)
  audioSource: AudioSource | null = null

  @property
  clickCooldownMs = 500

  private _lastClickAtMs = -999999
  private count = 0


  start() {
    this.#render()
  }

  onBellPressed() {
    const now = performance.now()

    if (now - this._lastClickAtMs < this.clickCooldownMs) return

    this._lastClickAtMs = now

    this.count++
    this.#playBell()
    this.#render()
  }

  #render() {
    if (!this.counter) {
      console.log('ERROR: counter is not assigned in Inspector')
      return
    }

    this.counter.string = `<color=#0ffff>Счёт:</color>\n<color=#ff0000>${this.count}</color>`
  }


  #playBell() {
    if (!this.audioSource) return
    const clip = this.audioSource.clip
    if (!clip) return

    this.audioSource.playOneShot(clip)
  }
}


