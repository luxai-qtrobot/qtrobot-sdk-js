/**
 * Plugin API IDL for QTrobot.
 * Edit this file and run `npm run gen` to regenerate src/api/camera.ts.
 */

import type { RpcEntry, StreamEntry } from './types'

export const PLUGINS_RPC: Record<string, RpcEntry> = {

  // ── Camera (RealSense) ───────────────────────────────────────────────────

  'camera.get_color_intrinsics': {
    service: '/camera/color/intrinsics',
    params: [],
    returns: 'object',
    doc: 'Get color camera intrinsic parameters (fx, fy, ppx, ppy, width, height, model, coeffs).',
  },

  'camera.get_depth_intrinsics': {
    service: '/camera/depth/intrinsics',
    params: [],
    returns: 'object',
    doc: 'Get depth camera intrinsic parameters (fx, fy, ppx, ppy, width, height, model, coeffs).',
  },

  'camera.get_depth_scale': {
    service: '/camera/depth/scale',
    params: [],
    returns: 'object',
    doc: 'Get the depth scale factor (metres per depth unit). Returns { scale: number }.',
  },
}

export const PLUGINS_STREAM: Record<string, StreamEntry> = {

  // ── Camera (RealSense) streams ───────────────────────────────────────────

  'camera.color': {
    topic: '/camera/color/image',
    direction: 'out',
    frameClass: 'ImageFrameRaw',
    queueSize: 2,
    doc: 'Outbound colour image stream from the RealSense camera (BGR, width × height × 3).',
  },

  'camera.depth': {
    topic: '/camera/depth/image',
    direction: 'out',
    frameClass: 'ImageFrameRaw',
    queueSize: 2,
    doc: 'Outbound depth image stream from the RealSense camera (16-bit, width × height).',
  },

  'camera.depth_aligned': {
    topic: '/camera/depth/aligned/image',
    direction: 'out',
    frameClass: 'ImageFrameRaw',
    queueSize: 2,
    doc: 'Outbound depth image aligned to the colour frame (16-bit, same resolution as colour).',
  },

  'camera.depth_color': {
    topic: '/camera/depth/color/image',
    direction: 'out',
    frameClass: 'ImageFrameRaw',
    queueSize: 2,
    doc: 'Outbound false-colour depth image stream (BGR, colourised for visualisation).',
  },

  'camera.gyro': {
    topic: '/camera/gyro',
    direction: 'out',
    frameClass: 'ListValue',
    queueSize: 2,
    doc: 'Outbound gyroscope stream from the RealSense IMU — [x, y, z] angular velocity (rad/s).',
  },

  'camera.acceleration': {
    topic: '/camera/acceleration',
    direction: 'out',
    frameClass: 'ListValue',
    queueSize: 2,
    doc: 'Outbound accelerometer stream from the RealSense IMU — [x, y, z] linear acceleration (m/s²).',
  },
}
