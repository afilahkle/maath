import {
  Vector2,
  Vector3,
  Vector4,
  Euler,
  Color,
  Matrix4,
  Quaternion,
  Spherical,
  ColorRepresentation,
} from "three";
import { deltaAngle } from "./misc";

/**
 * Rounded square wave easing
 */
export const rsqw = (t: number, delta = 0.01, a = 1, f = 1 / (2 * Math.PI)) =>
  (a / Math.atan(1 / delta)) * Math.atan(Math.sin(2 * Math.PI * t * f) / delta);

/**
 * Exponential easing
 */
export const exp = (t: number) =>
  1 / (1 + t + 0.48 * t * t + 0.235 * t * t * t);

/**
 * Damp, based on Game Programming Gems 4 Chapter 1.10
 */
export function damp(
  /** The object */
  current: { [key: string]: any },
  /** The key to animate */
  prop: string,
  /** To goal value */
  target: number,
  /** Approximate time to reach the target. A smaller value will reach the target faster. */
  smoothTime = 0.25,
  /** Frame delta, for refreshrate independence */
  delta = 0.01,
  /** Optionally allows you to clamp the maximum speed. If smoothTime is 0.25s and looks OK
   *  going between two close points but not for points far apart as it'll move very rapid,
   *  then a maxSpeed of e.g. 1 which will clamp the speed to 1 unit per second, it may now
   *  take much longer than smoothTime to reach the target if it is far away. */
  maxSpeed = Infinity,
  /** Easing function */
  easing = exp,
  /** End of animation precision */
  eps = 0.001
) {
  const vel = "velocity_" + prop;
  if (current.__damp === undefined) current.__damp = {};
  if (current.__damp[vel] === undefined) current.__damp[vel] = 0;

  if (Math.abs(current[prop] - target) <= eps) {
    current[prop] = target;
    return false;
  }

  smoothTime = Math.max(0.0001, smoothTime);
  const omega = 2 / smoothTime;
  const t = easing(omega * delta);
  let change = current[prop] - target;
  const originalTo = target;
  // Clamp maximum maxSpeed
  const maxChange = maxSpeed * smoothTime;
  change = Math.min(Math.max(change, -maxChange), maxChange);
  target = current[prop] - change;
  const temp = (current.__damp[vel] + omega * change) * delta;
  current.__damp[vel] = (current.__damp[vel] - omega * temp) * t;
  let output = target + (change + temp) * t;
  // Prevent overshooting
  if (originalTo - current[prop] > 0.0 === output > originalTo) {
    output = originalTo;
    current.__damp[vel] = (output - originalTo) / delta;
  }
  current[prop] = output;
  return true;
}

/**
 * DampAngle, based on Game Programming Gems 4 Chapter 1.10
 */
export function dampAngle(
  current: { [key: string]: any },
  prop: string,
  target: number,
  smoothTime?: number,
  delta?: number,
  maxSpeed?: number,
  easing?: (t: number) => number,
  eps?: number
) {
  return damp(
    current,
    prop,
    current[prop] + deltaAngle(current[prop], target),
    smoothTime,
    delta,
    maxSpeed,
    easing,
    eps
  );
}

let a: boolean, b: boolean, c: boolean, d: boolean;

/**
 * Vector2D Damp
 */
const v2d = /*@__PURE__*/ new Vector2();
export function damp2(
  current: Vector2,
  target: number | [x: number, y: number] | Vector2,
  smoothTime?: number,
  delta?: number,
  maxSpeed?: number,
  easing?: (t: number) => number,
  eps?: number
) {
  if (typeof target === "number") v2d.setScalar(target);
  else if (Array.isArray(target)) v2d.set(target[0], target[1]);
  else v2d.copy(target);
  a = damp(current, "x", v2d.x, smoothTime, delta, maxSpeed, easing, eps);
  b = damp(current, "y", v2d.y, smoothTime, delta, maxSpeed, easing, eps);
  return a || b;
}

/**
 * Vector3D Damp
 */
const v3d = /*@__PURE__*/ new Vector3();
export function damp3(
  current: Vector3,
  target: number | [x: number, y: number, z: number] | Vector3,
  smoothTime?: number,
  delta?: number,
  maxSpeed?: number,
  easing?: (t: number) => number,
  eps?: number
) {
  if (typeof target === "number") v3d.setScalar(target);
  else if (Array.isArray(target)) v3d.set(target[0], target[1], target[2]);
  else v3d.copy(target);
  a = damp(current, "x", v3d.x, smoothTime, delta, maxSpeed, easing, eps);
  b = damp(current, "y", v3d.y, smoothTime, delta, maxSpeed, easing, eps);
  c = damp(current, "z", v3d.z, smoothTime, delta, maxSpeed, easing, eps);
  return a || b || c;
}

/**
 * Vector4D Damp
 */
const v4d = /*@__PURE__*/ new Vector4();
export function damp4(
  current: Vector4,
  target: number | [x: number, y: number, z: number, w: number] | Vector4,
  smoothTime?: number,
  delta?: number,
  maxSpeed?: number,
  easing?: (t: number) => number,
  eps?: number
) {
  if (typeof target === "number") v4d.setScalar(target);
  else if (Array.isArray(target))
    v4d.set(target[0], target[1], target[2], target[3]);
  else v4d.copy(target);
  a = damp(current, "x", v3d.x, smoothTime, delta, maxSpeed, easing, eps);
  b = damp(current, "y", v3d.y, smoothTime, delta, maxSpeed, easing, eps);
  c = damp(current, "z", v3d.z, smoothTime, delta, maxSpeed, easing, eps);
  return a || b || c;
}

/**
 * Euler Damp
 */
const rot = /*@__PURE__*/ new Euler();
export function dampE(
  current: Euler,
  target: [x: number, y: number, z: number, order?: THREE.EulerOrder] | Euler,
  smoothTime?: number,
  delta?: number,
  maxSpeed?: number,
  easing?: (t: number) => number,
  eps?: number
) {
  if (Array.isArray(target))
    rot.set(target[0], target[1], target[2], target[3]);
  else rot.copy(target);
  a = dampAngle(current, "x", rot.x, smoothTime, delta, maxSpeed, easing, eps);
  b = dampAngle(current, "y", rot.y, smoothTime, delta, maxSpeed, easing, eps);
  c = dampAngle(current, "z", rot.z, smoothTime, delta, maxSpeed, easing, eps);
  return a || b || c;
}

/**
 * Color Damp
 */
const col = /*@__PURE__*/ new Color();
export function dampC(
  current: Color,
  target: ColorRepresentation | [r: number, g: number, b: number],
  smoothTime?: number,
  delta?: number,
  maxSpeed?: number,
  easing?: (t: number) => number,
  eps?: number
) {
  if (target instanceof Color) col.copy(target);
  else if (Array.isArray(target)) col.setRGB(target[0], target[1], target[2]);
  else col.set(target);
  a = damp(current, "r", col.r, smoothTime, delta, maxSpeed, easing, eps);
  b = damp(current, "g", col.g, smoothTime, delta, maxSpeed, easing, eps);
  c = damp(current, "b", col.b, smoothTime, delta, maxSpeed, easing, eps);
  return a || b || c;
}

/**
 * Quaternion Damp
 * https://gist.github.com/maxattack/4c7b4de00f5c1b95a33b
 * Copyright 2016 Max Kaufmann (max.kaufmann@gmail.com)
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */
const qt = /*@__PURE__*/ new Quaternion();
const v4result = /*@__PURE__*/ new Vector4();
const v4velocity = /*@__PURE__*/ new Vector4();
const v4error = /*@__PURE__*/ new Vector4();
export function dampQ(
  current: Quaternion,
  target: [x: number, y: number, z: number, w: number] | Quaternion,
  smoothTime?: number,
  delta?: number,
  maxSpeed?: number,
  easing?: (t: number) => number,
  eps?: number
) {
  const cur = current as Quaternion & { __damp: { [key: string]: number } };
  if (Array.isArray(target)) qt.set(target[0], target[1], target[2], target[3]);
  else qt.copy(target);

  const multi = current.dot(qt) > 0 ? 1 : -1;
  qt.x *= multi;
  qt.y *= multi;
  qt.z *= multi;
  qt.w *= multi;

  a = damp(current, "x", qt.x, smoothTime, delta, maxSpeed, easing, eps);
  b = damp(current, "y", qt.y, smoothTime, delta, maxSpeed, easing, eps);
  c = damp(current, "z", qt.z, smoothTime, delta, maxSpeed, easing, eps);
  d = damp(current, "w", qt.w, smoothTime, delta, maxSpeed, easing, eps);

  // smooth damp (nlerp approx)
  v4result.set(current.x, current.y, current.z, current.w).normalize();
  v4velocity.set(
    cur.__damp.velocity_x,
    cur.__damp.velocity_y,
    cur.__damp.velocity_z,
    cur.__damp.velocity_w
  );

  // ensure deriv is tangent
  v4error
    .copy(v4result)
    .multiplyScalar(v4velocity.dot(v4result) / v4result.dot(v4result));
  cur.__damp.velocity_x -= v4error.x;
  cur.__damp.velocity_y -= v4error.y;
  cur.__damp.velocity_z -= v4error.z;
  cur.__damp.velocity_w -= v4error.w;

  current.set(v4result.x, v4result.y, v4result.z, v4result.w);
  return a || b || c || d;
}

/**
 * Spherical Damp
 */
const spherical = /*@__PURE__*/ new Spherical();
export function dampS(
  current: Spherical,
  target: [radius: number, phi: number, theta: number] | Spherical,
  smoothTime?: number,
  delta?: number,
  maxSpeed?: number,
  easing?: (t: number) => number,
  eps?: number
) {
  if (Array.isArray(target)) spherical.set(target[0], target[1], target[2]);
  else spherical.copy(target);
  a = damp(
    current,
    "radius",
    spherical.radius,
    smoothTime,
    delta,
    maxSpeed,
    easing,
    eps
  );
  b = dampAngle(
    current,
    "phi",
    spherical.phi,
    smoothTime,
    delta,
    maxSpeed,
    easing,
    eps
  );
  c = dampAngle(
    current,
    "theta",
    spherical.theta,
    smoothTime,
    delta,
    maxSpeed,
    easing,
    eps
  );
  return a || b || c;
}

/**
 * Matrix4 Damp
 */
const mat = /*@__PURE__*/ new Matrix4();
const mPos = /*@__PURE__*/ new Vector3();
const mRot = /*@__PURE__*/ new Quaternion();
const mSca = /*@__PURE__*/ new Vector3();
export function dampM(
  current: Matrix4,
  target:
    | [
        n11: number,
        n12: number,
        n13: number,
        n14: number,
        n21: number,
        n22: number,
        n23: number,
        n24: number,
        n31: number,
        n32: number,
        n33: number,
        n34: number,
        n41: number,
        n42: number,
        n43: number,
        n44: number
      ]
    | Matrix4,
  smoothTime?: number,
  delta?: number,
  maxSpeed?: number,
  easing?: (t: number) => number,
  eps?: number
) {
  const cur = current as Matrix4 & {
    __damp: {
      position: Vector3;
      rotation: Quaternion;
      scale: Vector3;
    };
  };
  if (cur.__damp === undefined) {
    cur.__damp = {
      position: new Vector3(),
      rotation: new Quaternion(),
      scale: new Vector3(),
    };
    current.decompose(
      cur.__damp.position,
      cur.__damp.rotation,
      cur.__damp.scale
    );
  }

  if (Array.isArray(target)) mat.set(...target);
  else mat.copy(target);
  mat.decompose(mPos, mRot, mSca);

  a = damp3(
    cur.__damp.position,
    mPos,
    smoothTime,
    delta,
    maxSpeed,
    easing,
    eps
  );
  b = dampQ(
    cur.__damp.rotation,
    mRot,
    smoothTime,
    delta,
    maxSpeed,
    easing,
    eps
  );
  c = damp3(cur.__damp.scale, mSca, smoothTime, delta, maxSpeed, easing, eps);
  current.compose(cur.__damp.position, cur.__damp.rotation, cur.__damp.scale);
  return a || b || c;
}
