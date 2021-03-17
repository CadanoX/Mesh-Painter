import { Color } from 'three';

export default class Brush {
  constructor(size = 1, color = "", enabled = false, distance = 1) {
    this._size = size;
    this._color = new Color();
    this._color.set(color);
    this._enabled = enabled;
    this._distance = distance;
  }

  get size() { return this._size; }
  get color() { return this._color; }
  get enabled() { return this._enabled; }
  get distance() { return this._distance; }
  
  set size(size) { this._size = size; }
  set color(color) { this._color.set(color); }
  set enabled(enabled) { this._enabled = enabled; }
  set distance(distance) { this._distance = distance; }

  set(props) {
    if (typeof props === 'object' && props !== null)
      for (let prop in props)
        this[prop] = props[prop];
  }
}