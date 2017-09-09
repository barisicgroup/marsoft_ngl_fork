/**
 * @file Colormaker
 * @author Alexander Rose <alexander.rose@weirdbyte.de>
 * @private
 */

import { Vector3 } from 'three'
import * as chroma from 'chroma-js'

import { assignDefaults } from '../utils'
import { NumberArray, Partial } from '../types'
import Structure from '../structure/structure'
import Surface from '../surface/surface'
import Volume from '../surface/volume'
import AtomProxy from '../proxy/atom-proxy'
import BondProxy from '../proxy/bond-proxy'

interface ScaleParameters {
  scale: string|string[]
  mode: 'rgb'|'hsv'|'hsl'|'hsi'|'lab'|'hcl'
  domain: [number, number]
  value: string|number
  reverse: boolean
}

export interface ColormakerParameters extends ScaleParameters {
  structure?: Structure
  volume?: Volume
  surface?: Surface
}

/**
 * Class for making colors.
 * @interface
 */
abstract class Colormaker {
  parameters: ColormakerParameters
  atomProxy?: AtomProxy

  /**
   * Create a colormaker instance
   * @param  {ColormakerParameters} params - colormaker parameter
   */
  constructor (params: Partial<ColormakerParameters> = {}) {
    this.parameters = assignDefaults(params, {
      scale: 'uniform',
      mode: 'hcl',
      domain: [ 0, 1 ],
      value: 0xFFFFFF,
      reverse: false
    } as ColormakerParameters)

    if (this.parameters.structure) {
      this.atomProxy = this.parameters.structure.getAtomProxy()
    }
  }

  getScale (params: Partial<ScaleParameters> = {}) {
    const p = assignDefaults(params, this.parameters)

    if (p.scale === 'rainbow') {
      p.scale = [ 'red', 'orange', 'yellow', 'green', 'blue' ]
    } else if (p.scale === 'rwb') {
      p.scale = [ 'red', 'white', 'blue' ]
    }

    if (p.reverse) {
      p.domain = [ p.domain[1], p.domain[0] ]
    }

    return chroma
      .scale(p.scale as any)  // TODO
      .mode(p.mode)
      .domain(p.domain)
      .out('num' as any)  // TODO
  }

  /**
   * safe a color to an array
   * @param  {Integer} color - hex color value
   * @param  {Array|TypedArray} array - destination
   * @param  {Integer} offset - index into the array
   * @return {Array} the destination array
   */
  colorToArray (color: number, array: NumberArray = [], offset = 0) {
    array[ offset ] = (color >> 16 & 255) / 255
    array[ offset + 1 ] = (color >> 8 & 255) / 255
    array[ offset + 2 ] = (color & 255) / 255

    return array
  }

  atomColor? (atom: AtomProxy): number

  /**
   * safe a atom color to an array
   * @param  {AtomProxy} atom - atom to get color for
   * @param  {Array|TypedArray} array - destination
   * @param  {Integer} offset - index into the array
   * @return {Array} the destination array
   */
  atomColorToArray (atom: AtomProxy, array: NumberArray, offset: number) {
    return this.colorToArray(
      this.atomColor ? this.atomColor(atom) : 0x000000, array, offset
    )
  }

  /**
   * return the color for an bond
   * @param  {BondProxy} bond - bond to get color for
   * @param  {Boolean} fromTo - whether to use the first or second atom of the bond
   * @return {Integer} hex bond color
   */
  bondColor (bond: BondProxy, fromTo: boolean) {
    if (this.atomProxy && this.atomColor) {
      this.atomProxy.index = fromTo ? bond.atomIndex1 : bond.atomIndex2
      return this.atomColor(this.atomProxy)
    } else {
      return 0x000000
    }
  }

  /**
   * safe a bond color to an array
   * @param  {BondProxy} bond - bond to get color for
   * @param  {Boolean} fromTo - whether to use the first or second atom of the bond
   * @param  {Array|TypedArray} array - destination
   * @param  {Integer} offset - index into the array
   * @return {Array} the destination array
   */
  bondColorToArray (bond: BondProxy, fromTo: boolean, array: NumberArray, offset: number) {
    return this.colorToArray(
      this.bondColor(bond, fromTo), array, offset
    )
  }

  volumeColor? (index: number): number

  /**
   * safe a volume cell color to an array
   * @param  {Integer} index - volume cell index
   * @param  {Array|TypedArray} array - destination
   * @param  {Integer} offset - index into the array
   * @return {Array} the destination array
   */
  volumeColorToArray (index: number, array: NumberArray, offset: number) {
    return this.colorToArray(
      this.volumeColor ? this.volumeColor(index) : 0x000000, array, offset
    )
  }

  positionColor? (position: Vector3): number

  /**
   * safe a color for coordinates in space to an array
   * @param  {Vector3} coords - xyz coordinates
   * @param  {Array|TypedArray} array - destination
   * @param  {Integer} offset - index into the array
   * @return {Array} the destination array
   */
  positionColorToArray (coords: Vector3, array: NumberArray, offset: number) {
    return this.colorToArray(
      this.positionColor ? this.positionColor(coords) : 0x000000, array, offset
    )
  }
}

export default Colormaker