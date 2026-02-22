import {_decorator, Component, input, Input, EventTouch, EventMouse, Vec2, Vec3, UITransform, view, Node, find} from 'cc'

const {ccclass, property} = _decorator

@ccclass('PanZoom')
export class PanZoom extends Component {
  @property({tooltip: 'Минимальный зум'})
  minScale = 1

  @property({tooltip: 'Максимальный зум'})
  maxScale = 2.5

  @property({tooltip: 'Скорость зума колесом мыши'})
  wheelZoomSpeed = 0.12

  @property({type: Node, tooltip: 'Нода, по которой считаем границы (обычно Background)'})
  boundsTarget: Node | null = null

  #touches = new Map<number, Vec2>()
  #prevMid = new Vec2()
  #prevDist = 0

  onEnable() {
    input.on(Input.EventType.TOUCH_START, this.#onTouchStart, this)
    input.on(Input.EventType.TOUCH_MOVE, this.#onTouchMove, this)
    input.on(Input.EventType.TOUCH_END, this.#onTouchEnd, this)
    input.on(Input.EventType.TOUCH_CANCEL, this.#onTouchEnd, this)

    input.on(Input.EventType.MOUSE_WHEEL, this.#onWheel, this)
  }

  onDisable() {
    input.off(Input.EventType.TOUCH_START, this.#onTouchStart, this)
    input.off(Input.EventType.TOUCH_MOVE, this.#onTouchMove, this)
    input.off(Input.EventType.TOUCH_END, this.#onTouchEnd, this)
    input.off(Input.EventType.TOUCH_CANCEL, this.#onTouchEnd, this)

    input.off(Input.EventType.MOUSE_WHEEL, this.#onWheel, this)
  }

  start() {
    this.#applyClamp()
  }

  #onTouchStart(e: EventTouch) {
    const id = e.getID()
    const p = e.getUILocation()
    this.#touches.set(id, new Vec2(p.x, p.y))

    if (this.#touches.size === 2) {
      const [a, b] = [...this.#touches.values()]
      this.#prevMid = a.clone().add(b).multiplyScalar(0.5)
      this.#prevDist = a.clone().subtract(b).length()
    }
  }

  #onTouchMove(e: EventTouch) {
    const id = e.getID()
    const p = e.getUILocation()
    this.#touches.set(id, new Vec2(p.x, p.y))

    if (this.#touches.size === 1) {
      const delta = e.getUIDelta()
      this.node.position = this.node.position.add3f(delta.x, delta.y, 0)
      this.#applyClamp()
      return
    }

    if (this.#touches.size >= 2) {
      const [a, b] = [...this.#touches.values()]

      const mid = a.clone().add(b).multiplyScalar(0.5)
      const dist = a.clone().subtract(b).length()

      const midDelta = mid.clone().subtract(this.#prevMid)
      this.node.position = this.node.position.add3f(midDelta.x, midDelta.y, 0)

      if (this.#prevDist > 0) {
        const ratio = dist / this.#prevDist
        this.#setScale(this.node.scale.x * ratio)
      }

      this.#prevMid = mid
      this.#prevDist = dist

      this.#applyClamp()
    }
  }

  #onTouchEnd(e: EventTouch) {
    this.#touches.delete(e.getID())

    if (this.#touches.size < 2) {
      this.#prevDist = 0
    }
  }

  #onWheel(e: EventMouse) {
    const dy = e.getScrollY()
    const dir = dy > 0 ? 1 : -1
    const factor = 1 + this.wheelZoomSpeed * dir
    this.#setScale(this.node.scale.x * factor)
    this.#applyClamp()
  }

  #setScale(next: number) {
    const s = Math.max(this.minScale, Math.min(this.maxScale, next))
    this.node.setScale(s, s, 1)
  }

    #applyClamp() {
        const targetNode = this.boundsTarget ?? this.node
        const target = targetNode.getComponent(UITransform) ?? targetNode.getComponentInChildren(UITransform)
        if (!target) return

        const canvas = find('Canvas')
        const canvasTransform = canvas?.getComponent(UITransform)
        const viewSize = canvasTransform?.contentSize ?? view.getVisibleSize() // изменено: viewSize всегда определен

        const content = target.contentSize
        const scale = this.node.scale.x

        const w = content.width * scale
        const h = content.height * scale

        const halfViewW = viewSize.width * 0.5
        const halfViewH = viewSize.height * 0.5

        const maxX = Math.max(0, (w * 0.5) - halfViewW)
        const maxY = Math.max(0, (h * 0.5) - halfViewH)

        const p = this.node.position
        const clampedX = Math.max(-maxX, Math.min(maxX, p.x))
        const clampedY = Math.max(-maxY, Math.min(maxY, p.y))

        this.node.setPosition(new Vec3(clampedX, clampedY, p.z))
    }
}
